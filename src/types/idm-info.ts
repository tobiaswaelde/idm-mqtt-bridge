export type IdmInfo = {
	authenticationMode: AuthenticationMode;
	datetime: String;
	header: Header;
	holiday_freshwater: number;
	holidays_left: number;
	hwt: String;
	mod_bv: Array<ModBv>;
	mod_energy: number;
	mod_heatpump: Array<number>;
	mod_sys_act: Array<number>;
	mod_sys_cooling_configured: boolean;
	mod_system: number;
	mode_sys: number;
	mode_sys_off: boolean;
	out: string;
	outavg: String;
	quickinfo: QuickInfo;
	rules: Map<number, number>;
	userlevel: number;
	weather: Weather;
	weather_forecast: boolean;
};

type AuthenticationMode = {
	isEnabled: boolean;
	name: String;
};

type Header = {
	myIDM: number;
	myIDMID: number;
	network: number;
};

type ModBv = {
	id: number;
	value: number;
};

type QuickInfo = {
	hk: Array<HeatingCircuit>;
	system: SystemInfo;
};

type HeatingCircuit = {
	flow: Flow;
	hcmode: number;
	mixing: number;
	mode: number;
	name: String;
	pump: number;
	room: Room;
	type: number;
};

type Flow = {
	act: string;
	set?: string;
};

type Room = {
	act: string;
	set?: string;
};

type SystemInfo = {
	frwa1: string;
	frwa2: string;
	heat: string;
	hpact: number;
	hpin: string;
	hpout: string;
	src1: string;
	srcact: number;
	srcmode: number;
};

type Weather = {
	forecast1: Forecast;
	forecast2: Forecast;
	forecast3: Forecast;
	forecast4: Forecast;
	forecast5: Forecast;
	forecast6: Forecast;
	today: TodayForecast;
};

type Forecast = {
	date: String;
	dayofweek: String;
	sun: number;
	sym_w50: number;
	temperature: Temperature;
};

type TodayForecast = {
	date: String;
	dayofweek: String;
	sun: number;
	sym_w50: number;
	temperature: TodayTemperature;
};

type Temperature = {
	act: number;
	max: number;
	min: number;
};

type TodayTemperature = {
	act: number;
	avg: String;
	max: number;
	min: number;
};
