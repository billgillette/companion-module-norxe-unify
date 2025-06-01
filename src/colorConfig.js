// Color configuration - Single source of truth for all colors
const COLORS = [
	{
		name: 'White',
		id: 'white',
		rpcMethod: 'desiredwhitegain',
		variable: 'desired_white_gain',
		config: 'saved_white_gain',
		displayColor: 0xFFFFFF,
		textColor: 0x000000,
		category: 'White Gain'
	},
	{
		name: 'Red',
		id: 'red',
		rpcMethod: 'desiredredgain',
		variable: 'desired_red_gain',
		config: 'saved_red_gain',
		displayColor: 0xFF4040,
		textColor: 0xFFFFFF,
		category: 'Red Gain'
	},
	{
		name: 'Green',
		id: 'green',
		rpcMethod: 'desiredgreengain',
		variable: 'desired_green_gain',
		config: 'saved_green_gain',
		displayColor: 0x40FF40,
		textColor: 0x000000,
		category: 'Green Gain'
	},
	{
		name: 'Blue',
		id: 'blue',
		rpcMethod: 'desiredbluegain',
		variable: 'desired_blue_gain',
		config: 'saved_blue_gain',
		displayColor: 0x4040FF,
		textColor: 0xFFFFFF,
		category: 'Blue Gain'
	},
	{
		name: 'Cyan',
		id: 'cyan',
		rpcMethod: 'desiredcyangain',
		variable: 'desired_cyan_gain',
		config: 'saved_cyan_gain',
		displayColor: 0x00FFFF,
		textColor: 0x000000,
		category: 'Cyan Gain'
	},
	{
		name: 'Magenta',
		id: 'magenta',
		rpcMethod: 'desiredmagentagain',
		variable: 'desired_magenta_gain',
		config: 'saved_magenta_gain',
		displayColor: 0xFF00FF,
		textColor: 0xFFFFFF,
		category: 'Magenta Gain'
	},
	{
		name: 'Yellow',
		id: 'yellow',
		rpcMethod: 'desiredyellowgain',
		variable: 'desired_yellow_gain',
		config: 'saved_yellow_gain',
		displayColor: 0xFFFF00,
		textColor: 0x000000,
		category: 'Yellow Gain'
	}
]

module.exports = { COLORS }