# IDM-MQTT Bridge

![Docker Build](https://github.com/tobiaswaelde/idm-mqtt-bridge/actions/workflows/test-build.yml/badge.svg)
![Docker Deploy](https://github.com/tobiaswaelde/idm-mqtt-bridge/actions/workflows/deploy.yml/badge.svg)
![Version](https://img.shields.io/github/v/tag/tobiaswaelde/idm-mqtt-bridge?label=version)

A lightweight Node.js service that connects your [IDM-Energie](https://www.idm-energie.at/) control with MQTT.

It polls MyIDM for **info** and **heat pump data**, publishes updates to MQTT, and lets you send commands via MQTT to control your heat pump (e.g., setting the warm water temperature or requesting stats).

## Table Of Contents <!-- omit in toc -->
- [✨ Features](#-features)
- [⚙️ Configuration](#️-configuration)
  - [🌍 Environment Variables](#-environment-variables)
- [🚀 Deployment](#-deployment)
  - [🐋 Docker](#-docker)
- [📡 API](#-api)
  - [Commands](#commands)
- [📦 Changelog](#-changelog)


## ✨ Features
- 🔌 Simple bridge between **MyIDM** and **MQTT**
- 📡 Publishes:
  - Info → `${TOPIC}/info`
  - Heat pump data → `${TOPIC}/heatpump`
  - Stats
    - Runtime → `${TOPIC}/stats/heatpump`
    - Amount of heat → `${TOPIC}/stats/amountofheat`
    - Electrical consumption → `${TOPIC}/stats/baenergyhp`
- 🕒 Adaptive polling:
  - Polls at `IDM_POLL_INTERVAL` while healthy
  - Falls back to `IDM_TIMEOUT_DURATION` polling if the IDM control is unreachable for `IDM_TIMEOUT`
- 🎛️ Supports MQTT commands:
  - `push_info`, `push_heatpump`, `push_stats`, `set_warmwater_temp`
- 🐳 Ready-to-use **Docker image**


## ⚙️ Configuration

### 🌍 Environment Variables
| Variable             | Type   | Required | Default Value | Description                                                          |
| -------------------- | ------ | -------- | ------------- | -------------------------------------------------------------------- |
| MQTT_PROTOCOL        | string | no       | `'mqtt'`      | Protocol for MQTT connection                                         |
| MQTT_HOST            | string | yes      |               | MQTT broker hostname or IP                                           |
| MQTT_PORT            | number | no       | `1883`        | MQTT broker port                                                     |
| MQTT_USERNAME        | string | yes      |               | MQTT username                                                        |
| MQTT_PASSWORD        | string | yes      |               | MQTT password                                                        |
| MQTT_CLIENTID        | string | no       | *random UUID* | MQTT client ID                                                       |
| IDM_HOST             | string | yes      |               | Hostname or IP of the IDM control (e.g., `http://192.168.1.50`)      |
| IDM_PIN              | string | yes      |               | Pin for the IDM control                                              |
| IDM_TOPIC            | string | yes      |               | MQTT topic prefix for IDM messages                                   |
| IDM_POLL_INTERVAL    | number | no       | `1000`        | Poll interval in ms for IDM messages. Set to `0` to disable polling. |
| IDM_TIMEOUT          | number | no       | `30000`       | Time (ms) of consecutive failures before increasing poll interval    |
| IDM_TIMEOUT_DURATION | number | no       | `30000`       | Poll interval in ms after timeout                                    |
| PUSH_JSON_OBJECT     | bool   | no       | `true`        | If `true`, publish IDM info/heatpump/stats as full JSON objects      |
| PUSH_JSON_KEYS       | bool   | no       | `true`        | If `true`, also publish individual JSON keys as MQTT topics          |


## 🚀 Deployment

### 🐋 Docker

```yaml
services:
  idm-mqtt-bridge:
    container_name: idm-mqtt-bridge
    image: ghcr.io/tobiaswaelde/idm-mqtt-bridge
    restart: always
    environment:
      MQTT_HOST: 192.168.1.10
      MQTT_PORT: 1883
      MQTT_USERNAME: username
      MQTT_PASSWORD: password
      IDM_HOST: 192.168.178.11
      IDM_PIN: 12345
      TOPIC: idm
```


## 📡 API

### Commands

Commands are sent via the MQTT topic:

```bash
${TOPIC}/cmd
```

After a command is executed, the value is reset to `null`.

Available commands:
- [Push Info](#push-info) → publish `${TOPIC}/info`
- [Push Heatpump](#push-heatpump) → publish `${TOPIC}/heatpump`
- [Push Heatpump Stats](#push-heatpump-stats) → publish `${TOPIC}/stats/heatpump`
- [Push Amout Of Heat Stats](#push-amout-of-heat-stats) → publish `${TOPIC}/stats/amountofheat`
- [Push Electrical Power Consumption Stats](#push-electrical-power-consumption-stats) → publish `${TOPIC}/stats/baenergyhp`
- [Set Warm Water Temperature](#set-warm-water-temperature) → update warm water target

#### Push Info
Fetch information about the heatpump and publish to `${TOPIC}/info`.

##### Command
```jsonc
// ${TOPIC}/cmd
{ "cmd": "push_info" }
```

##### Response
```jsonc
// ${TOPIC}/info
{
  "authenticationMode": { "isEnabled": true, "name": "Inbetriebnahme" },
  "datetime": "2025-09-10 11:44:18",
  "header": { "myIDM": 1, "myIDMID": 106466, "network": 1 },
  "holiday_freshwater": 1,
  "holidays_left": 0,
  "hwt": "MMI23",
  "mod_bv": [{ "id": 1, "value": 0 }],
  "mod_energy": 1,
  "mod_heatpump": [ 0 ],
  "mod_sys_act": [ 1, 1, 1, 1, 1, 1 ],
  "mod_sys_cooling_configured": false,
  "mod_system": 1,
  "mode_sys": 1,
  "mode_sys_off": true,
  "out": "17.1",
  "outavg": "15°C/14.0h",
  "quickinfo": {
    "hk": [{
      "flow": { "act": "24.4" },
      "hcmode": 0,
      "mixing": 0,
      "mode": 1,
      "name": "HKA ",
      "pump": 0,
      "room": { "act": "22.9" },
      "type": 2
    }],
    "system": {
      "frwa1": "38.2",
      "frwa2": "40.5",
      "heat": "33.0",
      "hpact": 0,
      "hpin": "17.7",
      "hpout": "18.6",
      "src1": "16.0",
      "srcact": 0,
      "srcmode": 2
    }
  },
  "rules": { "1": 2, "2": 0, "3": 2, "4": 2, "5": 2, "6": 0 },
  "userlevel": 0,
  "weather": {
    "forecast1": {
      "date": "11.09.2025",
      "dayofweek": "DO",
      "sun": 17345,
      "sym_w50": 15,
      "temperature": { "act": 15, "max": 18, "min": 13 }
    },
    // ...
    "forecast6": {
      "date": "16.09.2025",
      "dayofweek": "DI",
      "sun": 16260,
      "sym_w50": 4,
      "temperature": { "act": 14, "max": 19, "min": 10 }
    },
    "today": {
      "date": "10.09.2025",
      "dayofweek": "Heute",
      "sun": 22061,
      "sym_w50": 4,
      "temperature": { "act": 17, "avg": "15°C/14.0h", "max": 20, "min": 11 }
    }
  },
  "weather_forecast": true
}
```

#### Push Heatpump
Fetch heatpump data and publish to `${TOPIC}/heatpump`.

##### Command
```jsonc
// ${TOPIC}/cmd
{ "cmd": "push_heatpump" }
```

##### Response
```jsonc
// ${TOPIC}/heatpump
{
  "circulation": {
    "edesc": "_CIRCULATION_PROGRAM",
    "index": 2,
    "pump": 0,
    "times": {
      "idle": {
        "def": 30,
        "id": "FW042",
        "increment": "5",
        "max": 240,
        "min": 0,
        "param": "FW042",
        "ptype": 0,
        "type": 0,
        "value": 40
      },
      "run": {
        "def": 4,
        "id": "FW041",
        "increment": "1",
        "max": 60,
        "min": 1,
        "param": "FW041",
        "ptype": 0,
        "type": 0,
        "value": 4
      }
    },
    "timetable": "000000000011000000000000000000000011000000000000,
    000000000011000000000000000000000011000000000000,
    000000000011000000000000000000000011000000000000,
    000000000000110000000000000000000011000000000000,
    000000000011000000000000000000000011000000000000,
    000000000000001100000000000000000011000000000000,
    000000000000001100000000000000000011000000000000"
  },
  "freshwater": {
    "edesc": "_HOTWATER_PROGRAM",
    "index": 1,
    "mode": 0,
    "mode_types": [ 2 ],
    "status": 0,
    "temperatures": {
      "desired": {
        "def": 46,
        "id": "FW030",
        "increment": "0.5",
        "max": 60,
        "min": 30,
        "param": "FW030",
        "ptype": 2,
        "type": 2,
        "value": 41.5
      },
      "diff": 0,
      "frwa1": "38.2",
      "frwa2": "40.5",
      "loadmax": {
        "def": 50,
        "id": "FW028",
        "increment": "1",
        "max": 60,
        "min": 37,
        "param": "FW028",
        "ptype": 0,
        "type": 0,
        "value": 41
      },
      "loadmin": {
        "def": 46,
        "id": "FW027",
        "increment": "1",
        "max": 41,
        "min": 30,
        "param": "FW027",
        "ptype": 0,
        "type": 0,
        "value": 37
      }
    },
    "timetable": "000000000000000000000000111100000000000000000000,
    000000000000000000000000111100000000000000000000,
    000000000000000000000000111100000000000000000000,
    000000000000000000000000111100000000000000000000,
    000000000000000000000000111100000000000000000000,
    000000000000000000000000111100000000000000000000,
    000000000000000000000000111100000000000000000000"
  },
  "hk": [
    {
      "edesc": "_HC_A_PROGRAM",
      "flow": {
        "hclimit": 0,
        "hcmode": 0,
        "mixing": 0,
        "mode": 1,
        "pump": 0,
        "temperatures": { "act": "24.4" }
      },
      "hk": "A",
      "index": 1,
      "mode": 1,
      "mode_types": [ 0, 1, 2, 3, 4 ],
      "name": "HKA ",
      "room": {
        "humidity": 10,
        "temperatures": { "act": "22.9" }
      },
      "temperatures": {
        "heat": {
          "eco": {
            "def": 18,
            "id": "HKA05",
            "increment": "0.1",
            "max": 25,
            "min": 10,
            "param": "HKA05",
            "ptype": 2,
            "type": 2,
            "value": 19.5
          },
          "normal": {
            "def": 22,
            "id": "HKA04",
            "increment": "0.1",
            "max": 30,
            "min": 15,
            "param": "HKA04",
            "ptype": 2,
            "type": 2,
            "value": 20.5
          }
        }
      },
      "timetable": "000000000000000011111111111111111111000000000000,
      000000000000000011111111111111111111000000000000,
      000000000000000011111111111111111111000000000000,
      000000000000000011111111111111111111000000000000,
      000000000000000011111111111111111111000000000000,
      000000000000000011111111111111111111000000000000,
      000000000000000011111111111111111111000000000000",
      "type": 2
    }
  ],
  "system": {
    "srcmode": 2,
    "sysmode": 0,
    "temperatures": {
      "heat": "32.9",
      "hpact": 0,
      "hpin": "17.7",
      "hpout": "18.6",
      "srcact": 0,
      "srcin": "16.0"
    }
  },
  "version": 1
}
```

#### Push Heatpump Stats
Fetch heatpump runtime stats and publish to `${TOPIC}/stats/heatpump`.

##### Command
```jsonc
// ${TOPIC}/cmd
{
  "cmd": "push_stats",
  "stats_type": "heatpump"
}
```

##### Response
```jsonc
// ${TOPIC}/stats/heatpump
{
  "data": {
    "daily": [
      {
        "index": 1,
        "name": "09.09",
        "sum": [ "0.1 h" ],
        "values": [[ 0, 0.06666667014360428, 0 ]]
      },
      {
        "index": 2,
        "name": "08.09",
        "sum": [ "0.0 h" ],
        "values": [[ 0, 0, 0 ]]
      },
      // ...
    ],
    "decimalsTotal": 0,
    "monthly": [
      {
        "index": 0,
        "name": "2025.09",
        "sum": [ "3.7 h" ],
        "values": [[ 0, 3.683333396911621, 0 ]]
      },
      {
        "index": 1,
        "name": "2025.08",
        "sum": [ "12.9 h" ],
        "values": [[ 0, 12.866944313049316, 0 ]]
      },
      // ...
    ],
    "sumToday": "0 h",
    "sumTotal": "3457 h",
    "total": [
      {
        "color": "#bc3f3c",
        "name": "Heizen",
        "value": 3048.730712890625
      },
      {
        "color": "#6C931B",
        "name": "Warmwasser",
        "value": 371.19805908203125
      },
      {
        "color": "rgb(232, 215, 62)",
        "name": "Abtauung",
        "value": 37.45333480834961
      }
    ],
    "unitTotal": "h",
    "yearly": [
      {
        "index": 0,
        "name": "2025",
        "sum": [ "1119 h" ],
        "values": [[ 967.999755859375, 139.61972045898438, 11.15000057220459 ]]
      },
      {
        "index": 1,
        "name": "2024",
        "sum": [ "2052 h" ],
        "values": [[ 1822.7806396484375, 206.73916625976562, 22.419723510742188 ]]
      },
      {
        "index": 2,
        "name": "2023",
        "sum": [ "287 h" ],
        "values": [[ 257.9502868652344, 24.83916664123535, 3.8836112022399902 ]]
      }
    ]
  },
  "items": [
    [
      { "color": "#bc3f3c", "name": "Heizen" },
      { "color": "#6C931B", "name": "Warmwasser" },
      { "color": "rgb(232, 215, 62)", "name": "Abtauung" }
    ]
  ],
  "overview_items": {
    "active_today": [[ 1, 1, 1 ], []],
    "active_total": [ 1, 1, 1 ]
  },
  "version": 2
}
```

#### Push Amout Of Heat Stats
Fetch amount of heat stats and publish to `${TOPIC}/stats/amountofheat`.

##### Command
```jsonc
// ${TOPIC}/cmd
{
  "cmd": "push_stats",
  "stats_type": "amountofheat"
}
```

##### Response
```jsonc
// ${TOPIC}/stats/amountofheat
{
  "data": {
    "daily": [
      {
        "index": 1,
        "name": "09.09",
        "sum": [ "0.0 kWh" ],
        "values": [[ 0, 0 ]]
      },
      {
        "index": 2,
        "name": "08.09",
        "sum": [ "0.0 kWh" ],
        "values": [[ 0, 0 ]]
      },
      // ...
    ],
    "decimalsTotal": 1,
    "monthly": [
      {
        "index": 0,
        "name": "2025.09",
        "sum": [ "43.9 kWh" ],
        "values": [[ 0, 43.944091796875 ]]
      },
      {
        "index": 1,
        "name": "2025.08",
        "sum": [ "147 kWh" ],
        "values": [[ 0, 146.9699249267578 ]]
      },
      // ...
    ],
    "sumToday": "0 kWh",
    "sumTotal": "20567 kWh",
    "total": [
      {
        "color": "#bc3f3c",
        "name": "Heizen",
        "value": 16359.73828125
      },
      {
        "color": "#6C931B",
        "name": "Warmwasser",
        "value": 3787.464111328125
      },
      {
        "color": "rgb(232, 215, 62)",
        "name": "Abtauung",
        "value": 419.9200744628906
      }
    ],
    "unitTotal": "kWh",
    "yearly": [
      {
        "index": 0,
        "name": "2025",
        "sum": [ "6787 kWh", "123 kWh" ],
        "values": [
          [ 5343.10986328125, 1443.4239501953125 ],
          [ 123.10001373291016 ]
        ]
      },
      {
        "index": 1,
        "name": "2024",
        "sum": [ "11930 kWh", "256 kWh" ],
        "values": [
          [ 9769.140625, 2161.078857421875 ],
          [ 255.78993225097656 ]
        ]
      },
      {
        "index": 2,
        "name": "2023",
        "sum": [ "1430 kWh", "41 kWh" ],
        "values": [
          [ 1247.489990234375, 182.9600067138672 ],
          [ 41.029998779296875 ]
        ]
      }
    ]
  },
  "items": [
    [
      { "color": "#bc3f3c", "name": "Heizen" },
      { "color": "#6C931B", "name": "Warmwasser" }
    ],
    [
      { "color": "rgb(232, 215, 62)", "name": "Abtauung" }
    ]
  ],
  "overview_items": {
    "active_today": [[ 1, 1 ], [ 1 ]],
    "active_total": [ 1, 1, 1]
  },
  "version": 2
}
```

#### Push Electrical Power Consumption Stats
Fetch electrical power consumption stats and publish to `${TOPIC}/stats/baenergyhp`.

##### Command
```jsonc
// ${TOPIC}/cmd
{
  "cmd": "push_stats",
  "stats_type": "baenergyhp"
}
```

##### Response
```jsonc
// ${TOPIC}/stats/baenergyhp
{
  "data": {
    "daily": [
      {
        "index": 1,
        "name": "09.09",
        "sum": [ "0.0 kWh" ],
        "values": [[ 0, 0, 0 ]]
      },
      {
        "index": 2,
        "name": "08.09",
        "sum": [ "0.0 kWh" ],
        "values": [[ 0, 0, 0]]
      },
      // ...
    ],
    "decimalsTotal": 1,
    "monthly": [
      {
        "index": 0,
        "name": "2025.09",
        "sum": [ "11.1 kWh" ],
        "values": [[ 0, 11.091032981872559, 0]]
      },
      {
        "index": 1,
        "name": "2025.08",
        "sum": [ "35.7 kWh" ],
        "values": [[ 0, 35.6788330078125, 0]]
      },
      // ...
    ],
    "sumTotal": "5256 kWh",
    "total": [
      {
        "color": "#bc3f3c",
        "name": "Heizen",
        "value": 4060.91064453125
      },
      {
        "color": "#6C931B",
        "name": "Warmwasser",
        "value": 1128.569091796875
      },
      {
        "color": "rgb(232, 215, 62)",
        "name": "Abtauung",
        "value": 66.73004913330078
      }
    ],
    "unitTotal": "kWh",
    "yearly": [
      {
        "index": 0,
        "name": "2025",
        "sum": [ "1806 kWh"],
        "values": [[ 1351.330078125, 436.12994384765625, 18.259994506835938 ]]
      },
      {
        "index": 1,
        "name": "2024",
        "sum": [ "3030 kWh" ],
        "values": [[ 2373.10986328125, 615.2301025390625, 41.54999923706055 ]]
      },
      {
        "index": 2,
        "name": "2023",
        "sum": [ "421 kWh" ],
        "values": [[ 336.4699401855469, 77.20999908447266, 6.920000076293945 ]]
      }
    ]
  },
  "items": [[
    { "color": "#bc3f3c", "name": "Heizen" },
    { "color": "#6C931B", "name": "Warmwasser" },
    { "color": "rgb(232, 215, 62)", "name": "Abtauung" }
  ]],
  "version": 2
}
```

#### Set Warm Water Temperature
Set desired warmwater temperature, then fetch heatpump data & publish to `${TOPIC}/heatpump`

##### Command
```jsonc
// ${TOPIC}/cmd
{
  "cmd": "set_warmwater_temp",
  "value": 40
}
```


## 📦 Changelog

See the [CHANGELOG.md](./CHANGELOG.md) for details on what’s new in recent versions.