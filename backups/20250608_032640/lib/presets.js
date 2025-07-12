// lib/presets.js
// This file handles all preset definitions for the Norxe Unify module
// COPY THIS ENTIRE FILE TO: lib/presets.js (REPLACE THE EXISTING ONE)

class PresetManager {
	constructor(instance) {
		this.instance = instance
	}

	// Initialize all preset definitions
	init() {
		const presets = []

		// RGB Power Presets
		this.addRGBPowerPresets(presets)

		// NVG Power Presets
		this.addNVGPowerPresets(presets)

		// Generate all DESIRED color gain presets automatically (EXISTING)
		const desiredColors = [
			{ name: 'White', variable: 'desired_white_gain', style: { bgcolor: 0xFFFFFF, color: 0x000000, upColor: 0xC0C0C0, downColor: 0x808080 } },
			{ name: 'Red', variable: 'desired_red_gain', style: { bgcolor: 0xFF4040, color: 0xFFFFFF, upColor: 0x802020, downColor: 0x401010 } },
			{ name: 'Green', variable: 'desired_green_gain', style: { bgcolor: 0x40FF40, color: 0x000000, upColor: 0x208020, downColor: 0x104010 } },
			{ name: 'Blue', variable: 'desired_blue_gain', style: { bgcolor: 0x4040FF, color: 0xFFFFFF, upColor: 0x202080, downColor: 0x101040 } },
			{ name: 'Cyan', variable: 'desired_cyan_gain', style: { bgcolor: 0x00FFFF, color: 0x000000, upColor: 0x00C0C0, downColor: 0x008080 } },
			{ name: 'Magenta', variable: 'desired_magenta_gain', style: { bgcolor: 0xFF00FF, color: 0xFFFFFF, upColor: 0xC000C0, downColor: 0x800080 } },
			{ name: 'Yellow', variable: 'desired_yellow_gain', style: { bgcolor: 0xFFFF00, color: 0x000000, upColor: 0xC0C000, downColor: 0x808000 } }
		]

		desiredColors.forEach(color => {
			this.addDesiredColorGainPresets(presets, color)
		})

		// NEW: Generate all MEASURED color gain presets automatically
		const measuredColors = [
			{ name: 'White', variable: 'measured_white_gain', style: { bgcolor: 0xF0F0F0, color: 0x000000, upColor: 0xB0B0B0, downColor: 0x707070 } },
			{ name: 'Red', variable: 'measured_red_gain', style: { bgcolor: 0xE03030, color: 0xFFFFFF, upColor: 0x701818, downColor: 0x380C0C } },
			{ name: 'Green', variable: 'measured_green_gain', style: { bgcolor: 0x30E030, color: 0x000000, upColor: 0x187018, downColor: 0x0C380C } },
			{ name: 'Blue', variable: 'measured_blue_gain', style: { bgcolor: 0x3030E0, color: 0xFFFFFF, upColor: 0x181870, downColor: 0x0C0C38 } }
		]

		measuredColors.forEach(color => {
			this.addMeasuredColorGainPresets(presets, color)
		})

		this.instance.setPresetDefinitions(presets)
	}

	// Add RGB Power presets
	addRGBPowerPresets(presets) {
		presets.push({
			type: 'button',
			category: 'RGB Power',
			name: 'Power Display',
			style: { 
				text: 'RGB\\n$(norxe_unify:rgb_power_level)%', 
				size: '18', 
				color: 0xFFFFFF, 
				bgcolor: 0x0080FF 
			},
			steps: [{ down: [], up: [] }],
			feedbacks: []
		})

		presets.push({
			type: 'button',
			category: 'RGB Power', 
			name: 'Power UP (+10)',
			style: { 
				text: 'RGB\\nUP\\n+10', 
				size: '14', 
				color: 0xFFFFFF, 
				bgcolor: 0x004080 
			},
			steps: [{ down: [{ actionId: 'rgb_power_increment', options: { increment: 10 } }], up: [] }],
			feedbacks: []
		})

		presets.push({
			type: 'button',
			category: 'RGB Power',
			name: 'Power DOWN (-10)', 
			style: { 
				text: 'RGB\\nDOWN\\n-10', 
				size: '14', 
				color: 0xFFFFFF, 
				bgcolor: 0x002040 
			},
			steps: [{ down: [{ actionId: 'rgb_power_decrement', options: { decrement: 10 } }], up: [] }],
			feedbacks: []
		})
	}

	// Add NVG Power presets
	addNVGPowerPresets(presets) {
		// NVG Power Display
		presets.push({
			type: 'button',
			category: 'NVG Power',
			name: 'NVG Power Display',
			style: { 
				text: 'NVG\\n$(norxe_unify:nvg_power)%', 
				size: '18', 
				color: 0xFFFFFF, 
				bgcolor: 0x006400 
			},
			steps: [{ down: [], up: [] }],
			feedbacks: [
				{
					type: 'nvg_power',
					options: { level: 0 }
				}
			]
		})

		// NVG Power UP (+1)
		presets.push({
			type: 'button',
			category: 'NVG Power',
			name: 'NVG Power UP (+1)',
			style: { 
				text: 'NVG\\nUP\\n+1', 
				size: '14', 
				color: 0xFFFFFF, 
				bgcolor: 0x004000 
			},
			steps: [{ down: [{ actionId: 'nvg_power_increment', options: { increment: 1 } }], up: [] }],
			feedbacks: []
		})

		// NVG Power DOWN (-1)
		presets.push({
			type: 'button',
			category: 'NVG Power',
			name: 'NVG Power DOWN (-1)',
			style: { 
				text: 'NVG\\nDOWN\\n-1', 
				size: '14', 
				color: 0xFFFFFF, 
				bgcolor: 0x002000 
			},
			steps: [{ down: [{ actionId: 'nvg_power_decrement', options: { decrement: 1 } }], up: [] }],
			feedbacks: []
		})

		// Common NVG power levels
		const nvgLevels = [
			{ name: 'NVG OFF', level: 0, color: 0x000000 },
			{ name: 'NVG 25%', level: 25, color: 0x002000 },
			{ name: 'NVG 50%', level: 50, color: 0x004000 },
			{ name: 'NVG 75%', level: 75, color: 0x006000 },
			{ name: 'NVG 100%', level: 100, color: 0x008000 }
		]

		nvgLevels.forEach(level => {
			presets.push({
				type: 'button',
				category: 'NVG Power',
				name: level.name,
				style: { 
					text: level.name, 
					size: '14', 
					color: 0xFFFFFF, 
					bgcolor: level.color 
				},
				steps: [{ down: [{ actionId: 'nvg_power_set', options: { power_level: level.level } }], up: [] }],
				feedbacks: [
					{
						type: 'nvg_power',
						options: { level: level.level }
					}
				]
			})
		})
	}

	// Add DESIRED color gain presets for a specific color (EXISTING)
	addDesiredColorGainPresets(presets, color) {
		const colorLower = color.name.toLowerCase()
		const textSize = color.name === 'Magenta' ? '14' : '16'
		const upDownSize = color.name === 'Magenta' ? '10' : '12'

		// Display preset
		presets.push({
			type: 'button',
			category: `Desired ${color.name} Gain`,
			name: `Desired ${color.name} Gain Display`,
			style: { 
				text: `DES ${color.name.toUpperCase()}\\n$(norxe_unify:${color.variable})`, 
				size: textSize, 
				color: color.style.color, 
				bgcolor: color.style.bgcolor 
			},
			steps: [{ down: [], up: [] }],
			feedbacks: []
		})

		// UP preset
		presets.push({
			type: 'button',
			category: `Desired ${color.name} Gain`,
			name: `Desired ${color.name} UP (+0.01)`,
			style: { 
				text: `DES ${color.name.toUpperCase()}\\nUP\\n+0.01`, 
				size: upDownSize, 
				color: color.style.color, 
				bgcolor: color.style.upColor 
			},
			steps: [{ down: [{ actionId: `${colorLower}_gain_increment`, options: { increment: 0.01 } }], up: [] }],
			feedbacks: []
		})

		// DOWN preset
		presets.push({
			type: 'button',
			category: `Desired ${color.name} Gain`,
			name: `Desired ${color.name} DOWN (-0.01)`,
			style: { 
				text: `DES ${color.name.toUpperCase()}\\nDOWN\\n-0.01`, 
				size: upDownSize, 
				color: color.style.color, 
				bgcolor: color.style.downColor 
			},
			steps: [{ down: [{ actionId: `${colorLower}_gain_decrement`, options: { decrement: 0.01 } }], up: [] }],
			feedbacks: []
		})
	}

	// NEW: Add MEASURED color gain presets for a specific color
	addMeasuredColorGainPresets(presets, color) {
		const colorLower = color.name.toLowerCase()
		const textSize = '16'
		const upDownSize = '12'

		// Display preset
		presets.push({
			type: 'button',
			category: `Measured ${color.name} Gain`,
			name: `Measured ${color.name} Gain Display`,
			style: { 
				text: `MEAS ${color.name.toUpperCase()}\\n$(norxe_unify:${color.variable})`, 
				size: textSize, 
				color: color.style.color, 
				bgcolor: color.style.bgcolor 
			},
			steps: [{ down: [], up: [] }],
			feedbacks: []
		})

		// UP preset
		presets.push({
			type: 'button',
			category: `Measured ${color.name} Gain`,
			name: `Measured ${color.name} UP (+0.01)`,
			style: { 
				text: `MEAS ${color.name.toUpperCase()}\\nUP\\n+0.01`, 
				size: upDownSize, 
				color: color.style.color, 
				bgcolor: color.style.upColor 
			},
			steps: [{ down: [{ actionId: `set_measured_${colorLower}_gain`, options: { gain: 0.01 } }], up: [] }],
			feedbacks: []
		})

		// DOWN preset
		presets.push({
			type: 'button',
			category: `Measured ${color.name} Gain`,
			name: `Measured ${color.name} DOWN (-0.01)`,
			style: { 
				text: `MEAS ${color.name.toUpperCase()}\\nDOWN\\n-0.01`, 
				size: upDownSize, 
				color: color.style.color, 
				bgcolor: color.style.downColor 
			},
			steps: [{ down: [{ actionId: `set_measured_${colorLower}_gain`, options: { gain: -0.01 } }], up: [] }],
			feedbacks: []
		})
	}

	// Helper method to add custom presets easily (for future features)
	addPreset(presetDefinition) {
		const currentPresets = this.instance.getPresetDefinitions()
		currentPresets.push(presetDefinition)
		this.instance.setPresetDefinitions(currentPresets)
	}

	// Helper method to add multiple presets at once
	addPresets(presetArray) {
		const currentPresets = this.instance.getPresetDefinitions()
		currentPresets.push(...presetArray)
		this.instance.setPresetDefinitions(currentPresets)
	}

	// Helper method to create a preset template
	createPresetTemplate(category, name, text, actionId, options = {}, style = {}) {
		return {
			type: 'button',
			category: category,
			name: name,
			style: {
				text: text,
				size: '14',
				color: 0xFFFFFF,
				bgcolor: 0x333333,
				...style
			},
			steps: [{ 
				down: actionId ? [{ actionId: actionId, options: options }] : [], 
				up: [] 
			}],
			feedbacks: []
		}
	}

	// Method to refresh all presets (useful for dynamic updates)
	refresh() {
		this.init()
	}
}

module.exports = PresetManager