// lib/feedbacks.js
// This file handles all feedback definitions for the Norxe Unify module
// COPY THIS ENTIRE FILE TO: lib/feedbacks.js

class FeedbackManager {
	constructor(instance) {
		this.instance = instance
	}

	// Initialize all feedback definitions
	init() {
		const feedbacks = {}

		// RGB POWER FEEDBACK
		feedbacks['rgb_power'] = {
			type: 'boolean',
			name: 'RGB Power - Level Check',
			description: 'Change button appearance based on RGB power level',
			defaultStyle: { bgcolor: 0x0080FF, color: 0xFFFFFF },
			options: [
				{ 
					type: 'dropdown', 
					label: 'Condition', 
					id: 'condition', 
					default: 'equal', 
					choices: [
						{ id: 'equal', label: 'Equal to' }, 
						{ id: 'greater', label: 'Greater than' }, 
						{ id: 'less', label: 'Less than' }
					]
				},
				{ 
					type: 'number', 
					label: 'Power Level', 
					id: 'power_level', 
					default: 50, 
					min: 0, 
					max: 100 
				}
			],
			callback: (feedback) => {
				const currentLevel = this.instance.rgbPowerLevel
				const targetLevel = parseInt(feedback.options.power_level)
				switch (feedback.options.condition) {
					case 'equal': return currentLevel === targetLevel
					case 'greater': return currentLevel > targetLevel
					case 'less': return currentLevel < targetLevel
					default: return false
				}
			}
		}

		// RGB POWER RANGE FEEDBACK
		feedbacks['rgb_power_range'] = {
			type: 'boolean',
			name: 'RGB Power - Range Check',
			description: 'Change button appearance when RGB power is within a range',
			defaultStyle: { bgcolor: 0x0080FF, color: 0xFFFFFF },
			options: [
				{
					type: 'number',
					label: 'Minimum Level',
					id: 'min',
					default: 0,
					min: 0,
					max: 100,
					step: 1
				},
				{
					type: 'number',
					label: 'Maximum Level',
					id: 'max',
					default: 100,
					min: 0,
					max: 100,
					step: 1
				}
			],
			callback: (feedback) => {
				const min = parseInt(feedback.options.min)
				const max = parseInt(feedback.options.max)
				return this.instance.rgbPowerLevel >= min && this.instance.rgbPowerLevel <= max
			}
		}

		// GENERATE ALL COLOR GAIN FEEDBACKS PROGRAMMATICALLY
		const colors = [
			{ 
				name: 'White', 
				prop: 'desiredWhiteGain', 
				style: { bgcolor: 0xFFFFFF, color: 0x000000 }
			},
			{ 
				name: 'Red', 
				prop: 'desiredRedGain', 
				style: { bgcolor: 0xFF4040, color: 0xFFFFFF }
			},
			{ 
				name: 'Green', 
				prop: 'desiredGreenGain', 
				style: { bgcolor: 0x40FF40, color: 0x000000 }
			},
			{ 
				name: 'Blue', 
				prop: 'desiredBlueGain', 
				style: { bgcolor: 0x4040FF, color: 0xFFFFFF }
			},
			{ 
				name: 'Cyan', 
				prop: 'desiredCyanGain', 
				style: { bgcolor: 0x00FFFF, color: 0x000000 }
			},
			{ 
				name: 'Magenta', 
				prop: 'desiredMagentaGain', 
				style: { bgcolor: 0xFF00FF, color: 0xFFFFFF }
			},
			{ 
				name: 'Yellow', 
				prop: 'desiredYellowGain', 
				style: { bgcolor: 0xFFFF00, color: 0x000000 }
			}
		]

		// Generate all color gain feedbacks automatically
		colors.forEach(color => {
			const colorLower = color.name.toLowerCase()

			feedbacks[`${colorLower}_gain_level`] = {
				type: 'boolean',
				name: `Desired ${color.name} Gain - Level Check`,
				description: `Change button appearance based on desired ${color.name.toLowerCase()} gain level`,
				defaultStyle: color.style,
				options: [
					{ 
						type: 'dropdown', 
						label: 'Condition', 
						id: 'condition', 
						default: 'equal', 
						choices: [
							{ id: 'equal', label: 'Equal to' }, 
							{ id: 'greater', label: 'Greater than' }, 
							{ id: 'less', label: 'Less than' }
						]
					},
					{ 
						type: 'number', 
						label: `Desired ${color.name} Gain Level`, 
						id: 'gain_level', 
						default: 0.500, 
						min: 0, 
						max: 1, 
						step: 0.001 
					}
				],
				callback: (feedback) => {
					const currentGain = this.instance[color.prop]
					const targetGain = parseFloat(feedback.options.gain_level)
					switch (feedback.options.condition) {
						case 'equal': return Math.abs(currentGain - targetGain) < 0.001
						case 'greater': return currentGain > targetGain
						case 'less': return currentGain < targetGain
						default: return false
					}
				}
			}
		})

		// NVG POWER FEEDBACK
		feedbacks['nvg_power'] = {
			type: 'boolean',
			name: 'NVG Power - Level Check',
			description: 'Change button appearance based on NVG power level',
			defaultStyle: { bgcolor: 0x00FF00, color: 0x000000 },
			options: [
				{ 
					type: 'dropdown', 
					label: 'Condition', 
					id: 'condition', 
					default: 'equal', 
					choices: [
						{ id: 'equal', label: 'Equal to' }, 
						{ id: 'greater', label: 'Greater than' }, 
						{ id: 'less', label: 'Less than' }
					]
				},
				{ 
					type: 'number', 
					label: 'Power Level', 
					id: 'power_level', 
					default: 50, 
					min: 0, 
					max: 100 
				}
			],
			callback: (feedback) => {
				const currentLevel = this.instance.nvgPowerLevel
				const targetLevel = parseInt(feedback.options.power_level)
				switch (feedback.options.condition) {
					case 'equal': return currentLevel === targetLevel
					case 'greater': return currentLevel > targetLevel
					case 'less': return currentLevel < targetLevel
					default: return false
				}
			}
		}

		// NVG POWER RANGE FEEDBACK
		feedbacks['nvg_power_range'] = {
			type: 'boolean',
			name: 'NVG Power - Range Check',
			description: 'Change button appearance when NVG power is within a range',
			defaultStyle: { bgcolor: 0x00FF00, color: 0x000000 },
			options: [
				{
					type: 'number',
					label: 'Minimum Level',
					id: 'min',
					default: 0,
					min: 0,
					max: 100,
					step: 1
				},
				{
					type: 'number',
					label: 'Maximum Level',
					id: 'max',
					default: 100,
					min: 0,
					max: 100,
					step: 1
				}
			],
			callback: (feedback) => {
				const min = parseInt(feedback.options.min)
				const max = parseInt(feedback.options.max)
				return this.instance.nvgPowerLevel >= min && this.instance.nvgPowerLevel <= max
			}
		}

		// Generate all measured color gain feedbacks automatically
		const measuredColors = [
			{ 
				name: 'White', 
				prop: 'measuredWhiteGain',
				style: { bgcolor: 0xFFFFFF, color: 0x000000 }
			},
			{ 
				name: 'Red', 
				prop: 'measuredRedGain',
				style: { bgcolor: 0xFF4040, color: 0xFFFFFF }
			},
			{ 
				name: 'Green', 
				prop: 'measuredGreenGain',
				style: { bgcolor: 0x40FF40, color: 0x000000 }
			},
			{ 
				name: 'Blue', 
				prop: 'measuredBlueGain',
				style: { bgcolor: 0x4040FF, color: 0xFFFFFF }
			}
		]

		measuredColors.forEach(color => {
			const colorLower = color.name.toLowerCase()
			
			// Exact level feedback
			feedbacks[`measured_${colorLower}_gain`] = {
				type: 'boolean',
				name: `Measured ${color.name} Gain - Exact Level`,
				description: `Change button style when measured ${color.name.toLowerCase()} gain is at an exact level`,
				defaultStyle: color.style,
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
					const targetGain = parseFloat(options.gain)
					if (isNaN(targetGain)) return false
					
					const currentGain = this.instance[color.prop]
					return Math.abs(currentGain - targetGain) < 0.0005 // Slightly more lenient threshold
				}
			}

			// Range feedback
			feedbacks[`measured_${colorLower}_gain_range`] = {
				type: 'boolean',
				name: `Measured ${color.name} Gain - Range`,
				description: `Change button style when measured ${color.name.toLowerCase()} gain is within a range`,
				defaultStyle: color.style,
				options: [
					{
						type: 'number',
						label: 'Minimum Gain',
						id: 'min',
						min: 0.0000,
						max: 1.0000,
						step: 0.0001,
						default: 0.0000,
						range: true
					},
					{
						type: 'number',
						label: 'Maximum Gain',
						id: 'max',
						min: 0.0000,
						max: 1.0000,
						step: 0.0001,
						default: 1.0000,
						range: true
					}
				],
				callback: ({ options }) => {
					const minGain = parseFloat(options.min)
					const maxGain = parseFloat(options.max)
					if (isNaN(minGain) || isNaN(maxGain)) return false
					
					const currentGain = this.instance[color.prop]
					return currentGain >= minGain && currentGain <= maxGain
				}
			}
		})

		this.instance.setFeedbackDefinitions(feedbacks)
	}

	// Helper method to add new feedbacks easily (for future features)
	addFeedback(feedbackId, feedbackDefinition) {
		const currentFeedbacks = this.instance.getFeedbackDefinitions()
		currentFeedbacks[feedbackId] = feedbackDefinition
		this.instance.setFeedbackDefinitions(currentFeedbacks)
	}

	// Helper method to remove feedbacks
	removeFeedback(feedbackId) {
		const currentFeedbacks = this.instance.getFeedbackDefinitions()
		delete currentFeedbacks[feedbackId]
		this.instance.setFeedbackDefinitions(currentFeedbacks)
	}

	// Helper method to trigger feedback updates (useful for external changes)
	updateFeedbacks() {
		this.instance.checkFeedbacks()
	}
}

module.exports = FeedbackManager