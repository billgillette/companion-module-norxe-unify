// lib/config.js
// This file contains all the configuration field definitions for the Norxe Unify module
// COPY THIS ENTIRE FILE TO: lib/config.js (REPLACE THE EXISTING ONE)

const { Regex } = require('@companion-module/base')

/**
 * Returns the configuration fields for the Norxe Unify module
 * This function will be called by the main module to get config options
 */
function getConfigFields() {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Device IP Address',
			width: 6,
			regex: Regex.IP,
			default: '192.168.4.188',
			tooltip: 'IP address of the device with JSON-RPC server'
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'JSON-RPC Port',
			width: 3,
			regex: Regex.PORT,
			default: '49374',
			tooltip: 'TCP port for JSON-RPC communication'
		},
		{
			type: 'checkbox',
			id: 'enable_network',
			label: 'Enable Network Control',
			width: 3,
			default: false,
			tooltip: 'Enable TCP connection to control actual device'
		},
		{
			type: 'number',
			id: 'saved_rgb_power',
			label: 'RGB Power (Saved)',
			width: 3,
			min: 0,
			max: 100,
			default: 0,
			tooltip: 'Auto-updated RGB power level'
		},
		{
			type: 'number',
			id: 'saved_nvg_power',
			label: 'NVG Power (Saved)',
			width: 3,
			min: 0,
			max: 100,
			default: 0,
			tooltip: 'Auto-updated NVG power level'
		},
		// DESIRED GAIN CONFIG FIELDS
		{
			type: 'number',
			id: 'saved_white_gain',
			label: 'Desired White Gain (Saved)',
			width: 3,
			min: 0,
			max: 1,
			step: 0.001,
			default: 0.000,
			tooltip: 'Auto-updated desired white gain'
		},
		{
			type: 'number',
			id: 'saved_red_gain',
			label: 'Desired Red Gain (Saved)',
			width: 3,
			min: 0,
			max: 1,
			step: 0.001,
			default: 0.000,
			tooltip: 'Auto-updated desired red gain'
		},
		{
			type: 'number',
			id: 'saved_green_gain',
			label: 'Desired Green Gain (Saved)',
			width: 3,
			min: 0,
			max: 1,
			step: 0.001,
			default: 0.000,
			tooltip: 'Auto-updated desired green gain'
		},
		{
			type: 'number',
			id: 'saved_blue_gain',
			label: 'Desired Blue Gain (Saved)',
			width: 3,
			min: 0,
			max: 1,
			step: 0.001,
			default: 0.000,
			tooltip: 'Auto-updated desired blue gain'
		},
		{
			type: 'number',
			id: 'saved_cyan_gain',
			label: 'Desired Cyan Gain (Saved)',
			width: 3,
			min: 0,
			max: 1,
			step: 0.001,
			default: 0.000,
			tooltip: 'Auto-updated desired cyan gain'
		},
		{
			type: 'number',
			id: 'saved_magenta_gain',
			label: 'Desired Magenta Gain (Saved)',
			width: 3,
			min: 0,
			max: 1,
			step: 0.001,
			default: 0.000,
			tooltip: 'Auto-updated desired magenta gain'
		},
		{
			type: 'number',
			id: 'saved_yellow_gain',
			label: 'Desired Yellow Gain (Saved)',
			width: 3,
			min: 0,
			max: 1,
			step: 0.001,
			default: 0.000,
			tooltip: 'Auto-updated desired yellow gain'
		},
		// NEW: MEASURED GAIN CONFIG FIELDS
		{
			type: 'number',
			id: 'saved_measured_white_gain',
			label: 'Measured White Gain (Saved)',
			width: 3,
			min: 0.0000,
			max: 1.0000,
			step: 0.0001,
			default: 0.0000,
			tooltip: 'Auto-updated measured white gain'
		},
		{
			type: 'number',
			id: 'saved_measured_red_gain',
			label: 'Measured Red Gain (Saved)',
			width: 3,
			min: 0.0000,
			max: 1.0000,
			step: 0.0001,
			default: 0.0000,
			tooltip: 'Auto-updated measured red gain'
		},
		{
			type: 'number',
			id: 'saved_measured_green_gain',
			label: 'Measured Green Gain (Saved)',
			width: 3,
			min: 0.0000,
			max: 1.0000,
			step: 0.0001,
			default: 0.0000,
			tooltip: 'Auto-updated measured green gain'
		},
		{
			type: 'number',
			id: 'saved_measured_blue_gain',
			label: 'Measured Blue Gain (Saved)',
			width: 3,
			min: 0.0000,
			max: 1.0000,
			step: 0.0001,
			default: 0.0000,
			tooltip: 'Auto-updated measured blue gain'
		},
		{
			type: 'number',
			id: 'debounce_delay',
			label: 'Debounce Delay (ms)',
			width: 6,
			min: 0,
			max: 1000,
			default: 100,
			tooltip: 'Delay for rotary encoder debouncing. 0 = no debounce'
		},
		{
			type: 'checkbox',
			id: 'enable_debug_logging',
			label: 'Enable Debug Logging',
			width: 6,
			default: true,
			tooltip: 'Enable detailed logging for troubleshooting'
		}
	]
}

// Export the function so other files can use it
module.exports = {
	getConfigFields
}