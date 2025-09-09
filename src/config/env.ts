import { cleanEnv, str, num, bool } from 'envalid';
import dotenv from 'dotenv';
import * as path from 'node:path';
import { logger } from './logger';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

export const ENV = cleanEnv(process.env, {
	MQTT_PROTOCOL: str({ default: 'mqtt', desc: 'Protocol for MQTT connection' }),
	MQTT_HOST: str({ desc: 'MQTT broker hostname or IP' }),
	MQTT_PORT: num({ default: 1883, desc: 'MQTT broker port' }),
	MQTT_USERNAME: str({ desc: 'MQTT username' }),
	MQTT_PASSWORD: str({ desc: 'MQTT password' }),
	MQTT_CLIENTID: str({
		default: crypto.randomUUID(),
		devDefault: crypto.randomUUID(),
		desc: 'MQTT client ID',
	}),
	IDM_HOST: str({ desc: 'Hostname or IP of the IDM control (e.g., `http://192.168.1.50`)' }),
	IDM_PIN: str({ desc: 'Pin for the IDM control' }),
	IDM_POLL_INTERVAL: num({ default: 1000, desc: 'Poll interval in ms for IDM messages' }),
	WLED_TIMEOUT: num({
		default: 30000,
		desc: 'Time (ms) of consecutive failures before increasing poll interval',
	}),
	WLED_TIMEOUT_DURATION: num({
		default: 30000,
		desc: 'Poll interval in ms after timeout',
	}),
	TOPIC: str({ desc: 'MQTT topic prefix for IDM messages' }),
});

// log environment variables to console
if (ENV.isDev) {
	for (const key of Object.keys(ENV)) {
		logger.scope('ENV').debug(`${key} = ${String((ENV as any)[key])}`);
	}
}
