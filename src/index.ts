import { ENV } from './config/env';
import { logger } from './config/logger';
import { TOPICS } from './config/topics';
import { MyIdm } from './services/idm';
import { mqttClient } from './services/mqtt';
import { IdmCommand, StatsType } from './types/idm-cmd';
import { getJsonPaths } from './util/json';

function publish(topic: string, data: any) {
	if (ENV.PUSH_JSON_OBJECT) {
		mqttClient.publish(topic, JSON.stringify(data));
	}

	if (ENV.PUSH_JSON_KEYS) {
		const paths = getJsonPaths(data, '/');
		for (const [path, value] of paths) {
			mqttClient.publish(`${topic}/${path}`, value);
		}
	}
}

const idm = new MyIdm(ENV.IDM_HOST, ENV.IDM_PIN);

//#region IDM to MQTT
idm.on('connected', () => {
	mqttClient.publish(TOPICS.IDM.ONLINE, 'true');
});
idm.on('disconnected', () => {
	mqttClient.publish(TOPICS.IDM.ONLINE, 'false');
});
idm.on('info', (data) => {
	publish(TOPICS.IDM.INFO, data);
});
idm.on('heatpump', (data) => {
	publish(TOPICS.IDM.HEATPUMP, data);
	// publish individual HKs
	for (let i = 0; i < data.hk.length; i++) {
		publish(`${TOPICS.IDM.HEATPUMP}/hk/${i}`, data.hk[i]);
	}
});
idm.on('stats', ({ type, data }) => {
	switch (type) {
		case StatsType.Heatpump:
			publish(TOPICS.IDM.STATS.HEATPUMP, data);
			break;
		case StatsType.AmountOfHeat:
			publish(TOPICS.IDM.STATS.AMOUNTOFHEAT, data);
			break;
		case StatsType.BaEnergyHp:
			publish(TOPICS.IDM.STATS.BAENERGYHP, data);
			break;
	}
});
//#endregion

//#region MQTT to IDM
mqttClient.on('message', async (topic, payload) => {
	const msg = payload.toString();
	if (!msg || msg === '') return;
	if (topic !== TOPICS.MQTT.CMD) return;

	logger.scope('MQTT').log(`[RX] ${JSON.stringify(JSON.parse(msg))}`);

	const cmd: IdmCommand = JSON.parse(msg) satisfies IdmCommand;
	await idm.handleCommand(cmd);

	logger.scope('MQTT').info('Reset command');
	mqttClient.publish(TOPICS.MQTT.CMD, '');
});

mqttClient.subscribe(TOPICS.MQTT.CMD);
//#endregion
