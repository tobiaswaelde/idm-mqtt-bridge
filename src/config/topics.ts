import { ENV } from './env';

export const TOPICS = {
	IDM: {
		ONLINE: `${ENV.IDM_TOPIC}/online` as const,
		INFO: `${ENV.IDM_TOPIC}/info` as const,
		HEATPUMP: `${ENV.IDM_TOPIC}/heatpump` as const,
		STATS: {
			HEATPUMP: `${ENV.IDM_TOPIC}/stats/heatpump` as const,
			AMOUNTOFHEAT: `${ENV.IDM_TOPIC}/stats/amountofheat` as const,
			BAENERGYHP: `${ENV.IDM_TOPIC}/stats/baenergyhp` as const,
		},
	},
	MQTT: {
		CMD: `${ENV.IDM_TOPIC}/cmd` as const,
	},
};
