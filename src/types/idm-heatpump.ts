type CirculationTime = {
	def: number;
	id: string;
	increment: string;
	max: number;
	min: number;
	param: string;
	ptype: number;
	type: number;
	value: number;
};

type CirculationTimes = {
	idle: CirculationTime;
	run: CirculationTime;
};

type Circulation = {
	edesc: string;
	index: number;
	pump: number;
	times: CirculationTimes;
	timetable: string;
};

type TemperatureDetail = {
	def: number;
	id: string;
	increment: string;
	max: number;
	min: number;
	param: string;
	ptype: number;
	type: number;
	value: number;
};

type Temperatures = {
	desired: TemperatureDetail;
	diff: number;
	frwa1: string;
	frwa2: string;
	loadmax: TemperatureDetail;
	loadmin: TemperatureDetail;
};

type Freshwater = {
	edesc: string;
	index: number;
	mode: number;
	mode_types: Array<number>;
	status: number;
	temperatures: Temperatures;
	timetable: string;
};

type HeatingTemperature = {
	eco: TemperatureDetail;
	normal: TemperatureDetail;
};

type HeatingTemperatures = {
	heat: HeatingTemperature;
};

type HeatingTemperatureValues = {
	act?: string;
	set?: string;
};

type RoomTemperatures = {
	act?: string;
	set?: string;
};

type Room = {
	humidity: number;
	temperatures: RoomTemperatures;
};

type Flow = {
	hclimit: number;
	hcmode: number;
	mixing: number;
	mode: number;
	pump: number;
	temperatures: HeatingTemperatureValues;
};

type Heating = {
	edesc: string;
	flow: Flow;
	hk: string;
	index: number;
	mode: number;
	mode_types: Array<number>;
	name: string;
	room: Room;
	temperatures: HeatingTemperatures;
	timetable: string;
	type: number;
};

type SystemTemperatures = {
	heat: string;
	hpact: number;
	hpin: string;
	hpout: string;
	srcact: number;
	srcin: string;
};

type System = {
	srcmode: number;
	sysmode: number;
	temperatures: SystemTemperatures;
};

export type IdmHeatpump = {
	circulation: Circulation;
	freshwater: Freshwater;
	hk: Heating[];
	system: System;
	version: number;
};
