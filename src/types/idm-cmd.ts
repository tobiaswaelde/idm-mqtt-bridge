export enum StatsType {
	Heatpump = 'heatpump',
	AmountOfHeat = 'amountofheat',
	BaEnergyHp = 'baenergyhp',
}

export enum Command {
	PushInfo = 'push_info',
	PushHeatpump = 'push_heatpump',
	PushStats = 'push_stats',
	SetWarmwaterTemp = 'set_warmwater_temp',
}

export type IdmCmd =
	| { cmd: Command.PushInfo }
	| { cmd: Command.PushHeatpump }
	| { cmd: Command.PushStats; stats_type: StatsType }
	| { cmd: Command.SetWarmwaterTemp; value: number };
