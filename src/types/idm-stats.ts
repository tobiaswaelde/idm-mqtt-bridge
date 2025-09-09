export type IdmStatsData = {
	daily: Array<Daily>;
	decimalsTotal: number;
	monthly: Array<Monthly>;
	sumToday?: string;
	sumTotal: string;
	total: Array<Total>;
	unitTotal: string;
	yearly: Array<Yearly>;
};

type Daily = {
	index: number;
	name: string;
	sum: Array<string>;
	values: Array<Array<number>>;
};

type Monthly = {
	index: number;
	name: string;
	sum: Array<string>;
	values: Array<Array<number>>;
};

type Total = {
	color: string;
	name: string;
	value: number;
};

type Yearly = {
	index: number;
	name: string;
	sum: Array<string>;
	values: Array<Array<number>>;
};

type OverviewItems = {
	active_today: Array<Array<number>>;
	active_total: Array<number>;
};

type Items = {
	items: Array<Array<Item>>;
};

type Item = {
	color: string;
	name: string;
};

export type IdmAmountOfHeatStats = {
	data: IdmStatsData;
	items: Array<Array<Item>>;
	overview_items: OverviewItems;
	version: number;
};

export type IdmHeatpumpStats = {
	data: IdmStatsData;
	items: Array<Array<Item>>;
	overview_items: OverviewItems;
	version: number;
};

export type IdmBaEnergyHpStats = {
	data: IdmStatsData;
	items: Array<Array<Item>>;
	version: number;
};
