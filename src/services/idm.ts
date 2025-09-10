import axios, { AxiosInstance } from 'axios';
import { IdmEvents } from '../types/idm-events';
import { TypedEmitter } from '../util/typed-emitter';
import { ENV } from '../config/env';
import { Command, IdmCommand, StatsType } from '../types/idm-cmd';
import { logger } from '../config/logger';
import { IdmInfo } from '../types/idm-info';
import { IdmHeatpump } from '../types/idm-heatpump';
import { IdmAmountOfHeatStats, IdmBaEnergyHpStats, IdmHeatpumpStats } from '../types/idm-stats';

export class MyIdm extends TypedEmitter<IdmEvents> {
	private api: AxiosInstance;
	private cookie: string | undefined;
	private csrfToken: string | undefined;

	private pollTimer: NodeJS.Timeout | null = null;
	private pollDelay: number = ENV.IDM_POLL_INTERVAL;
	private firstFailAt: number | null = null; // timestamp of first failure

	private isProcessing: boolean = false;

	constructor(host: string, private pin: string) {
		super();

		this.api = axios.create({
			baseURL: host,
		});

		// modify requests to include cookies and CSRF token
		this.api.interceptors.request.use((cfg) => {
			cfg.withCredentials = true;
			cfg.headers.Cookie = `MYIDM=${this.cookie}`;
			cfg.headers['Csrf-Token'] = this.csrfToken;
			return cfg;
		});

		this.signin();

		// start polling
		if (ENV.IDM_POLL_INTERVAL > 0) {
			this.startPolling();
		}
	}

	//#region authentication
	private async getCookie() {
		const res = await this.api.get('/enterpin.html');
		const cookie: string = res.config.headers.MYIDM;
		this.cookie = cookie;
		return cookie;
	}

	private async signin() {
		try {
			await this.getCookie();

			const data = new FormData();
			data.append('pin', this.pin);
			const res = await this.api.post<string>('/index.php', data);

			const csrfIndex = res.data.indexOf('csrf_token');
			this.csrfToken = res.data.substring(csrfIndex + 12, csrfIndex + 25);

			this.emit('connected', undefined);
		} catch (err) {
			logger.scope('IDM').error('Error signing in', err);
			this.emit('disconnected', undefined);
		}
	}
	//#endregion

	//#region polling
	private startPolling() {
		if (this.pollTimer) clearTimeout(this.pollTimer);

		let delay = this.pollDelay;

		// if we've been failing for longer than the timeout, slow down
		if (this.firstFailAt && Date.now() - this.firstFailAt >= ENV.WLED_TIMEOUT) {
			delay = ENV.WLED_TIMEOUT_DURATION;
		}

		this.pollTimer = setTimeout(async () => {
			try {
				await this.getInfo();
				await this.getHeatpump();

				// successful → reset attempts + restore normal delay
				if (this.firstFailAt) {
					logger.scope('WLED').info('Connection restored, resetting delay');
				}
				this.firstFailAt = null;
				this.pollDelay = ENV.IDM_POLL_INTERVAL;

				this.emit('connected', undefined);
			} catch (err) {
				if (!this.firstFailAt) {
					this.firstFailAt = Date.now();
				}
				this.emit('disconnected', undefined);
				logger
					.scope('WLED')
					.warn(`Polling failed, first fail at ${new Date(this.firstFailAt).toISOString()}`);
			}

			// schedule next poll
			this.startPolling();
		}, delay);
	}
	//#endregion
	//#region command
	public async handleCommand(command: IdmCommand) {
		if (this.isProcessing) {
			logger.scope('IDM').warn('Already processing a command, ignoring new command.');
			return;
		}

		logger.scope('IDM').start(`Handling command "${command.cmd}"...`);
		this.isProcessing = true;
		try {
			switch (command.cmd) {
				case Command.PushInfo:
					await this.getInfo();
					break;
				case Command.PushHeatpump:
					await this.getHeatpump();
					break;
				case Command.PushStats:
					await this.getStats(command.stats_type);
					break;
				case Command.SetWarmwaterTemp:
					await this.setWarmwaterTemp(command.value);
					break;
			}
		} catch (err) {
			this.emit('disconnected', undefined);
		} finally {
			this.isProcessing = false;
		}

		logger.scope('IDM').success(`Command "${command.cmd}" executed.`);
	}
	//#endregion

	//#region getters
	private async getInfo() {
		const res = await this.api.get<IdmInfo>('/data/info.php');
		this.emit('info', res.data);
	}

	private async getHeatpump() {
		const res = await this.api.get<IdmHeatpump>('/data/heatpump.php');
		this.emit('heatpump', res.data);
	}

	private async getStats(statsType: StatsType) {
		switch (statsType) {
			case StatsType.Heatpump:
				await this.getHeatpumpStats();
				break;
			case StatsType.AmountOfHeat:
				await this.getAmountOfHeatStats();
				break;
			case StatsType.BaEnergyHp:
				await this.getBaEnergyHpStats();
				break;
		}
	}
	private async getHeatpumpStats() {
		const res = await this.api.get<IdmHeatpumpStats>('/data/statistics.php?type=heatpump');
		this.emit('stats', { type: StatsType.Heatpump, data: res.data });
	}
	private async getAmountOfHeatStats() {
		const res = await this.api.get<IdmAmountOfHeatStats>('/data/statistics.php?type=amountofheat');
		this.emit('stats', { type: StatsType.AmountOfHeat, data: res.data });
	}
	private async getBaEnergyHpStats() {
		const res = await this.api.get<IdmBaEnergyHpStats>('/data/statistics.php?type=baenergyhp');
		this.emit('stats', { type: StatsType.BaEnergyHp, data: res.data });
	}
	//#endregion
	//#region setters
	private async setWarmwaterTemp(value: number) {
		const res = await this.api.put(`/data/heatpump.php`, {
			freshwater: {
				mode: 0,
				temperatures: {
					desired: {
						value: value,
					},
				},
			},
		});
		logger.scope('IDM').success(`Set warm water temperature to ${value}°C.`, res.data);

		await this.getHeatpump();
	}
	//#endregion
}
