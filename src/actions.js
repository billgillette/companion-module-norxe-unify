const { COLORS } = require('./colorConfig')

function getActions(instance) {
	const actions = {}

	// RGB Power Actions (unique, so define manually)
	actions['rgb_power_set'] = {
		name: 'RGB Power - Set Level',
		options: [{ type: 'number', label: 'Power Level (0-100)', id: 'power_level', default: 50, min: 0, max: 100 }],
		callback: async (event) => {
			const powerLevel = parseInt(event.options.power_level)
			instance.updateRGBPowerLevel(powerLevel)
		}
	}

	actions['rgb_power_increment'] = {
		name: 'RGB Power - Increment (+)',
		options: [{ type: 'number', label: 'Increment Amount', id: 'increment', default: 10, min: 1, max: 100 }],
		callback: async (event) => {
			const increment = parseInt(event.options.increment)
			const newLevel = instance.rgbPowerLevel + increment
			instance.updateRGBPowerLevelDebounced(newLevel)
		}
	}

	actions['rgb_power_decrement'] = {
		name: 'RGB Power - Decrement (-)',
		options: [{ type: 'number', label: 'Decrement Amount', id: 'decrement', default: 10, min: 1, max: 100 }],
		callback: async (event) => {
			const decrement = parseInt(event.options.decrement)
			const newLevel = instance.rgbPowerLevel - decrement
			instance.updateRGBPowerLevelDebounced(newLevel)
		}
	}

	// Generate all color gain actions using DRY approach
	COLORS.forEach(color => {
		const colorName = color.name
		const colorId = color.id
		const gainProperty = `desired${colorName}Gain`

		// Set Action
		actions[`${colorId}_gain_set`] = {
			name: `Desired ${colorName} Gain - Set Level`,
			options: [{ 
				type: 'number', 
				label: `Desired ${colorName} Gain (0.000-1.000)`, 
				id: 'gain_level', 
				default: 0.500, 
				min: 0, 
				max: 1, 
				step: 0.001 
			}],
			callback: async (event) => {
				const gainLevel = parseFloat(event.options.gain_level)
				instance[`update${colorName}Gain`](gainLevel)
			}
		}

		// Increment Action
		actions[`${colorId}_gain_increment`] = {
			name: `Desired ${colorName} Gain - Increment (+)`,
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
				const newGain = instance[gainProperty] + increment
				instance[`update${colorName}GainDebounced`](newGain)
			}
		}

		// Decrement Action
		actions[`${colorId}_gain_decrement`] = {
			name: `Desired ${colorName} Gain - Decrement (-)`,
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
				const newGain = instance[gainProperty] - decrement
				instance[`update${colorName}GainDebounced`](newGain)
			}
		}
	})

	return actions
}

module.exports = { getActions }