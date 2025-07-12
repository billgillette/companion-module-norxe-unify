// lib/actions.js
// This file handles all action definitions for the Norxe Unify module
// COPY THIS ENTIRE FILE TO: lib/actions.js (REPLACE THE EXISTING ONE)

class ActionManager {
	constructor(instance) {
		this.instance = instance
	}

	// Initialize all action definitions
	init() {
		const actions = {}

		// RGB POWER ACTIONS
		actions['rgb_power_set'] = {
			name: 'RGB Power - Set Level',
			options: [{ 
				type: 'number', 
				label: 'Power Level (0-100)', 
				id: 'power_level', 
				default: 50, 
				min: 0, 
				max: 100 
			}],
			callback: async (event) => {
				const powerLevel = parseInt(event.options.power_level)
				if (!isNaN(powerLevel)) {
					this.instance.updateRGBPowerLevel(powerLevel)
				}
			}
		}

		actions['rgb_power_increment'] = {
			name: 'RGB Power - Increment (+)',
			options: [{ 
				type: 'number', 
				label: 'Increment Amount', 
				id: 'increment', 
				default: 1, 
				min: 1, 
				max: 100 
			}],
			callback: async (event) => {
				const increment = parseInt(event.options.increment)
				if (!isNaN(increment)) {
					const newLevel = this.instance.rgbPowerLevel + increment
					this.instance.updatePowerLevel('rgb', newLevel, false)
				}
			}
		}

		actions['rgb_power_decrement'] = {
			name: 'RGB Power - Decrement (-)',
			options: [{ 
				type: 'number', 
				label: 'Decrement Amount', 
				id: 'decrement', 
				default: 1, 
				min: 1, 
				max: 100 
			}],
			callback: async (event) => {
				const decrement = parseInt(event.options.decrement)
				if (!isNaN(decrement)) {
					const newLevel = this.instance.rgbPowerLevel - decrement
					this.instance.updatePowerLevel('rgb', newLevel, false)
				}
			}
		}

		// NVG POWER ACTIONS
		actions['nvg_power_set'] = {
			name: 'NVG Power - Set Level',
			options: [{ 
				type: 'number', 
				label: 'Power Level (0-100)', 
				id: 'power_level', 
				default: 50, 
				min: 0, 
				max: 100 
			}],
			callback: async (event) => {
				const powerLevel = parseInt(event.options.power_level)
				if (!isNaN(powerLevel)) {
					this.instance.updatePowerLevel('nvg', powerLevel, false)
				}
			}
		}

		actions['nvg_power_increment'] = {
			name: 'NVG Power - Increment (+)',
			options: [{ 
				type: 'number', 
				label: 'Increment Amount', 
				id: 'increment', 
				default: 1, 
				min: 1, 
				max: 100 
			}],
			callback: async (event) => {
				const increment = parseInt(event.options.increment)
				if (!isNaN(increment)) {
					const newLevel = this.instance.nvgPowerLevel + increment
					this.instance.updatePowerLevel('nvg', newLevel, false)
				}
			}
		}

		actions['nvg_power_decrement'] = {
			name: 'NVG Power - Decrement (-)',
			options: [{ 
				type: 'number', 
				label: 'Decrement Amount', 
				id: 'decrement', 
				default: 1, 
				min: 1, 
				max: 100 
			}],
			callback: async (event) => {
				const decrement = parseInt(event.options.decrement)
				if (!isNaN(decrement)) {
					const newLevel = this.instance.nvgPowerLevel - decrement
					this.instance.updatePowerLevel('nvg', newLevel, false)
				}
			}
		}

		// GENERATE ALL DESIRED COLOR GAIN ACTIONS PROGRAMMATICALLY (EXISTING)
		const desiredColors = [
			{ name: 'White', prop: 'desiredWhiteGain', methods: { set: 'updateWhiteGain', debounced: 'updateWhiteGainDebounced' } },
			{ name: 'Red', prop: 'desiredRedGain', methods: { set: 'updateRedGain', debounced: 'updateRedGainDebounced' } },
			{ name: 'Green', prop: 'desiredGreenGain', methods: { set: 'updateGreenGain', debounced: 'updateGreenGainDebounced' } },
			{ name: 'Blue', prop: 'desiredBlueGain', methods: { set: 'updateBlueGain', debounced: 'updateBlueGainDebounced' } },
			{ name: 'Cyan', prop: 'desiredCyanGain', methods: { set: 'updateCyanGain', debounced: 'updateCyanGainDebounced' } },
			{ name: 'Magenta', prop: 'desiredMagentaGain', methods: { set: 'updateMagentaGain', debounced: 'updateMagentaGainDebounced' } },
			{ name: 'Yellow', prop: 'desiredYellowGain', methods: { set: 'updateYellowGain', debounced: 'updateYellowGainDebounced' } }
		]

		// Generate all desired color gain actions automatically
		desiredColors.forEach(color => {
			const colorLower = color.name.toLowerCase()

			// SET action
			actions[`${colorLower}_gain_set`] = {
				name: `Desired ${color.name} Gain - Set Level`,
				options: [{ 
					type: 'number', 
					label: `Desired ${color.name} Gain (0.000-1.000)`, 
					id: 'gain_level', 
					default: 0.500, 
					min: 0, 
					max: 1, 
					step: 0.001 
				}],
				callback: async (event) => {
					const gainLevel = parseFloat(event.options.gain_level)
					this.instance[color.methods.set](gainLevel)
				}
			}

			// INCREMENT action
			actions[`${colorLower}_gain_increment`] = {
				name: `Desired ${color.name} Gain - Increment (+)`,
				options: [{ 
					type: 'number', 
					label: 'Increment Amount', 
					id: 'increment', 
					default: 0.010, 
					min: 0.001, 
					max: 1.000, 
					step: 0.001 
				}],
				callback: async (event) => {
					const increment = parseFloat(event.options.increment)
					const newGain = this.instance[color.prop] + increment
					this.instance[color.methods.debounced](newGain)
				}
			}

			// DECREMENT action
			actions[`${colorLower}_gain_decrement`] = {
				name: `Desired ${color.name} Gain - Decrement (-)`,
				options: [{ 
					type: 'number', 
					label: 'Decrement Amount', 
					id: 'decrement', 
					default: 0.010, 
					min: 0.001, 
					max: 1.000, 
					step: 0.001 
				}],
				callback: async (event) => {
					const decrement = parseFloat(event.options.decrement)
					const newGain = this.instance[color.prop] - decrement
					this.instance[color.methods.debounced](newGain)
				}
			}
		})

		// NEW: GENERATE ALL MEASURED COLOR GAIN ACTIONS PROGRAMMATICALLY
		const measuredColors = [
			{ name: 'White', prop: 'measuredWhiteGain', methods: { set: 'updateMeasuredWhiteGain', debounced: 'updateMeasuredWhiteGainDebounced' } },
			{ name: 'Red', prop: 'measuredRedGain', methods: { set: 'updateMeasuredRedGain', debounced: 'updateMeasuredRedGainDebounced' } },
			{ name: 'Green', prop: 'measuredGreenGain', methods: { set: 'updateMeasuredGreenGain', debounced: 'updateMeasuredGreenGainDebounced' } },
			{ name: 'Blue', prop: 'measuredBlueGain', methods: { set: 'updateMeasuredBlueGain', debounced: 'updateMeasuredBlueGainDebounced' } }
		]

		// Generate all measured color gain actions automatically
		measuredColors.forEach(color => {
			const colorLower = color.name.toLowerCase()

			actions[`set_measured_${colorLower}_gain`] = {
				name: `Set Measured ${color.name} Gain`,
				options: [
					{
						type: 'number',
						label: `Measured ${color.name} Gain (0.0000-1.0000)`,
						id: 'gain',
						min: 0.0000,
						max: 1.0000,
						step: 0.0001,
						default: 0.0000,
						range: true
					}
				],
				callback: ({ options }) => {
					const gain = parseFloat(options.gain)
					if (!isNaN(gain)) {
						this.instance[color.methods.set]({ options: { gain } })
					}
				}
			}

			actions[`measured_${colorLower}_gain_increment`] = {
				name: `Measured ${color.name} Gain - Increment (+)`,
				options: [
					{
						type: 'number',
						label: 'Increment Amount (0.0001-0.1000)',
						id: 'increment',
						min: 0.0001,
						max: 0.1000,
						step: 0.0001,
						default: 0.0010,
						range: true
					}
				],
				callback: ({ options }) => {
					const increment = parseFloat(options.increment)
					if (!isNaN(increment)) {
						const currentGain = this.instance.measuredGains[colorLower].value
						const newGain = Math.max(0.0000, Math.min(1.0000, currentGain + increment))
						this.instance[color.methods.set]({ options: { gain: newGain } })
					}
				}
			}

			actions[`measured_${colorLower}_gain_decrement`] = {
				name: `Measured ${color.name} Gain - Decrement (-)`,
				options: [
					{
						type: 'number',
						label: 'Decrement Amount (0.0001-0.1000)',
						id: 'decrement',
						min: 0.0001,
						max: 0.1000,
						step: 0.0001,
						default: 0.0010,
						range: true
					}
				],
				callback: ({ options }) => {
					const decrement = parseFloat(options.decrement)
					if (!isNaN(decrement)) {
						const currentGain = this.instance.measuredGains[colorLower].value
						const newGain = Math.max(0.0000, Math.min(1.0000, currentGain - decrement))
						this.instance[color.methods.set]({ options: { gain: newGain } })
					}
				}
			}
		})

		this.instance.setActionDefinitions(actions)
	}

	// Helper method to add new actions easily (for future features)
	addAction(actionId, actionDefinition) {
		const currentActions = this.instance.getActionDefinitions()
		currentActions[actionId] = actionDefinition
		this.instance.setActionDefinitions(currentActions)
	}

	// Helper method to remove actions
	removeAction(actionId) {
		const currentActions = this.instance.getActionDefinitions()
		delete currentActions[actionId]
		this.instance.setActionDefinitions(currentActions)
	}
}

module.exports = ActionManager