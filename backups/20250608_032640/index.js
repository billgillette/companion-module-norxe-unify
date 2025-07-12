// Version 1.9.1 - MBP Edited - iCloud 2:45 PM Complete RGB + Gain Control Module - WITH MEASURED GAINS + RGB SUM
const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const net = require('net')
const { getConfigFields } = require('./lib/config')
const NetworkManager = require('./lib/network')
const VariableManager = require('./lib/variables')
const ActionManager = require('./lib/actions')
const FeedbackManager = require('./lib/feedbacks')
const PresetManager = require('./lib/presets')

class NorxeUnifyInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		
		this.rgbPowerLevel = 0
		this.nvgPowerLevel = 0  // Add NVG power level
		
		// Desired gains (existing)
		this.desiredWhiteGain = 0.000
		this.desiredRedGain = 0.000
		this.desiredGreenGain = 0.000
		this.desiredBlueGain = 0.000
		this.desiredCyanGain = 0.000
		this.desiredMagentaGain = 0.000
		this.desiredYellowGain = 0.000
		
		// Measured gains (NEW!)
		this.measuredGains = {
			white: { value: 0.0000, configKey: 'saved_measured_white_gain' },
			red: { value: 0.0000, configKey: 'saved_measured_red_gain' },
			green: { value: 0.0000, configKey: 'saved_measured_green_gain' },
			blue: { value: 0.0000, configKey: 'saved_measured_blue_gain' }
		}
		
		this.debounceTimer = null
		this.pendingPowerLevel = null
		this.pendingWhiteGain = null
		this.pendingRedGain = null
		this.pendingGreenGain = null
		this.pendingBlueGain = null
		this.pendingCyanGain = null
		this.pendingMagentaGain = null
		this.pendingYellowGain = null
		
		// Measured gain pending values (NEW!)
		this.pendingMeasuredGains = {
			white: null,
			red: null,
			green: null,
			blue: null
		}
		
		this.debounceDelay = 100
		this.enableDebugLogging = true
		
		// Manager objects - each handles a specific aspect of the module
		this.network = new NetworkManager(this)
		this.variables = new VariableManager(this)
		this.actions = new ActionManager(this)
		this.feedbacks = new FeedbackManager(this)
		this.presets = new PresetManager(this)
	}

	async init(config) {
		this.config = config
		
		this.rgbPowerLevel = parseInt(this.config.saved_rgb_power) || 0
		this.nvgPowerLevel = parseInt(this.config.saved_nvg_power) || 0
		
		// Load desired gains
		this.desiredWhiteGain = parseFloat(this.config.saved_white_gain) || 0.000
		this.desiredRedGain = parseFloat(this.config.saved_red_gain) || 0.000
		this.desiredGreenGain = parseFloat(this.config.saved_green_gain) || 0.000
		this.desiredBlueGain = parseFloat(this.config.saved_blue_gain) || 0.000
		this.desiredCyanGain = parseFloat(this.config.saved_cyan_gain) || 0.000
		this.desiredMagentaGain = parseFloat(this.config.saved_magenta_gain) || 0.000
		this.desiredYellowGain = parseFloat(this.config.saved_yellow_gain) || 0.000
		
		// Load measured gains
		for (const [color, gain] of Object.entries(this.measuredGains)) {
			gain.value = parseFloat(this.config[gain.configKey]) || 0.0000
		}
		
		this.debounceDelay = parseInt(this.config.debounce_delay) || 100
		this.enableDebugLogging = this.config.enable_debug_logging !== false
		
		this.updateStatus(InstanceStatus.Ok)
		
		this.debugLog('info', `Module initialized - RGB: ${this.rgbPowerLevel}%, NVG: ${this.nvgPowerLevel}%`)
		this.debugLog('info', `Desired - White: ${this.desiredWhiteGain.toFixed(3)}, Red: ${this.desiredRedGain.toFixed(3)}, Green: ${this.desiredGreenGain.toFixed(3)}, Blue: ${this.desiredBlueGain.toFixed(3)}, Cyan: ${this.desiredCyanGain.toFixed(3)}, Magenta: ${this.desiredMagentaGain.toFixed(3)}, Yellow: ${this.desiredYellowGain.toFixed(3)}`)
		this.debugLog('info', `Measured - White: ${this.measuredGains.white.value.toFixed(4)}, Red: ${this.measuredGains.red.value.toFixed(4)}, Green: ${this.measuredGains.green.value.toFixed(4)}, Blue: ${this.measuredGains.blue.value.toFixed(4)}`)
		
		// Initialize all managers
		this.actions.init()
		this.feedbacks.init()
		this.variables.init()
		this.presets.init()
		
		// Initialize network manager with config
		this.network.init(this.config)
		
		// Force enable network if not enabled
		if (!this.config.enable_network) {
			this.debugLog('info', 'Network control not enabled in config - enabling')
			this.config.enable_network = true
			this.network.init(this.config)
		}
	}

	getConfigFields() {
		return getConfigFields()
	}

	async destroy() {
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer)
			this.debounceTimer = null
			
			// Apply any pending desired gain changes
			if (this.pendingPowerLevel !== null) {
				this.applyPowerLevelChange(this.pendingPowerLevel)
			}
			if (this.pendingWhiteGain !== null) {
				this.applyWhiteGainChange(this.pendingWhiteGain)
			}
			if (this.pendingRedGain !== null) {
				this.applyRedGainChange(this.pendingRedGain)
			}
			if (this.pendingGreenGain !== null) {
				this.applyGreenGainChange(this.pendingGreenGain)
			}
			if (this.pendingBlueGain !== null) {
				this.applyBlueGainChange(this.pendingBlueGain)
			}
			if (this.pendingCyanGain !== null) {
				this.applyCyanGainChange(this.pendingCyanGain)
			}
			if (this.pendingMagentaGain !== null) {
				this.applyMagentaGainChange(this.pendingMagentaGain)
			}
			if (this.pendingYellowGain !== null) {
				this.applyYellowGainChange(this.pendingYellowGain)
			}
			
			// Apply any pending measured gain changes (NEW!)
			for (const [color, gain] of Object.entries(this.pendingMeasuredGains)) {
				if (gain !== null) {
					this.updateMeasuredGain(color, gain)
				}
			}
		}
		
		this.network.destroy()
		this.log('debug', 'Module destroyed')
	}

	async configUpdated(config) {
		this.config = config
		this.debounceDelay = parseInt(this.config.debounce_delay) || 100
		this.enableDebugLogging = this.config.enable_debug_logging !== false
		
		this.debugLog('info', `Config updated - debounce: ${this.debounceDelay}ms`)
		
		this.network.configUpdated(config)
	}

	debugLog(level, message) {
		if (level === 'error' || level === 'warn') {
			this.log(level, message)
			return
		}
		
		if (this.enableDebugLogging) {
			this.log(level, message)
		}
	}

	// SECTION: POWER LEVEL METHODS
	updatePowerLevel(type, newLevel, fromDevice = false) {
		const boundedLevel = Math.max(0, Math.min(100, newLevel))
		const isNVG = type === 'nvg'
		const currentLevel = isNVG ? this.nvgPowerLevel : this.rgbPowerLevel
		const configKey = isNVG ? 'saved_nvg_power' : 'saved_rgb_power'
		const feedbackTypes = isNVG ? ['nvg_power', 'nvg_power_range'] : ['rgb_power']
		const variableUpdate = isNVG ? this.variables.updateNVGPowerVariable : this.variables.updateRGBPowerVariable
		const logPrefix = isNVG ? 'NVG Power' : 'RGB Power'

		// If the level hasn't changed, don't do anything
		if (boundedLevel === currentLevel) {
			return
		}

		// Update the appropriate power level
		if (isNVG) {
			this.nvgPowerLevel = boundedLevel
		} else {
			this.rgbPowerLevel = boundedLevel
		}

		this.debugLog('info', `${logPrefix} changed to: ${boundedLevel}`)
		variableUpdate.call(this.variables)
		feedbackTypes.forEach(type => this.checkFeedbacks(type))
		this.saveConfig({ ...this.config, [configKey]: boundedLevel })

		// Send to device if this is a user-initiated change and we're connected
		if (!fromDevice && this.network && this.network.isConnected) {
			this.debugLog('info', `Sending ${logPrefix} command to device: ${boundedLevel}`)
			try {
				if (isNVG) {
					this.network.sendNVGPowerCommand(boundedLevel)
				} else {
					this.network.sendBrightnessCommand(boundedLevel)
				}
			} catch (error) {
				this.debugLog('error', `Error sending ${logPrefix} command: ${error.message}`)
			}
		}
	}

	updatePowerLevelDebounced(type, newLevel) {
		const boundedLevel = Math.max(0, Math.min(100, newLevel))
		const isNVG = type === 'nvg'
		const currentLevel = isNVG ? this.nvgPowerLevel : this.rgbPowerLevel
		const pendingKey = isNVG ? 'pendingNVGPowerLevel' : 'pendingPowerLevel'
		const configKey = isNVG ? 'saved_nvg_power' : 'saved_rgb_power'
		const feedbackTypes = isNVG ? ['nvg_power', 'nvg_power_range'] : ['rgb_power']
		const variableUpdate = isNVG ? this.variables.updateNVGPowerVariable : this.variables.updateRGBPowerVariable
		const logPrefix = isNVG ? 'NVG Power' : 'RGB Power'

		// If the level hasn't changed, don't do anything
		if (boundedLevel === currentLevel) {
			return
		}

		this[pendingKey] = boundedLevel
		
		// For NVG power, we want faster response, so use a shorter debounce
		const debounceDelay = isNVG ? Math.min(this.debounceDelay, 50) : this.debounceDelay
		
		if (debounceDelay === 0) {
			this.updatePowerLevel(type, boundedLevel, false)
			return
		}
		
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer)
		}
		
		// Update UI immediately for better responsiveness
		if (isNVG) {
			this.nvgPowerLevel = boundedLevel
		} else {
			this.rgbPowerLevel = boundedLevel
		}
		
		variableUpdate.call(this.variables)
		feedbackTypes.forEach(type => this.checkFeedbacks(type))
		this.saveConfig({ ...this.config, [configKey]: boundedLevel })
		
		// Send command immediately for increment/decrement
		if (this.network && this.network.isConnected) {
			this.debugLog('info', `Sending ${logPrefix} command to device: ${boundedLevel}`)
			try {
				if (isNVG) {
					this.network.sendNVGPowerCommand(boundedLevel)
				} else {
					this.network.sendBrightnessCommand(boundedLevel)
				}
			} catch (error) {
				this.debugLog('error', `Error sending ${logPrefix} command: ${error.message}`)
			}
		}
		
		this.debounceTimer = setTimeout(() => {
			this.updatePowerLevel(type, this[pendingKey], false)
			this.debounceTimer = null
			this[pendingKey] = null
		}, debounceDelay)
	}

	// SECTION: RGB POWER METHODS
	updateRGBPowerLevel(newLevel) {
		this.updatePowerLevel('rgb', newLevel, false)
	}

	updateRGBPowerLevelDebounced(newLevel) {
		this.updatePowerLevelDebounced('rgb', newLevel)
	}

	updateLocalRGBPowerFromDevice(newLevel) {
		this.updatePowerLevel('rgb', newLevel, true)
	}

	// SECTION: NVG POWER METHODS
	updateNVGPowerLevel(newLevel) {
		this.updatePowerLevel('nvg', newLevel, false)
	}

	updateNVGPowerLevelDebounced(newLevel) {
		this.updatePowerLevelDebounced('nvg', newLevel)
	}

	updateLocalNVGPowerFromDevice(newLevel) {
		this.updatePowerLevel('nvg', newLevel, true)
	}

	// SECTION: DEBOUNCED UPDATE METHODS (EXISTING)
	updateWhiteGainDebounced(newGain) {
		const boundedGain = Math.max(0.000, Math.min(1.000, newGain))
		this.pendingWhiteGain = boundedGain
		
		if (this.debounceDelay === 0) {
			this.applyWhiteGainChange(boundedGain)
			return
		}
		
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer)
		}
		
		this.desiredWhiteGain = boundedGain
		this.variables.updateWhiteGainVariable()
		this.checkFeedbacks()
		
		this.debounceTimer = setTimeout(() => {
			this.applyWhiteGainChange(this.pendingWhiteGain)
			this.debounceTimer = null
			this.pendingWhiteGain = null
		}, this.debounceDelay)
	}

	updateRedGainDebounced(newGain) {
		const boundedGain = Math.max(0.000, Math.min(1.000, newGain))
		this.pendingRedGain = boundedGain
		
		if (this.debounceDelay === 0) {
			this.applyRedGainChange(boundedGain)
			return
		}
		
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer)
		}
		
		this.desiredRedGain = boundedGain
		this.variables.updateRedGainVariable()
		this.checkFeedbacks()
		
		this.debounceTimer = setTimeout(() => {
			this.applyRedGainChange(this.pendingRedGain)
			this.debounceTimer = null
			this.pendingRedGain = null
		}, this.debounceDelay)
	}

	updateGreenGainDebounced(newGain) {
		const boundedGain = Math.max(0.000, Math.min(1.000, newGain))
		this.pendingGreenGain = boundedGain
		
		if (this.debounceDelay === 0) {
			this.applyGreenGainChange(boundedGain)
			return
		}
		
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer)
		}
		
		this.desiredGreenGain = boundedGain
		this.variables.updateGreenGainVariable()
		this.checkFeedbacks()
		
		this.debounceTimer = setTimeout(() => {
			this.applyGreenGainChange(this.pendingGreenGain)
			this.debounceTimer = null
			this.pendingGreenGain = null
		}, this.debounceDelay)
	}

	updateBlueGainDebounced(newGain) {
		const boundedGain = Math.max(0.000, Math.min(1.000, newGain))
		this.pendingBlueGain = boundedGain
		
		if (this.debounceDelay === 0) {
			this.applyBlueGainChange(boundedGain)
			return
		}
		
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer)
		}
		
		this.desiredBlueGain = boundedGain
		this.variables.updateBlueGainVariable()
		this.checkFeedbacks()
		
		this.debounceTimer = setTimeout(() => {
			this.applyBlueGainChange(this.pendingBlueGain)
			this.debounceTimer = null
			this.pendingBlueGain = null
		}, this.debounceDelay)
	}

	updateCyanGainDebounced(newGain) {
		const boundedGain = Math.max(0.000, Math.min(1.000, newGain))
		this.pendingCyanGain = boundedGain
		
		if (this.debounceDelay === 0) {
			this.applyCyanGainChange(boundedGain)
			return
		}
		
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer)
		}
		
		this.desiredCyanGain = boundedGain
		this.variables.updateCyanGainVariable()
		this.checkFeedbacks()
		
		this.debounceTimer = setTimeout(() => {
			this.applyCyanGainChange(this.pendingCyanGain)
			this.debounceTimer = null
			this.pendingCyanGain = null
		}, this.debounceDelay)
	}

	updateMagentaGainDebounced(newGain) {
		const boundedGain = Math.max(0.000, Math.min(1.000, newGain))
		this.pendingMagentaGain = boundedGain
		
		if (this.debounceDelay === 0) {
			this.applyMagentaGainChange(boundedGain)
			return
		}
		
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer)
		}
		
		this.desiredMagentaGain = boundedGain
		this.variables.updateMagentaGainVariable()
		this.checkFeedbacks()
		
		this.debounceTimer = setTimeout(() => {
			this.applyMagentaGainChange(this.pendingMagentaGain)
			this.debounceTimer = null
			this.pendingMagentaGain = null
		}, this.debounceDelay)
	}

	updateYellowGainDebounced(newGain) {
		const boundedGain = Math.max(0.000, Math.min(1.000, newGain))
		this.pendingYellowGain = boundedGain
		
		if (this.debounceDelay === 0) {
			this.applyYellowGainChange(boundedGain)
			return
		}
		
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer)
		}
		
		this.desiredYellowGain = boundedGain
		this.variables.updateYellowGainVariable()
		this.checkFeedbacks()
		
		this.debounceTimer = setTimeout(() => {
			this.applyYellowGainChange(this.pendingYellowGain)
			this.debounceTimer = null
			this.pendingYellowGain = null
		}, this.debounceDelay)
	}

	// NEW SECTION: MEASURED GAIN DEBOUNCED UPDATE METHODS
	updateMeasuredWhiteGainDebounced(newGain) {
		try {
			if (typeof newGain !== 'number' && typeof newGain !== 'string') {
				this.debugLog('warn', `Invalid measured white gain value type: ${typeof newGain}`)
				return
			}

			const gain = typeof newGain === 'string' ? parseFloat(newGain) : newGain
			if (isNaN(gain)) {
				this.debugLog('warn', `Invalid measured white gain value: ${newGain}`)
				return
			}

			const boundedGain = Math.max(0.0000, Math.min(1.0000, gain))
			this.pendingMeasuredGains.white = boundedGain
			if (this.measuredGainUpdateTimeout) {
				clearTimeout(this.measuredGainUpdateTimeout)
			}
			this.measuredGainUpdateTimeout = setTimeout(() => {
				this.updateLocalMeasuredGainFromDevice('white', this.pendingMeasuredGains.white)
			}, 100)
		} catch (error) {
			this.debugLog('error', `Error updating measured white gain: ${error.message}`)
		}
	}

	updateMeasuredRedGainDebounced(newGain) {
		try {
			if (typeof newGain !== 'number' && typeof newGain !== 'string') {
				this.debugLog('warn', `Invalid measured red gain value type: ${typeof newGain}`)
				return
			}

			const gain = typeof newGain === 'string' ? parseFloat(newGain) : newGain
			if (isNaN(gain)) {
				this.debugLog('warn', `Invalid measured red gain value: ${newGain}`)
				return
			}

			const boundedGain = Math.max(0.0000, Math.min(1.0000, gain))
			this.pendingMeasuredGains.red = boundedGain
			if (this.measuredGainUpdateTimeout) {
				clearTimeout(this.measuredGainUpdateTimeout)
			}
			this.measuredGainUpdateTimeout = setTimeout(() => {
				this.updateLocalMeasuredGainFromDevice('red', this.pendingMeasuredGains.red)
			}, 100)
		} catch (error) {
			this.debugLog('error', `Error updating measured red gain: ${error.message}`)
		}
	}

	updateMeasuredGreenGainDebounced(newGain) {
		try {
			if (typeof newGain !== 'number' && typeof newGain !== 'string') {
				this.debugLog('warn', `Invalid measured green gain value type: ${typeof newGain}`)
				return
			}

			const gain = typeof newGain === 'string' ? parseFloat(newGain) : newGain
			if (isNaN(gain)) {
				this.debugLog('warn', `Invalid measured green gain value: ${newGain}`)
				return
			}

			const boundedGain = Math.max(0.0000, Math.min(1.0000, gain))
			this.pendingMeasuredGains.green = boundedGain
			if (this.measuredGainUpdateTimeout) {
				clearTimeout(this.measuredGainUpdateTimeout)
			}
			this.measuredGainUpdateTimeout = setTimeout(() => {
				this.updateLocalMeasuredGainFromDevice('green', this.pendingMeasuredGains.green)
			}, 100)
		} catch (error) {
			this.debugLog('error', `Error updating measured green gain: ${error.message}`)
		}
	}

	updateMeasuredBlueGainDebounced(newGain) {
		try {
			if (typeof newGain !== 'number' && typeof newGain !== 'string') {
				this.debugLog('warn', `Invalid measured blue gain value type: ${typeof newGain}`)
				return
			}

			const gain = typeof newGain === 'string' ? parseFloat(newGain) : newGain
			if (isNaN(gain)) {
				this.debugLog('warn', `Invalid measured blue gain value: ${newGain}`)
				return
			}

			const boundedGain = Math.max(0.0000, Math.min(1.0000, gain))
			this.pendingMeasuredGains.blue = boundedGain
			if (this.measuredGainUpdateTimeout) {
				clearTimeout(this.measuredGainUpdateTimeout)
			}
			this.measuredGainUpdateTimeout = setTimeout(() => {
				this.updateLocalMeasuredGainFromDevice('blue', this.pendingMeasuredGains.blue)
			}, 100)
		} catch (error) {
			this.debugLog('error', `Error updating measured blue gain: ${error.message}`)
		}
	}

	// SECTION: APPLY METHODS (EXISTING)
	applyPowerLevelChange(newLevel) {
		this.rgbPowerLevel = newLevel
		this.debugLog('info', `RGB Power applied: ${this.rgbPowerLevel}`)

		this.variables.updateRGBPowerVariable()

		if (this.network.isConnected) {
			this.network.sendBrightnessCommand(this.rgbPowerLevel)
		}

		this.saveConfig({ ...this.config, saved_rgb_power: this.rgbPowerLevel })
		this.checkFeedbacks()
	}

	applyWhiteGainChange(newGain) {
		this.desiredWhiteGain = newGain
		this.debugLog('info', `White Gain applied: ${this.desiredWhiteGain.toFixed(3)}`)

		this.variables.updateWhiteGainVariable()

		if (this.network.isConnected) {
			this.network.sendWhiteGainCommand(this.desiredWhiteGain)
		}

		this.saveConfig({ ...this.config, saved_white_gain: this.desiredWhiteGain })
		this.checkFeedbacks()
	}

	applyRedGainChange(newGain) {
		this.desiredRedGain = newGain
		this.debugLog('info', `Red Gain applied: ${this.desiredRedGain.toFixed(3)}`)

		this.variables.updateRedGainVariable()

		if (this.network.isConnected) {
			this.network.sendRedGainCommand(this.desiredRedGain)
		}

		this.saveConfig({ ...this.config, saved_red_gain: this.desiredRedGain })
		this.checkFeedbacks()
	}

	applyGreenGainChange(newGain) {
		this.desiredGreenGain = newGain
		this.debugLog('info', `Green Gain applied: ${this.desiredGreenGain.toFixed(3)}`)

		this.variables.updateGreenGainVariable()

		if (this.network.isConnected) {
			this.network.sendGreenGainCommand(this.desiredGreenGain)
		}

		this.saveConfig({ ...this.config, saved_green_gain: this.desiredGreenGain })
		this.checkFeedbacks()
	}

	applyBlueGainChange(newGain) {
		this.desiredBlueGain = newGain
		this.debugLog('info', `Blue Gain applied: ${this.desiredBlueGain.toFixed(3)}`)

		this.variables.updateBlueGainVariable()

		if (this.network.isConnected) {
			this.network.sendBlueGainCommand(this.desiredBlueGain)
		}

		this.saveConfig({ ...this.config, saved_blue_gain: this.desiredBlueGain })
		this.checkFeedbacks()
	}

	applyCyanGainChange(newGain) {
		this.desiredCyanGain = newGain
		this.debugLog('info', `Cyan Gain applied: ${this.desiredCyanGain.toFixed(3)}`)

		this.variables.updateCyanGainVariable()

		if (this.network.isConnected) {
			this.network.sendCyanGainCommand(this.desiredCyanGain)
		}

		this.saveConfig({ ...this.config, saved_cyan_gain: this.desiredCyanGain })
		this.checkFeedbacks()
	}

	applyMagentaGainChange(newGain) {
		this.desiredMagentaGain = newGain
		this.debugLog('info', `Magenta Gain applied: ${this.desiredMagentaGain.toFixed(3)}`)

		this.variables.updateMagentaGainVariable()

		if (this.network.isConnected) {
			this.network.sendMagentaGainCommand(this.desiredMagentaGain)
		}

		this.saveConfig({ ...this.config, saved_magenta_gain: this.desiredMagentaGain })
		this.checkFeedbacks()
	}

	applyYellowGainChange(newGain) {
		this.desiredYellowGain = newGain
		this.debugLog('info', `Yellow Gain applied: ${this.desiredYellowGain.toFixed(3)}`)

		this.variables.updateYellowGainVariable()

		if (this.network.isConnected) {
			this.network.sendYellowGainCommand(this.desiredYellowGain)
		}

		this.saveConfig({ ...this.config, saved_yellow_gain: this.desiredYellowGain })
		this.checkFeedbacks()
	}

	// NEW SECTION: MEASURED GAIN APPLY METHODS
	updateMeasuredGain(color, newGain) {
		const gain = this.measuredGains[color]
		if (!gain) return

		const boundedGain = Math.max(0.0000, Math.min(1.0000, newGain))
		gain.value = boundedGain
		this.debugLog('info', `Measured ${color} Gain applied: ${boundedGain.toFixed(4)}`)

		// Update variable
		this.variables[`updateMeasured${color.charAt(0).toUpperCase() + color.slice(1)}GainVariable`]()
		
		// Update RGB sum if needed
		if (color !== 'white') {
			this.variables.updateMeasuredRGBSumVariable()
		}

		// Send to device if connected and not updating from device
		if (this.network.isConnected && !this.isUpdatingFromDevice) {
			this.isUpdatingFromDevice = true
			this.network[`sendMeasured${color.charAt(0).toUpperCase() + color.slice(1)}GainCommand`](boundedGain)
			this.isUpdatingFromDevice = false
		}

		// Save to config
		this.saveConfig({ ...this.config, [gain.configKey]: boundedGain })
		
		// Update feedbacks
		this.checkFeedbacks()
	}

	// NEW SECTION: DESIRED GAIN APPLY METHODS
	updateDesiredGain(color, newGain, fromDevice = false) {
		const boundedGain = Math.max(0.000, Math.min(1.000, newGain))
		this[`desired${color}Gain`] = boundedGain
		this.debugLog('info', `Desired ${color} Gain applied: ${boundedGain.toFixed(3)}`)

		// Update variable
		this.variables[`update${color}GainVariable`]()

		// Only send to device if this is a user-initiated change
		if (!fromDevice && this.network.isConnected) {
			this.network[`send${color}GainCommand`](boundedGain)
		}

		// Save to config
		this.saveConfig({ ...this.config, [`saved_${color.toLowerCase()}_gain`]: boundedGain })
		
		// Update feedbacks
		this.checkFeedbacks()
	}

	// SECTION: IMMEDIATE UPDATE METHODS (EXISTING)
	updateWhiteGain(newGain) {
		this.updateDesiredGain('White', newGain, false)
	}

	updateRedGain(newGain) {
		this.updateDesiredGain('Red', newGain, false)
	}

	updateGreenGain(newGain) {
		this.updateDesiredGain('Green', newGain, false)
	}

	updateBlueGain(newGain) {
		this.updateDesiredGain('Blue', newGain, false)
	}

	updateCyanGain(newGain) {
		this.updateDesiredGain('Cyan', newGain, false)
	}

	updateMagentaGain(newGain) {
		this.updateDesiredGain('Magenta', newGain, false)
	}

	updateYellowGain(newGain) {
		this.updateDesiredGain('Yellow', newGain, false)
	}

	// NEW SECTION: DEVICE UPDATE METHODS
	updateWhiteGainFromDevice(newGain) {
		this.updateDesiredGain('White', newGain, true)
	}

	updateRedGainFromDevice(newGain) {
		this.updateDesiredGain('Red', newGain, true)
	}

	updateGreenGainFromDevice(newGain) {
		this.updateDesiredGain('Green', newGain, true)
	}

	updateBlueGainFromDevice(newGain) {
		this.updateDesiredGain('Blue', newGain, true)
	}

	updateCyanGainFromDevice(newGain) {
		this.updateDesiredGain('Cyan', newGain, true)
	}

	updateMagentaGainFromDevice(newGain) {
		this.updateDesiredGain('Magenta', newGain, true)
	}

	updateYellowGainFromDevice(newGain) {
		this.updateDesiredGain('Yellow', newGain, true)
	}

	// NEW SECTION: MEASURED GAIN DEVICE UPDATE METHODS
	updateLocalMeasuredGainFromDevice(color, newGain) {
		const gain = this.measuredGains[color]
		if (!gain) return

		const boundedGain = Math.max(0.0000, Math.min(1.0000, newGain))
		gain.value = boundedGain
		this.debugLog('info', `Local measured ${color} gain updated from device: ${boundedGain.toFixed(4)}`)

		// Update variable
		this.variables[`updateMeasured${color.charAt(0).toUpperCase() + color.slice(1)}GainVariable`]()
		
		// Update RGB sum if needed
		if (color !== 'white') {
			this.variables.updateMeasuredRGBSumVariable()
		}

		// Save to config
		this.saveConfig({ ...this.config, [gain.configKey]: boundedGain })
		
		// Update feedbacks
		this.checkFeedbacks()
	}

	// NEW: MEASURED GAIN ACTIONS
	updateMeasuredWhiteGain(action) {
		try {
			const gain = parseFloat(action.options.gain)
			if (isNaN(gain)) {
				this.debugLog('warn', `Invalid measured white gain value from action: ${action.options.gain}`)
				return
			}
			const boundedGain = Math.max(0.0000, Math.min(1.0000, gain))
			this.debugLog('info', `Setting measured white gain to: ${boundedGain.toFixed(4)}`)
			this.updateMeasuredGain('white', boundedGain)
		} catch (error) {
			this.debugLog('error', `Error in updateMeasuredWhiteGain action: ${error.message}`)
		}
	}

	updateMeasuredRedGain(action) {
		try {
			const gain = parseFloat(action.options.gain)
			if (isNaN(gain)) {
				this.debugLog('warn', `Invalid measured red gain value from action: ${action.options.gain}`)
				return
			}
			const boundedGain = Math.max(0.0000, Math.min(1.0000, gain))
			this.debugLog('info', `Setting measured red gain to: ${boundedGain.toFixed(4)}`)
			this.updateMeasuredGain('red', boundedGain)
		} catch (error) {
			this.debugLog('error', `Error in updateMeasuredRedGain action: ${error.message}`)
		}
	}

	updateMeasuredGreenGain(action) {
		try {
			const gain = parseFloat(action.options.gain)
			if (isNaN(gain)) {
				this.debugLog('warn', `Invalid measured green gain value from action: ${action.options.gain}`)
				return
			}
			const boundedGain = Math.max(0.0000, Math.min(1.0000, gain))
			this.debugLog('info', `Setting measured green gain to: ${boundedGain.toFixed(4)}`)
			this.updateMeasuredGain('green', boundedGain)
		} catch (error) {
			this.debugLog('error', `Error in updateMeasuredGreenGain action: ${error.message}`)
		}
	}

	updateMeasuredBlueGain(action) {
		try {
			const gain = parseFloat(action.options.gain)
			if (isNaN(gain)) {
				this.debugLog('warn', `Invalid measured blue gain value from action: ${action.options.gain}`)
				return
			}
			const boundedGain = Math.max(0.0000, Math.min(1.0000, gain))
			this.debugLog('info', `Setting measured blue gain to: ${boundedGain.toFixed(4)}`)
			this.updateMeasuredGain('blue', boundedGain)
		} catch (error) {
			this.debugLog('error', `Error in updateMeasuredBlueGain action: ${error.message}`)
		}
	}
}

runEntrypoint(NorxeUnifyInstance, [])