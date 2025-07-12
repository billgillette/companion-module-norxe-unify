// lib/variables.js
// This file handles all variable definitions and updates for the Norxe Unify module
// COPY THIS ENTIRE FILE TO: lib/variables.js (REPLACE THE EXISTING ONE)

class VariableManager {
	constructor(instance) {
		this.instance = instance
	}

	// Initialize all variable definitions
	init() {
		const variables = [
			// Power Level Variables
			{ name: 'RGB Power Level', variableId: 'rgb_power' },
			{ name: 'NVG Power Level', variableId: 'nvg_power' },
			
			// Desired Gain Variables
			{ name: 'Desired White Gain', variableId: 'desired_white_gain' },
			{ name: 'Desired Red Gain', variableId: 'desired_red_gain' },
			{ name: 'Desired Green Gain', variableId: 'desired_green_gain' },
			{ name: 'Desired Blue Gain', variableId: 'desired_blue_gain' },
			{ name: 'Desired Cyan Gain', variableId: 'desired_cyan_gain' },
			{ name: 'Desired Magenta Gain', variableId: 'desired_magenta_gain' },
			{ name: 'Desired Yellow Gain', variableId: 'desired_yellow_gain' },
			
			// Measured Gain Variables
			{ name: 'Measured White Gain', variableId: 'measured_white_gain' },
			{ name: 'Measured Red Gain', variableId: 'measured_red_gain' },
			{ name: 'Measured Green Gain', variableId: 'measured_green_gain' },
			{ name: 'Measured Blue Gain', variableId: 'measured_blue_gain' },
			
			// Measured RGB Sum Variable
			{ name: 'Measured RGB Sum (R+G+B)', variableId: 'measured_rgb_sum' }
		]

		this.instance.setVariableDefinitions(variables)
		
		// Set initial values
		this.updateAllVariables()
	}

	// Update all variables with current values
	updateAllVariables() {
		const measuredRGBSum = this.instance.measuredGains.red.value + 
		                      this.instance.measuredGains.green.value + 
		                      this.instance.measuredGains.blue.value

		this.instance.setVariableValues({
			// Power Levels
			rgb_power: this.instance.rgbPowerLevel,
			nvg_power: this.instance.nvgPowerLevel,
			
			// Desired gains
			desired_white_gain: this.instance.desiredWhiteGain.toFixed(3),
			desired_red_gain: this.instance.desiredRedGain.toFixed(3),
			desired_green_gain: this.instance.desiredGreenGain.toFixed(3),
			desired_blue_gain: this.instance.desiredBlueGain.toFixed(3),
			desired_cyan_gain: this.instance.desiredCyanGain.toFixed(3),
			desired_magenta_gain: this.instance.desiredMagentaGain.toFixed(3),
			desired_yellow_gain: this.instance.desiredYellowGain.toFixed(3),
			
			// Measured gains
			measured_white_gain: this.instance.measuredGains.white.value.toFixed(4),
			measured_red_gain: this.instance.measuredGains.red.value.toFixed(4),
			measured_green_gain: this.instance.measuredGains.green.value.toFixed(4),
			measured_blue_gain: this.instance.measuredGains.blue.value.toFixed(4),
			
			// Measured RGB Sum
			measured_rgb_sum: measuredRGBSum.toFixed(4)
		})
	}

	// Update just the RGB power variable
	updateRGBPowerVariable() {
		this.instance.setVariableValues({ 
			rgb_power: this.instance.rgbPowerLevel 
		})
	}

	// Update just the NVG power variable
	updateNVGPowerVariable() {
		this.instance.setVariableValues({ 
			nvg_power: this.instance.nvgPowerLevel 
		})
	}

	// EXISTING: Update desired gain variables
	updateWhiteGainVariable() {
		this.instance.setVariableValues({ 
			desired_white_gain: this.instance.desiredWhiteGain.toFixed(3) 
		})
	}

	updateRedGainVariable() {
		this.instance.setVariableValues({ 
			desired_red_gain: this.instance.desiredRedGain.toFixed(3) 
		})
	}

	updateGreenGainVariable() {
		this.instance.setVariableValues({ 
			desired_green_gain: this.instance.desiredGreenGain.toFixed(3) 
		})
	}

	updateBlueGainVariable() {
		this.instance.setVariableValues({ 
			desired_blue_gain: this.instance.desiredBlueGain.toFixed(3) 
		})
	}

	updateCyanGainVariable() {
		this.instance.setVariableValues({ 
			desired_cyan_gain: this.instance.desiredCyanGain.toFixed(3) 
		})
	}

	updateMagentaGainVariable() {
		this.instance.setVariableValues({ 
			desired_magenta_gain: this.instance.desiredMagentaGain.toFixed(3) 
		})
	}

	updateYellowGainVariable() {
		this.instance.setVariableValues({ 
			desired_yellow_gain: this.instance.desiredYellowGain.toFixed(3) 
		})
	}

	// Update measured gain variables
	updateMeasuredWhiteGainVariable() {
		this.instance.setVariableValues({
			measured_white_gain: this.instance.measuredGains.white.value.toFixed(4)
		})
	}

	updateMeasuredRedGainVariable() {
		this.instance.setVariableValues({
			measured_red_gain: this.instance.measuredGains.red.value.toFixed(4)
		})
	}

	updateMeasuredGreenGainVariable() {
		this.instance.setVariableValues({
			measured_green_gain: this.instance.measuredGains.green.value.toFixed(4)
		})
	}

	updateMeasuredBlueGainVariable() {
		this.instance.setVariableValues({
			measured_blue_gain: this.instance.measuredGains.blue.value.toFixed(4)
		})
	}

	// NEW: Update measured RGB sum variable
	updateMeasuredRGBSumVariable() {
		const sum = this.instance.measuredGains.red.value +
			this.instance.measuredGains.green.value +
			this.instance.measuredGains.blue.value
		this.instance.setVariableValues({
			measured_rgb_sum: sum.toFixed(4)
		})
	}
}

module.exports = VariableManager