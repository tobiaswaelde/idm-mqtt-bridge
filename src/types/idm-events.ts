import { StatsType } from './idm-cmd';
import { IdmHeatpump } from './idm-heatpump';
import { IdmInfo } from './idm-info';
import { IdmAmountOfHeatStats, IdmBaEnergyHpStats, IdmHeatpumpStats } from './idm-stats';

export type IdmEvents = {
	connected: void;
	disconnected: void;
	info: IdmInfo;
	heatpump: IdmHeatpump;
	stats:
		| { type: StatsType.Heatpump; data: IdmHeatpumpStats }
		| { type: StatsType.AmountOfHeat; data: IdmAmountOfHeatStats }
		| { type: StatsType.BaEnergyHp; data: IdmBaEnergyHpStats };
};
