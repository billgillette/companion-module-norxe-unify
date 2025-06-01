// Version 1.9.1 - Complete RGB + Gain Control Module - SECTION 1
const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const net = require('net')

class NorxeUnifyInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		
		this.rgbPowerLevel = 0
		this.desiredWhiteGain = 0.000
		this.desiredRedGain = 0.000
		this.desiredGreenGain = 0.000
		this.desiredBlueGain = 0.000
		this.desiredCyanGain = 0.000
		this.desiredMagentaGain = 0.000
		this.desiredYellowGain = 0.000
		
		this.debounceTimer = null
		this.pendingPowerLevel = null
		this.pendingWhiteGain = null
		this.pendingRedGain = null
		this.pendingGreenGain = null
		this.pendingBlueGain = null
		this.pendingCyanGain = null
		this.pendingMagentaGain = null
		this.pendingYellowGain = null
		this.debounceDelay = 100
		
		this.socket = null
		this.isConnected = false
		this.reconnectTimer = null
		this.messageBuffer = ''
		this.messageId = 1
		this.isSubscribedToNotifications = false
		this.enableDebugLogging = true
	}

	async init(config) {
		this.config = config
		
		this.rgbPowerLevel = parseInt(this.config.saved_rgb_power) || 0
		this.desiredWhiteGain = parseFloat(this.config.saved_white_gain) || 0.000
		this.desiredRedGain = parseFloat(this.config.saved_red_gain) || 0.000
		this.desiredGreenGain = parseFloat(this.config.saved_green_gain) || 0.000
		this.desiredBlueGain = parseFloat(this.config.saved_blue_gain) || 0.000
		this.desiredCyanGain = parseFloat(this.config.saved_cyan_gain) || 0.000
		this.desiredMagentaGain = parseFloat(this.config.saved_magenta_gain) || 0.000
		this.desiredYellowGain = parseFloat(this.config.saved_yellow_gain) || 0.000
		
		this.debounceDelay = parseInt(this.config.debounce_delay) || 100
		this.enableDebugLogging = this.config.enable_debug_logging !== false
		
		this.updateStatus(InstanceStatus.Ok)
		
		this.debugLog('info', `Module initialized - RGB: ${this.rgbPowerLevel}%, White: ${this.desiredWhiteGain.toFixed(3)}, Red: ${this.desiredRedGain.toFixed(3)}, Green: ${this.desiredGreenGain.toFixed(3)}, Blue: ${this.desiredBlueGain.toFixed(3)}, Cyan: ${this.desiredCyanGain.toFixed(3)}, Magenta: ${this.desiredMagentaGain.toFixed(3)}, Yellow: ${this.desiredYellowGain.toFixed(3)}`)
		
		this.initActions()
		this.initFeedbacks()
		this.initVariables()
		this.initPresets()
		
		if (this.config.enable_network) {
			this.initTCPConnection()
		} else {
			this.debugLog('info', 'Network control disabled')
		}
	}

	getConfigFields() {
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
				id: 'saved_white_gain',
				label: 'White Gain (Saved)',
				width: 3,
				min: 0,
				max: 1,
				step: 0.001,
				default: 0.000,
				tooltip: 'Auto-updated white gain'
			},
			{
				type: 'number',
				id: 'saved_red_gain',
				label: 'Red Gain (Saved)',
				width: 3,
				min: 0,
				max: 1,
				step: 0.001,
				default: 0.000,
				tooltip: 'Auto-updated red gain'
			},
			{
				type: 'number',
				id: 'saved_green_gain',
				label: 'Green Gain (Saved)',
				width: 3,
				min: 0,
				max: 1,
				step: 0.001,
				default: 0.000,
				tooltip: 'Auto-updated green gain'
			},
			{
				type: 'number',
				id: 'saved_blue_gain',
				label: 'Blue Gain (Saved)',
				width: 3,
				min: 0,
				max: 1,
				step: 0.001,
				default: 0.000,
				tooltip: 'Auto-updated blue gain'
			},
			{
				type: 'number',
				id: 'saved_cyan_gain',
				label: 'Cyan Gain (Saved)',
				width: 3,
				min: 0,
				max: 1,
				step: 0.001,
				default: 0.000,
				tooltip: 'Auto-updated cyan gain'
			},
			{
				type: 'number',
				id: 'saved_magenta_gain',
				label: 'Magenta Gain (Saved)',
				width: 3,
				min: 0,
				max: 1,
				step: 0.001,
				default: 0.000,
				tooltip: 'Auto-updated magenta gain'
			},
			{
				type: 'number',
				id: 'saved_yellow_gain',
				label: 'Yellow Gain (Saved)',
				width: 3,
				min: 0,
				max: 1,
				step: 0.001,
				default: 0.000,
				tooltip: 'Auto-updated yellow gain'
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

	async destroy() {
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer)
			this.debounceTimer = null
			
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
		}
		
		this.closeTCPConnection()
		this.log('debug', 'Module destroyed')
	}

	async configUpdated(config) {
		this.config = config
		this.debounceDelay = parseInt(this.config.debounce_delay) || 100
		this.enableDebugLogging = this.config.enable_debug_logging !== false
		
		this.debugLog('info', `Config updated - debounce: ${this.debounceDelay}ms`)
		
		if (this.config.enable_network && !this.isConnected) {
			this.debugLog('info', 'Network control enabled - initializing TCP connection')
			this.initTCPConnection()
		} else if (!this.config.enable_network && this.isConnected) {
			this.debugLog('info', 'Network control disabled - closing TCP connection')
			this.closeTCPConnection()
		}
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

// SECTION 2: DEBOUNCED UPDATE METHODS
	updateRGBPowerLevelDebounced(newLevel) {
		const boundedLevel = Math.max(0, Math.min(100, newLevel))
		this.pendingPowerLevel = boundedLevel
		
		if (this.debounceDelay === 0) {
			this.applyPowerLevelChange(boundedLevel)
			return
		}
		
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer)
		}
		
		this.rgbPowerLevel = boundedLevel
		this.setVariableValues({ rgb_power_level: this.rgbPowerLevel })
		this.checkFeedbacks()
		
		this.debounceTimer = setTimeout(() => {
			this.applyPowerLevelChange(this.pendingPowerLevel)
			this.debounceTimer = null
			this.pendingPowerLevel = null
		}, this.debounceDelay)
	}

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
		this.setVariableValues({ desired_white_gain: this.desiredWhiteGain.toFixed(3) })
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
		this.setVariableValues({ desired_red_gain: this.desiredRedGain.toFixed(3) })
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
		this.setVariableValues({ desired_green_gain: this.desiredGreenGain.toFixed(3) })
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
		this.setVariableValues({ desired_blue_gain: this.desiredBlueGain.toFixed(3) })
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
		this.setVariableValues({ desired_cyan_gain: this.desiredCyanGain.toFixed(3) })
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
		this.setVariableValues({ desired_magenta_gain: this.desiredMagentaGain.toFixed(3) })
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
		this.setVariableValues({ desired_yellow_gain: this.desiredYellowGain.toFixed(3) })
		this.checkFeedbacks()
		
		this.debounceTimer = setTimeout(() => {
			this.applyYellowGainChange(this.pendingYellowGain)
			this.debounceTimer = null
			this.pendingYellowGain = null
		}, this.debounceDelay)
	}
	applyPowerLevelChange(newLevel) {
			this.rgbPowerLevel = newLevel
			this.debugLog('info', `RGB Power applied: ${this.rgbPowerLevel}`)
		
			this.setVariableValues({ rgb_power_level: this.rgbPowerLevel })
		
			if (this.isConnected) {
				this.sendBrightnessCommand(this.rgbPowerLevel)
			}
		
			this.saveConfig({ ...this.config, saved_rgb_power: this.rgbPowerLevel })
			this.checkFeedbacks()
		}

		applyWhiteGainChange(newGain) {
			this.desiredWhiteGain = newGain
			this.debugLog('info', `White Gain applied: ${this.desiredWhiteGain.toFixed(3)}`)
		
			this.setVariableValues({ desired_white_gain: this.desiredWhiteGain.toFixed(3) })
		
			if (this.isConnected) {
				this.sendWhiteGainCommand(this.desiredWhiteGain)
			}
		
			this.saveConfig({ ...this.config, saved_white_gain: this.desiredWhiteGain })
			this.checkFeedbacks()
		}

		applyRedGainChange(newGain) {
			this.desiredRedGain = newGain
			this.debugLog('info', `Red Gain applied: ${this.desiredRedGain.toFixed(3)}`)
		
			this.setVariableValues({ desired_red_gain: this.desiredRedGain.toFixed(3) })
		
			if (this.isConnected) {
				this.sendRedGainCommand(this.desiredRedGain)
			}
		
			this.saveConfig({ ...this.config, saved_red_gain: this.desiredRedGain })
			this.checkFeedbacks()
		}

		applyGreenGainChange(newGain) {
			this.desiredGreenGain = newGain
			this.debugLog('info', `Green Gain applied: ${this.desiredGreenGain.toFixed(3)}`)
		
			this.setVariableValues({ desired_green_gain: this.desiredGreenGain.toFixed(3) })
		
			if (this.isConnected) {
				this.sendGreenGainCommand(this.desiredGreenGain)
			}
		
			this.saveConfig({ ...this.config, saved_green_gain: this.desiredGreenGain })
			this.checkFeedbacks()
		}

		applyBlueGainChange(newGain) {
			this.desiredBlueGain = newGain
			this.debugLog('info', `Blue Gain applied: ${this.desiredBlueGain.toFixed(3)}`)
		
			this.setVariableValues({ desired_blue_gain: this.desiredBlueGain.toFixed(3) })
		
			if (this.isConnected) {
				this.sendBlueGainCommand(this.desiredBlueGain)
			}
		
			this.saveConfig({ ...this.config, saved_blue_gain: this.desiredBlueGain })
			this.checkFeedbacks()
		}

		applyCyanGainChange(newGain) {
			this.desiredCyanGain = newGain
			this.debugLog('info', `Cyan Gain applied: ${this.desiredCyanGain.toFixed(3)}`)
		
			this.setVariableValues({ desired_cyan_gain: this.desiredCyanGain.toFixed(3) })
		
			if (this.isConnected) {
				this.sendCyanGainCommand(this.desiredCyanGain)
			}
		
			this.saveConfig({ ...this.config, saved_cyan_gain: this.desiredCyanGain })
			this.checkFeedbacks()
		}

		applyMagentaGainChange(newGain) {
			this.desiredMagentaGain = newGain
			this.debugLog('info', `Magenta Gain applied: ${this.desiredMagentaGain.toFixed(3)}`)
		
			this.setVariableValues({ desired_magenta_gain: this.desiredMagentaGain.toFixed(3) })
		
			if (this.isConnected) {
				this.sendMagentaGainCommand(this.desiredMagentaGain)
			}
		
			this.saveConfig({ ...this.config, saved_magenta_gain: this.desiredMagentaGain })
			this.checkFeedbacks()
		}

		applyYellowGainChange(newGain) {
			this.desiredYellowGain = newGain
			this.debugLog('info', `Yellow Gain applied: ${this.desiredYellowGain.toFixed(3)}`)
		
			this.setVariableValues({ desired_yellow_gain: this.desiredYellowGain.toFixed(3) })
		
			if (this.isConnected) {
				this.sendYellowGainCommand(this.desiredYellowGain)
			}
		
			this.saveConfig({ ...this.config, saved_yellow_gain: this.desiredYellowGain })
			this.checkFeedbacks()
		}

		// IMMEDIATE UPDATE METHODS (NO DEBOUNCE)
		updateRGBPowerLevel(newLevel) {
			this.rgbPowerLevel = Math.max(0, Math.min(100, newLevel))
			this.debugLog('info', `RGB Power changed to: ${this.rgbPowerLevel}`)
		
			this.setVariableValues({ rgb_power_level: this.rgbPowerLevel })
		
			if (this.isConnected) {
				this.sendBrightnessCommand(this.rgbPowerLevel)
			}
		
			this.saveConfig({ ...this.config, saved_rgb_power: this.rgbPowerLevel })
			this.checkFeedbacks()
		}

		updateWhiteGain(newGain) {
			this.desiredWhiteGain = Math.max(0.000, Math.min(1.000, newGain))
			this.debugLog('info', `White Gain changed to: ${this.desiredWhiteGain.toFixed(3)}`)
		
			this.setVariableValues({ desired_white_gain: this.desiredWhiteGain.toFixed(3) })
		
			if (this.isConnected) {
				this.sendWhiteGainCommand(this.desiredWhiteGain)
			}
		
			this.saveConfig({ ...this.config, saved_white_gain: this.desiredWhiteGain })
			this.checkFeedbacks()
		}

		updateRedGain(newGain) {
			this.desiredRedGain = Math.max(0.000, Math.min(1.000, newGain))
			this.debugLog('info', `Red Gain changed to: ${this.desiredRedGain.toFixed(3)}`)
		
			this.setVariableValues({ desired_red_gain: this.desiredRedGain.toFixed(3) })
		
			if (this.isConnected) {
				this.sendRedGainCommand(this.desiredRedGain)
			}
		
			this.saveConfig({ ...this.config, saved_red_gain: this.desiredRedGain })
			this.checkFeedbacks()
		}

		updateGreenGain(newGain) {
			this.desiredGreenGain = Math.max(0.000, Math.min(1.000, newGain))
			this.debugLog('info', `Green Gain changed to: ${this.desiredGreenGain.toFixed(3)}`)
		
			this.setVariableValues({ desired_green_gain: this.desiredGreenGain.toFixed(3) })
		
			if (this.isConnected) {
				this.sendGreenGainCommand(this.desiredGreenGain)
			}
		
			this.saveConfig({ ...this.config, saved_green_gain: this.desiredGreenGain })
			this.checkFeedbacks()
		}

		updateBlueGain(newGain) {
			this.desiredBlueGain = Math.max(0.000, Math.min(1.000, newGain))
			this.debugLog('info', `Blue Gain changed to: ${this.desiredBlueGain.toFixed(3)}`)
		
			this.setVariableValues({ desired_blue_gain: this.desiredBlueGain.toFixed(3) })
		
			if (this.isConnected) {
				this.sendBlueGainCommand(this.desiredBlueGain)
			}
		
			this.saveConfig({ ...this.config, saved_blue_gain: this.desiredBlueGain })
			this.checkFeedbacks()
		}

		updateCyanGain(newGain) {
			this.desiredCyanGain = Math.max(0.000, Math.min(1.000, newGain))
			this.debugLog('info', `Cyan Gain changed to: ${this.desiredCyanGain.toFixed(3)}`)
		
			this.setVariableValues({ desired_cyan_gain: this.desiredCyanGain.toFixed(3) })
		
			if (this.isConnected) {
				this.sendCyanGainCommand(this.desiredCyanGain)
			}
		
			this.saveConfig({ ...this.config, saved_cyan_gain: this.desiredCyanGain })
			this.checkFeedbacks()
		}

		updateMagentaGain(newGain) {
			this.desiredMagentaGain = Math.max(0.000, Math.min(1.000, newGain))
			this.debugLog('info', `Magenta Gain changed to: ${this.desiredMagentaGain.toFixed(3)}`)
		
			this.setVariableValues({ desired_magenta_gain: this.desiredMagentaGain.toFixed(3) })
		
			if (this.isConnected) {
				this.sendMagentaGainCommand(this.desiredMagentaGain)
			}
		
			this.saveConfig({ ...this.config, saved_magenta_gain: this.desiredMagentaGain })
			this.checkFeedbacks()
		}

		updateYellowGain(newGain) {
			this.desiredYellowGain = Math.max(0.000, Math.min(1.000, newGain))
			this.debugLog('info', `Yellow Gain changed to: ${this.desiredYellowGain.toFixed(3)}`)
		
			this.setVariableValues({ desired_yellow_gain: this.desiredYellowGain.toFixed(3) })
		
			if (this.isConnected) {
				this.sendYellowGainCommand(this.desiredYellowGain)
			}
		
			this.saveConfig({ ...this.config, saved_yellow_gain: this.desiredYellowGain })
			this.checkFeedbacks()
		}

		initTCPConnection() {
			const host = this.config.host || '192.168.4.188'
			const port = parseInt(this.config.port) || 49374
		
			this.debugLog('info', `Attempting TCP connection to ${host}:${port}`)
			this.updateStatus(InstanceStatus.Connecting)
		
			this.socket = new net.Socket()
		
			this.socket.on('connect', () => {
				this.debugLog('info', `TCP connected to ${host}:${port}`)
				this.isConnected = true
				this.updateStatus(InstanceStatus.Ok)
				this.messageBuffer = ''
			
				this.subscribeToNotifications()
				this.queryDeviceState()
			})
		
			this.socket.on('data', (data) => {
				this.handleIncomingData(data)
			})
		
			this.socket.on('error', (err) => {
				this.log('error', `TCP connection error: ${err.message}`)
				this.updateStatus(InstanceStatus.ConnectionFailure)
				this.isConnected = false
				this.scheduleReconnect()
			})
		
			this.socket.on('close', () => {
				this.log('warn', 'TCP connection closed')
				this.isConnected = false
				this.isSubscribedToNotifications = false
				this.updateStatus(InstanceStatus.ConnectionFailure)
				this.scheduleReconnect()
			})
		
			this.socket.connect(port, host)
		}

		closeTCPConnection() {
			if (this.reconnectTimer) {
				clearTimeout(this.reconnectTimer)
				this.reconnectTimer = null
			}
		
			if (this.socket) {
				this.socket.destroy()
				this.socket = null
			}
		
			this.isConnected = false
			this.isSubscribedToNotifications = false
			this.updateStatus(InstanceStatus.Ok)
		}

		scheduleReconnect() {
			if (!this.config.enable_network) return
		
			if (this.reconnectTimer) {
				clearTimeout(this.reconnectTimer)
			}
		
			this.reconnectTimer = setTimeout(() => {
				this.debugLog('info', 'Attempting to reconnect...')
				this.initTCPConnection()
			}, 5000)
		}

		handleIncomingData(data) {
			this.messageBuffer += data.toString()
		
			const messages = this.messageBuffer.split('\n')
			this.messageBuffer = messages.pop() || ''
		
			messages.forEach(message => {
				if (message.trim()) {
					this.debugLog('debug', `Received: ${message}`)
					this.processJSONRPCMessage(message.trim())
				}
			})
		}

		processJSONRPCMessage(messageStr) {
			try {
				const message = JSON.parse(messageStr)
			
				if (message.id) {
					this.debugLog('info', `JSON-RPC Response: ${JSON.stringify(message)}`)
				
					if (message.error) {
						this.log('error', `JSON-RPC Error: ${JSON.stringify(message.error)}`)
					} else {
						// Handle query responses
						if (message.id.startsWith('query_brightness_')) {
							const currentLevel = parseInt(message.result)
							if (!isNaN(currentLevel)) {
								this.debugLog('info', `Device brightness queried: ${currentLevel}`)
								this.updateLocalStateFromDevice(currentLevel)
							}
						}
						else if (message.id.startsWith('query_whitegain_')) {
							const currentGain = parseFloat(message.result)
							if (!isNaN(currentGain)) {
								this.debugLog('info', `Device white gain queried: ${currentGain.toFixed(3)}`)
								this.updateLocalWhiteGainFromDevice(currentGain)
							}
						}
						else if (message.id.startsWith('query_redgain_')) {
							const currentGain = parseFloat(message.result)
							if (!isNaN(currentGain)) {
								this.debugLog('info', `Device red gain queried: ${currentGain.toFixed(3)}`)
								this.updateLocalRedGainFromDevice(currentGain)
							}
						}
						else if (message.id.startsWith('query_greengain_')) {
							const currentGain = parseFloat(message.result)
							if (!isNaN(currentGain)) {
								this.debugLog('info', `Device green gain queried: ${currentGain.toFixed(3)}`)
								this.updateLocalGreenGainFromDevice(currentGain)
							}
						}
						else if (message.id.startsWith('query_bluegain_')) {
							const currentGain = parseFloat(message.result)
							if (!isNaN(currentGain)) {
								this.debugLog('info', `Device blue gain queried: ${currentGain.toFixed(3)}`)
								this.updateLocalBlueGainFromDevice(currentGain)
							}
						}
						else if (message.id.startsWith('query_cyangain_')) {
							const currentGain = parseFloat(message.result)
							if (!isNaN(currentGain)) {
								this.debugLog('info', `Device cyan gain queried: ${currentGain.toFixed(3)}`)
								this.updateLocalCyanGainFromDevice(currentGain)
							}
						}
						else if (message.id.startsWith('query_magentagain_')) {
							const currentGain = parseFloat(message.result)
							if (!isNaN(currentGain)) {
								this.debugLog('info', `Device magenta gain queried: ${currentGain.toFixed(3)}`)
								this.updateLocalMagentaGainFromDevice(currentGain)
							}
						}
						else if (message.id.startsWith('query_yellowgain_')) {
							const currentGain = parseFloat(message.result)
							if (!isNaN(currentGain)) {
								this.debugLog('info', `Device yellow gain queried: ${currentGain.toFixed(3)}`)
								this.updateLocalYellowGainFromDevice(currentGain)
							}
						}
					}
				}
				else if (message.method) {
					this.debugLog('info', `JSON-RPC Notification: ${JSON.stringify(message)}`)
				
					if (message.method === 'lightsource.brightness.level') {
						const newLevel = parseInt(message.params)
						if (!isNaN(newLevel) && newLevel !== this.rgbPowerLevel) {
							this.debugLog('info', `External brightness change: ${newLevel}`)
							this.updateLocalStateFromDevice(newLevel)
						}
					}
					else if (message.method === 'image.p7.desiredwhitegain') {
						const newGain = parseFloat(message.params)
						if (!isNaN(newGain) && Math.abs(newGain - this.desiredWhiteGain) > 0.001) {
							this.debugLog('info', `External white gain change: ${newGain.toFixed(3)}`)
							this.updateLocalWhiteGainFromDevice(newGain)
						}
					}
					else if (message.method === 'image.p7.desiredredgain') {
						const newGain = parseFloat(message.params)
						if (!isNaN(newGain) && Math.abs(newGain - this.desiredRedGain) > 0.001) {
							this.debugLog('info', `External red gain change: ${newGain.toFixed(3)}`)
							this.updateLocalRedGainFromDevice(newGain)
						}
					}
					else if (message.method === 'image.p7.desiredgreengain') {
						const newGain = parseFloat(message.params)
						if (!isNaN(newGain) && Math.abs(newGain - this.desiredGreenGain) > 0.001) {
							this.debugLog('info', `External green gain change: ${newGain.toFixed(3)}`)
							this.updateLocalGreenGainFromDevice(newGain)
						}
					}
					else if (message.method === 'image.p7.desiredbluegain') {
						const newGain = parseFloat(message.params)
						if (!isNaN(newGain) && Math.abs(newGain - this.desiredBlueGain) > 0.001) {
							this.debugLog('info', `External blue gain change: ${newGain.toFixed(3)}`)
							this.updateLocalBlueGainFromDevice(newGain)
						}
					}
					else if (message.method === 'image.p7.desiredcyangain') {
						const newGain = parseFloat(message.params)
						if (!isNaN(newGain) && Math.abs(newGain - this.desiredCyanGain) > 0.001) {
							this.debugLog('info', `External cyan gain change: ${newGain.toFixed(3)}`)
							this.updateLocalCyanGainFromDevice(newGain)
						}
					}
					else if (message.method === 'image.p7.desiredmagentagain') {
						const newGain = parseFloat(message.params)
						if (!isNaN(newGain) && Math.abs(newGain - this.desiredMagentaGain) > 0.001) {
							this.debugLog('info', `External magenta gain change: ${newGain.toFixed(3)}`)
							this.updateLocalMagentaGainFromDevice(newGain)
						}
					}
					else if (message.method === 'image.p7.desiredyellowgain') {
						const newGain = parseFloat(message.params)
						if (!isNaN(newGain) && Math.abs(newGain - this.desiredYellowGain) > 0.001) {
							this.debugLog('info', `External yellow gain change: ${newGain.toFixed(3)}`)
							this.updateLocalYellowGainFromDevice(newGain)
						}
					}
				}
			} catch (err) {
				this.log('error', `Failed to parse JSON-RPC message: ${messageStr} - Error: ${err.message}`)
			}
		}

		sendJSONRPCMessage(method, params, id = null) {
			if (!this.isConnected || !this.socket) {
				this.log('warn', `Cannot send JSON-RPC: not connected (method: ${method})`)
				return
			}
		
			const message = { jsonrpc: '2.0', method: method }
		
			if (params !== undefined) {
				message.params = params
			}
		
			if (id !== null) {
				message.id = id
			}
		
			const messageStr = JSON.stringify(message) + '\n'
			this.debugLog('debug', `Sending: ${messageStr.trim()}`)
		
			try {
				this.socket.write(messageStr)
			} catch (err) {
				this.log('error', `Failed to send JSON-RPC message: ${err.message}`)
			}
		}

		subscribeToNotifications() {
			if (this.isSubscribedToNotifications) return
		
			this.debugLog('info', 'Subscribing to device notifications')
		
			this.sendJSONRPCMessage('lightsource.brightness.level.connect', undefined, `connect_brightness_${this.messageId++}`)
			this.sendJSONRPCMessage('image.p7.desiredwhitegain.connect', undefined, `connect_whitegain_${this.messageId++}`)
			this.sendJSONRPCMessage('image.p7.desiredredgain.connect', undefined, `connect_redgain_${this.messageId++}`)
			this.sendJSONRPCMessage('image.p7.desiredgreengain.connect', undefined, `connect_greengain_${this.messageId++}`)
			this.sendJSONRPCMessage('image.p7.desiredbluegain.connect', undefined, `connect_bluegain_${this.messageId++}`)
			this.sendJSONRPCMessage('image.p7.desiredcyangain.connect', undefined, `connect_cyangain_${this.messageId++}`)
			this.sendJSONRPCMessage('image.p7.desiredmagentagain.connect', undefined, `connect_magentagain_${this.messageId++}`)
			this.sendJSONRPCMessage('image.p7.desiredyellowgain.connect', undefined, `connect_yellowgain_${this.messageId++}`)
		
			this.isSubscribedToNotifications = true
		}

		sendBrightnessCommand(level) {
			this.debugLog('info', `Sending brightness command: ${level}`)
			this.sendJSONRPCMessage('lightsource.brightness.level.set', level, `set_${this.messageId++}`)
		}

		sendWhiteGainCommand(gain) {
			this.debugLog('info', `Sending white gain command: ${gain.toFixed(3)}`)
			this.sendJSONRPCMessage('image.p7.desiredwhitegain.set', gain, `whiteGain_${this.messageId++}`)
		}

		sendRedGainCommand(gain) {
			this.debugLog('info', `Sending red gain command: ${gain.toFixed(3)}`)
			this.sendJSONRPCMessage('image.p7.desiredredgain.set', gain, `redGain_${this.messageId++}`)
		}

		sendGreenGainCommand(gain) {
			this.debugLog('info', `Sending green gain command: ${gain.toFixed(3)}`)
			this.sendJSONRPCMessage('image.p7.desiredgreengain.set', gain, `greenGain_${this.messageId++}`)
		}

		sendBlueGainCommand(gain) {
			this.debugLog('info', `Sending blue gain command: ${gain.toFixed(3)}`)
			this.sendJSONRPCMessage('image.p7.desiredbluegain.set', gain, `blueGain_${this.messageId++}`)
		}

		sendCyanGainCommand(gain) {
			this.debugLog('info', `Sending cyan gain command: ${gain.toFixed(3)}`)
			this.sendJSONRPCMessage('image.p7.desiredcyangain.set', gain, `cyanGain_${this.messageId++}`)
		}

		sendMagentaGainCommand(gain) {
			this.debugLog('info', `Sending magenta gain command: ${gain.toFixed(3)}`)
			this.sendJSONRPCMessage('image.p7.desiredmagentagain.set', gain, `magentaGain_${this.messageId++}`)
		}

		sendYellowGainCommand(gain) {
			this.debugLog('info', `Sending yellow gain command: ${gain.toFixed(3)}`)
			this.sendJSONRPCMessage('image.p7.desiredyellowgain.set', gain, `yellowGain_${this.messageId++}`)
		}

		queryDeviceState() {
			this.debugLog('info', 'Querying current device state...')
		
			this.sendJSONRPCMessage('lightsource.brightness.level.get', undefined, `query_brightness_${this.messageId++}`)
			this.sendJSONRPCMessage('image.p7.desiredwhitegain.get', undefined, `query_whitegain_${this.messageId++}`)
			this.sendJSONRPCMessage('image.p7.desiredredgain.get', undefined, `query_redgain_${this.messageId++}`)
			this.sendJSONRPCMessage('image.p7.desiredgreengain.get', undefined, `query_greengain_${this.messageId++}`)
			this.sendJSONRPCMessage('image.p7.desiredbluegain.get', undefined, `query_bluegain_${this.messageId++}`)
			this.sendJSONRPCMessage('image.p7.desiredcyangain.get', undefined, `query_cyangain_${this.messageId++}`)
			this.sendJSONRPCMessage('image.p7.desiredmagentagain.get', undefined, `query_magentagain_${this.messageId++}`)
			this.sendJSONRPCMessage('image.p7.desiredyellowgain.get', undefined, `query_yellowgain_${this.messageId++}`)
		}

		updateLocalStateFromDevice(newLevel) {
			this.rgbPowerLevel = Math.max(0, Math.min(100, newLevel))
			this.debugLog('info', `Local brightness updated from device: ${this.rgbPowerLevel}`)
		
			this.setVariableValues({ rgb_power_level: this.rgbPowerLevel })
			this.saveConfig({ ...this.config, saved_rgb_power: this.rgbPowerLevel })
			this.checkFeedbacks()
		}

		updateLocalWhiteGainFromDevice(newGain) {
			this.desiredWhiteGain = Math.max(0.000, Math.min(1.000, newGain))
			this.debugLog('info', `Local white gain updated from device: ${this.desiredWhiteGain.toFixed(3)}`)
		
			this.setVariableValues({ desired_white_gain: this.desiredWhiteGain.toFixed(3) })
			this.saveConfig({ ...this.config, saved_white_gain: this.desiredWhiteGain })
			this.checkFeedbacks()
		}

		updateLocalRedGainFromDevice(newGain) {
			this.desiredRedGain = Math.max(0.000, Math.min(1.000, newGain))
			this.debugLog('info', `Local red gain updated from device: ${this.desiredRedGain.toFixed(3)}`)
		
			this.setVariableValues({ desired_red_gain: this.desiredRedGain.toFixed(3) })
			this.saveConfig({ ...this.config, saved_red_gain: this.desiredRedGain })
			this.checkFeedbacks()
		}

		updateLocalGreenGainFromDevice(newGain) {
			this.desiredGreenGain = Math.max(0.000, Math.min(1.000, newGain))
			this.debugLog('info', `Local green gain updated from device: ${this.desiredGreenGain.toFixed(3)}`)
		
			this.setVariableValues({ desired_green_gain: this.desiredGreenGain.toFixed(3) })
			this.saveConfig({ ...this.config, saved_green_gain: this.desiredGreenGain })
			this.checkFeedbacks()
		}

		updateLocalBlueGainFromDevice(newGain) {
			this.desiredBlueGain = Math.max(0.000, Math.min(1.000, newGain))
			this.debugLog('info', `Local blue gain updated from device: ${this.desiredBlueGain.toFixed(3)}`)
		
			this.setVariableValues({ desired_blue_gain: this.desiredBlueGain.toFixed(3) })
			this.saveConfig({ ...this.config, saved_blue_gain: this.desiredBlueGain })
			this.checkFeedbacks()
		}

		updateLocalCyanGainFromDevice(newGain) {
			this.desiredCyanGain = Math.max(0.000, Math.min(1.000, newGain))
			this.debugLog('info', `Local cyan gain updated from device: ${this.desiredCyanGain.toFixed(3)}`)
		
			this.setVariableValues({ desired_cyan_gain: this.desiredCyanGain.toFixed(3) })
			this.saveConfig({ ...this.config, saved_cyan_gain: this.desiredCyanGain })
			this.checkFeedbacks()
		}

		updateLocalMagentaGainFromDevice(newGain) {
			this.desiredMagentaGain = Math.max(0.000, Math.min(1.000, newGain))
			this.debugLog('info', `Local magenta gain updated from device: ${this.desiredMagentaGain.toFixed(3)}`)
		
			this.setVariableValues({ desired_magenta_gain: this.desiredMagentaGain.toFixed(3) })
			this.saveConfig({ ...this.config, saved_magenta_gain: this.desiredMagentaGain })
			this.checkFeedbacks()
		}	
		updateLocalYellowGainFromDevice(newGain) {
				this.desiredYellowGain = Math.max(0.000, Math.min(1.000, newGain))
				this.debugLog('info', `Local yellow gain updated from device: ${this.desiredYellowGain.toFixed(3)}`)
		
				this.setVariableValues({ desired_yellow_gain: this.desiredYellowGain.toFixed(3) })
				this.saveConfig({ ...this.config, saved_yellow_gain: this.desiredYellowGain })
				this.checkFeedbacks()
			}

			initActions() {
				const { getActions } = require('./src/actions')
				const actions = getActions(this)
				this.setActionDefinitions(actions)
			}
					}

				actions['rgb_power_increment'] = {
					name: 'RGB Power - Increment (+)',
					options: [{ type: 'number', label: 'Increment Amount', id: 'increment', default: 10, min: 1, max: 100 }],
					callback: async (event) => {
						const increment = parseInt(event.options.increment)
						const newLevel = this.rgbPowerLevel + increment
						this.updateRGBPowerLevelDebounced(newLevel)
					}
				}

				actions['rgb_power_decrement'] = {
					name: 'RGB Power - Decrement (-)',
					options: [{ type: 'number', label: 'Decrement Amount', id: 'decrement', default: 10, min: 1, max: 100 }],
					callback: async (event) => {
						const decrement = parseInt(event.options.decrement)
						const newLevel = this.rgbPowerLevel - decrement
						this.updateRGBPowerLevelDebounced(newLevel)
					}
				}

				// WHITE GAIN ACTIONS - ALL THREE ACTIONS
				actions['white_gain_set'] = {
					name: 'Desired White Gain - Set Level',
					options: [{ type: 'number', label: 'Desired White Gain (0.000-1.000)', id: 'gain_level', default: 0.500, min: 0, max: 1, step: 0.001 }],
					callback: async (event) => {
						const gainLevel = parseFloat(event.options.gain_level)
						this.updateWhiteGain(gainLevel)
					}
				}

				actions['white_gain_increment'] = {
					name: 'Desired White Gain - Increment (+)',
					options: [{ type: 'number', label: 'Increment Amount', id: 'increment', default: 0.010, min: 0.001, max: 1.000, step: 0.001 }],
					callback: async (event) => {
						const increment = parseFloat(event.options.increment)
						const newGain = this.desiredWhiteGain + increment
						this.updateWhiteGainDebounced(newGain)
					}
				}

				actions['white_gain_decrement'] = {
					name: 'Desired White Gain - Decrement (-)',
					options: [{ type: 'number', label: 'Decrement Amount', id: 'decrement', default: 0.010, min: 0.001, max: 1.000, step: 0.001 }],
					callback: async (event) => {
						const decrement = parseFloat(event.options.decrement)
						const newGain = this.desiredWhiteGain - decrement
						this.updateWhiteGainDebounced(newGain)
					}
				}

				// RED GAIN ACTIONS - ALL THREE ACTIONS
				actions['red_gain_set'] = {
					name: 'Desired Red Gain - Set Level',
					options: [{ type: 'number', label: 'Desired Red Gain (0.000-1.000)', id: 'gain_level', default: 0.500, min: 0, max: 1, step: 0.001 }],
					callback: async (event) => {
						const gainLevel = parseFloat(event.options.gain_level)
						this.updateRedGain(gainLevel)
					}
				}

				actions['red_gain_increment'] = {
					name: 'Desired Red Gain - Increment (+)',
					options: [{ type: 'number', label: 'Increment Amount', id: 'increment', default: 0.010, min: 0.001, max: 1.000, step: 0.001 }],
					callback: async (event) => {
						const increment = parseFloat(event.options.increment)
						const newGain = this.desiredRedGain + increment
						this.updateRedGainDebounced(newGain)
					}
				}

				actions['red_gain_decrement'] = {
					name: 'Desired Red Gain - Decrement (-)',
					options: [{ type: 'number', label: 'Decrement Amount', id: 'decrement', default: 0.010, min: 0.001, max: 1.000, step: 0.001 }],
					callback: async (event) => {
						const decrement = parseFloat(event.options.decrement)
						const newGain = this.desiredRedGain - decrement
						this.updateRedGainDebounced(newGain)
					}
				}

				// GREEN GAIN ACTIONS - ALL THREE ACTIONS
				actions['green_gain_set'] = {
					name: 'Desired Green Gain - Set Level',
					options: [{ type: 'number', label: 'Desired Green Gain (0.000-1.000)', id: 'gain_level', default: 0.500, min: 0, max: 1, step: 0.001 }],
					callback: async (event) => {
						const gainLevel = parseFloat(event.options.gain_level)
						this.updateGreenGain(gainLevel)
					}
				}

				actions['green_gain_increment'] = {
					name: 'Desired Green Gain - Increment (+)',
					options: [{ type: 'number', label: 'Increment Amount', id: 'increment', default: 0.010, min: 0.001, max: 1.000, step: 0.001 }],
					callback: async (event) => {
						const increment = parseFloat(event.options.increment)
						const newGain = this.desiredGreenGain + increment
						this.updateGreenGainDebounced(newGain)
					}
				}

				actions['green_gain_decrement'] = {
					name: 'Desired Green Gain - Decrement (-)',
					options: [{ type: 'number', label: 'Decrement Amount', id: 'decrement', default: 0.010, min: 0.001, max: 1.000, step: 0.001 }],
					callback: async (event) => {
						const decrement = parseFloat(event.options.decrement)
						const newGain = this.desiredGreenGain - decrement
						this.updateGreenGainDebounced(newGain)
					}
				}

				// BLUE GAIN ACTIONS - ALL THREE ACTIONS
				actions['blue_gain_set'] = {
					name: 'Desired Blue Gain - Set Level',
					options: [{ type: 'number', label: 'Desired Blue Gain (0.000-1.000)', id: 'gain_level', default: 0.500, min: 0, max: 1, step: 0.001 }],
					callback: async (event) => {
						const gainLevel = parseFloat(event.options.gain_level)
						this.updateBlueGain(gainLevel)
					}
				}

				actions['blue_gain_increment'] = {
					name: 'Desired Blue Gain - Increment (+)',
					options: [{ type: 'number', label: 'Increment Amount', id: 'increment', default: 0.010, min: 0.001, max: 1.000, step: 0.001 }],
					callback: async (event) => {
						const increment = parseFloat(event.options.increment)
						const newGain = this.desiredBlueGain + increment
						this.updateBlueGainDebounced(newGain)
					}
				}

				actions['blue_gain_decrement'] = {
					name: 'Desired Blue Gain - Decrement (-)',
					options: [{ type: 'number', label: 'Decrement Amount', id: 'decrement', default: 0.010, min: 0.001, max: 1.000, step: 0.001 }],
					callback: async (event) => {
						const decrement = parseFloat(event.options.decrement)
						const newGain = this.desiredBlueGain - decrement
						this.updateBlueGainDebounced(newGain)
					}
				}

				// CYAN GAIN ACTIONS - ALL THREE ACTIONS
				actions['cyan_gain_set'] = {
					name: 'Desired Cyan Gain - Set Level',
					options: [{ type: 'number', label: 'Desired Cyan Gain (0.000-1.000)', id: 'gain_level', default: 0.500, min: 0, max: 1, step: 0.001 }],
					callback: async (event) => {
						const gainLevel = parseFloat(event.options.gain_level)
						this.updateCyanGain(gainLevel)
					}
				}

				actions['cyan_gain_increment'] = {
					name: 'Desired Cyan Gain - Increment (+)',
					options: [{ type: 'number', label: 'Increment Amount', id: 'increment', default: 0.010, min: 0.001, max: 1.000, step: 0.001 }],
					callback: async (event) => {
						const increment = parseFloat(event.options.increment)
						const newGain = this.desiredCyanGain + increment
						this.updateCyanGainDebounced(newGain)
					}
				}

				actions['cyan_gain_decrement'] = {
					name: 'Desired Cyan Gain - Decrement (-)',
					options: [{ type: 'number', label: 'Decrement Amount', id: 'decrement', default: 0.010, min: 0.001, max: 1.000, step: 0.001 }],
					callback: async (event) => {
						const decrement = parseFloat(event.options.decrement)
						const newGain = this.desiredCyanGain - decrement
						this.updateCyanGainDebounced(newGain)
					}
				}

				// MAGENTA GAIN ACTIONS - ALL THREE ACTIONS
				actions['magenta_gain_set'] = {
					name: 'Desired Magenta Gain - Set Level',
					options: [{ type: 'number', label: 'Desired Magenta Gain (0.000-1.000)', id: 'gain_level', default: 0.500, min: 0, max: 1, step: 0.001 }],
					callback: async (event) => {
						const gainLevel = parseFloat(event.options.gain_level)
						this.updateMagentaGain(gainLevel)
					}
				}

				actions['magenta_gain_increment'] = {
					name: 'Desired Magenta Gain - Increment (+)',
					options: [{ type: 'number', label: 'Increment Amount', id: 'increment', default: 0.010, min: 0.001, max: 1.000, step: 0.001 }],
					callback: async (event) => {
						const increment = parseFloat(event.options.increment)
						const newGain = this.desiredMagentaGain + increment
						this.updateMagentaGainDebounced(newGain)
					}
				}

				actions['magenta_gain_decrement'] = {
					name: 'Desired Magenta Gain - Decrement (-)',
					options: [{ type: 'number', label: 'Decrement Amount', id: 'decrement', default: 0.010, min: 0.001, max: 1.000, step: 0.001 }],
					callback: async (event) => {
						const decrement = parseFloat(event.options.decrement)
						const newGain = this.desiredMagentaGain - decrement
						this.updateMagentaGainDebounced(newGain)
					}
				}

				// YELLOW GAIN ACTIONS - ALL THREE ACTIONS
				actions['yellow_gain_set'] = {
					name: 'Desired Yellow Gain - Set Level',
					options: [{ type: 'number', label: 'Desired Yellow Gain (0.000-1.000)', id: 'gain_level', default: 0.500, min: 0, max: 1, step: 0.001 }],
					callback: async (event) => {
						const gainLevel = parseFloat(event.options.gain_level)
						this.updateYellowGain(gainLevel)
					}
				}

				actions['yellow_gain_increment'] = {
					name: 'Desired Yellow Gain - Increment (+)',
					options: [{ type: 'number', label: 'Increment Amount', id: 'increment', default: 0.010, min: 0.001, max: 1.000, step: 0.001 }],
					callback: async (event) => {
						const increment = parseFloat(event.options.increment)
						const newGain = this.desiredYellowGain + increment
						this.updateYellowGainDebounced(newGain)
					}
				}

				actions['yellow_gain_decrement'] = {
					name: 'Desired Yellow Gain - Decrement (-)',
					options: [{ type: 'number', label: 'Decrement Amount', id: 'decrement', default: 0.010, min: 0.001, max: 1.000, step: 0.001 }],
					callback: async (event) => {
						const decrement = parseFloat(event.options.decrement)
						const newGain = this.desiredYellowGain - decrement
						this.updateYellowGainDebounced(newGain)
					}
				}

				this.setActionDefinitions(actions)
			}

			initFeedbacks() {
				const feedbacks = {}

				feedbacks['rgb_power_level'] = {
					type: 'boolean',
					name: 'RGB Power - Level Check',
					description: 'Change button appearance based on RGB power level',
					defaultStyle: { bgcolor: 0x0080FF, color: 0xFFFFFF },
					options: [
						{ type: 'dropdown', label: 'Condition', id: 'condition', default: 'equal', choices: [
							{ id: 'equal', label: 'Equal to' }, { id: 'greater', label: 'Greater than' }, { id: 'less', label: 'Less than' }
						]},
						{ type: 'number', label: 'Power Level', id: 'power_level', default: 50, min: 0, max: 100 }
					],
					callback: (feedback) => {
						const currentLevel = this.rgbPowerLevel
						const targetLevel = parseInt(feedback.options.power_level)
						switch (feedback.options.condition) {
							case 'equal': return currentLevel === targetLevel
							case 'greater': return currentLevel > targetLevel
							case 'less': return currentLevel < targetLevel
							default: return false
						}
					}
				}

				feedbacks['white_gain_level'] = {
					type: 'boolean',
					name: 'Desired White Gain - Level Check', 
					description: 'Change button appearance based on desired white gain level',
					defaultStyle: { bgcolor: 0xFFFFFF, color: 0x000000 },
					options: [
						{ type: 'dropdown', label: 'Condition', id: 'condition', default: 'equal', choices: [
							{ id: 'equal', label: 'Equal to' }, { id: 'greater', label: 'Greater than' }, { id: 'less', label: 'Less than' }
						]},
						{ type: 'number', label: 'Desired White Gain Level', id: 'gain_level', default: 0.500, min: 0, max: 1, step: 0.001 }
					],
					callback: (feedback) => {
						const currentGain = this.desiredWhiteGain
						const targetGain = parseFloat(feedback.options.gain_level)
						switch (feedback.options.condition) {
							case 'equal': return Math.abs(currentGain - targetGain) < 0.001
							case 'greater': return currentGain > targetGain
							case 'less': return currentGain < targetGain
							default: return false
						}
					}
				}

				feedbacks['red_gain_level'] = {
					type: 'boolean',
					name: 'Desired Red Gain - Level Check',
					description: 'Change button appearance based on desired red gain level', 
					defaultStyle: { bgcolor: 0xFF4040, color: 0xFFFFFF },
					options: [
						{ type: 'dropdown', label: 'Condition', id: 'condition', default: 'equal', choices: [
							{ id: 'equal', label: 'Equal to' }, { id: 'greater', label: 'Greater than' }, { id: 'less', label: 'Less than' }
						]},
						{ type: 'number', label: 'Desired Red Gain Level', id: 'gain_level', default: 0.500, min: 0, max: 1, step: 0.001 }
					],
					callback: (feedback) => {
						const currentGain = this.desiredRedGain
						const targetGain = parseFloat(feedback.options.gain_level)
						switch (feedback.options.condition) {
							case 'equal': return Math.abs(currentGain - targetGain) < 0.001
							case 'greater': return currentGain > targetGain
							case 'less': return currentGain < targetGain
							default: return false
						}
					}
				}

				feedbacks['green_gain_level'] = {
					type: 'boolean',
					name: 'Desired Green Gain - Level Check',
					description: 'Change button appearance based on desired green gain level', 
					defaultStyle: { bgcolor: 0x40FF40, color: 0x000000 },
					options: [
						{ type: 'dropdown', label: 'Condition', id: 'condition', default: 'equal', choices: [
							{ id: 'equal', label: 'Equal to' }, { id: 'greater', label: 'Greater than' }, { id: 'less', label: 'Less than' }
						]},
						{ type: 'number', label: 'Desired Green Gain Level', id: 'gain_level', default: 0.500, min: 0, max: 1, step: 0.001 }
					],
					callback: (feedback) => {
						const currentGain = this.desiredGreenGain
						const targetGain = parseFloat(feedback.options.gain_level)
						switch (feedback.options.condition) {
							case 'equal': return Math.abs(currentGain - targetGain) < 0.001
							case 'greater': return currentGain > targetGain
							case 'less': return currentGain < targetGain
							default: return false
						}
					}
				}

				feedbacks['blue_gain_level'] = {
					type: 'boolean',
					name: 'Desired Blue Gain - Level Check',
					description: 'Change button appearance based on desired blue gain level', 
					defaultStyle: { bgcolor: 0x4040FF, color: 0xFFFFFF },
					options: [
						{ type: 'dropdown', label: 'Condition', id: 'condition', default: 'equal', choices: [
							{ id: 'equal', label: 'Equal to' }, { id: 'greater', label: 'Greater than' }, { id: 'less', label: 'Less than' }
						]},
						{ type: 'number', label: 'Desired Blue Gain Level', id: 'gain_level', default: 0.500, min: 0, max: 1, step: 0.001 }
					],
					callback: (feedback) => {
						const currentGain = this.desiredBlueGain
						const targetGain = parseFloat(feedback.options.gain_level)
						switch (feedback.options.condition) {
							case 'equal': return Math.abs(currentGain - targetGain) < 0.001
							case 'greater': return currentGain > targetGain
							case 'less': return currentGain < targetGain
							default: return false
						}
					}
				}

				feedbacks['cyan_gain_level'] = {
					type: 'boolean',
					name: 'Desired Cyan Gain - Level Check',
					description: 'Change button appearance based on desired cyan gain level', 
					defaultStyle: { bgcolor: 0x00FFFF, color: 0x000000 },
					options: [
						{ type: 'dropdown', label: 'Condition', id: 'condition', default: 'equal', choices: [
							{ id: 'equal', label: 'Equal to' }, { id: 'greater', label: 'Greater than' }, { id: 'less', label: 'Less than' }
						]},
						{ type: 'number', label: 'Desired Cyan Gain Level', id: 'gain_level', default: 0.500, min: 0, max: 1, step: 0.001 }
					],
					callback: (feedback) => {
						const currentGain = this.desiredCyanGain
						const targetGain = parseFloat(feedback.options.gain_level)
						switch (feedback.options.condition) {
							case 'equal': return Math.abs(currentGain - targetGain) < 0.001
							case 'greater': return currentGain > targetGain
							case 'less': return currentGain < targetGain
							default: return false
						}
					}
				}

				feedbacks['magenta_gain_level'] = {
					type: 'boolean',
					name: 'Desired Magenta Gain - Level Check',
					description: 'Change button appearance based on desired magenta gain level', 
					defaultStyle: { bgcolor: 0xFF00FF, color: 0xFFFFFF },
					options: [
						{ type: 'dropdown', label: 'Condition', id: 'condition', default: 'equal', choices: [
							{ id: 'equal', label: 'Equal to' }, { id: 'greater', label: 'Greater than' }, { id: 'less', label: 'Less than' }
						]},
						{ type: 'number', label: 'Desired Magenta Gain Level', id: 'gain_level', default: 0.500, min: 0, max: 1, step: 0.001 }
					],
					callback: (feedback) => {
						const currentGain = this.desiredMagentaGain
						const targetGain = parseFloat(feedback.options.gain_level)
						switch (feedback.options.condition) {
							case 'equal': return Math.abs(currentGain - targetGain) < 0.001
							case 'greater': return currentGain > targetGain
							case 'less': return currentGain < targetGain
							default: return false
						}
					}
				}

				feedbacks['yellow_gain_level'] = {
					type: 'boolean',
					name: 'Desired Yellow Gain - Level Check',
					description: 'Change button appearance based on desired yellow gain level', 
					defaultStyle: { bgcolor: 0xFFFF00, color: 0x000000 },
					options: [
						{ type: 'dropdown', label: 'Condition', id: 'condition', default: 'equal', choices: [
							{ id: 'equal', label: 'Equal to' }, { id: 'greater', label: 'Greater than' }, { id: 'less', label: 'Less than' }
						]},
						{ type: 'number', label: 'Desired Yellow Gain Level', id: 'gain_level', default: 0.500, min: 0, max: 1, step: 0.001 }
					],
					callback: (feedback) => {
						const currentGain = this.desiredYellowGain
						const targetGain = parseFloat(feedback.options.gain_level)
						switch (feedback.options.condition) {
							case 'equal': return Math.abs(currentGain - targetGain) < 0.001
							case 'greater': return currentGain > targetGain
							case 'less': return currentGain < targetGain
							default: return false
						}
					}
				}

				this.setFeedbackDefinitions(feedbacks)
			}

			initVariables() {
				const variables = [
					{ name: 'RGB Power Level', variableId: 'rgb_power_level' },
					{ name: 'Desired White Gain', variableId: 'desired_white_gain' },
					{ name: 'Desired Red Gain', variableId: 'desired_red_gain' },
					{ name: 'Desired Green Gain', variableId: 'desired_green_gain' },
					{ name: 'Desired Blue Gain', variableId: 'desired_blue_gain' },
					{ name: 'Desired Cyan Gain', variableId: 'desired_cyan_gain' },
					{ name: 'Desired Magenta Gain', variableId: 'desired_magenta_gain' },
					{ name: 'Desired Yellow Gain', variableId: 'desired_yellow_gain' }
				]

				this.setVariableDefinitions(variables)
		
				this.setVariableValues({
					rgb_power_level: this.rgbPowerLevel,
					desired_white_gain: this.desiredWhiteGain.toFixed(3),
					desired_red_gain: this.desiredRedGain.toFixed(3),
					desired_green_gain: this.desiredGreenGain.toFixed(3),
					desired_blue_gain: this.desiredBlueGain.toFixed(3),
					desired_cyan_gain: this.desiredCyanGain.toFixed(3),
					desired_magenta_gain: this.desiredMagentaGain.toFixed(3),
					desired_yellow_gain: this.desiredYellowGain.toFixed(3)
				})
			}

			initPresets() {
				const presets = []

				// RGB Power Presets
				presets.push({
					type: 'button',
					category: 'RGB Power',
					name: 'Power Display',
					style: { text: 'RGB\\n$(norxe_unify:rgb_power_level)%', size: '18', color: 0xFFFFFF, bgcolor: 0x0080FF },
					steps: [{ down: [], up: [] }],
					feedbacks: []
				})

				presets.push({
					type: 'button',
					category: 'RGB Power', 
					name: 'Power UP (+10)',
					style: { text: 'RGB\\nUP\\n+10', size: '14', color: 0xFFFFFF, bgcolor: 0x004080 },
					steps: [{ down: [{ actionId: 'rgb_power_increment', options: { increment: 10 } }], up: [] }],
					feedbacks: []
				})

				presets.push({
					type: 'button',
					category: 'RGB Power',
					name: 'Power DOWN (-10)', 
					style: { text: 'RGB\\nDOWN\\n-10', size: '14', color: 0xFFFFFF, bgcolor: 0x002040 },
					steps: [{ down: [{ actionId: 'rgb_power_decrement', options: { decrement: 10 } }], up: [] }],
					feedbacks: []
				})

				// White Gain Presets
				presets.push({
					type: 'button',
					category: 'White Gain',
					name: 'White Gain Display',
					style: { text: 'WHITE\\n$(norxe_unify:desired_white_gain)', size: '16', color: 0x000000, bgcolor: 0xFFFFFF },
					steps: [{ down: [], up: [] }],
					feedbacks: []
				})

				presets.push({
					type: 'button',
					category: 'White Gain',
					name: 'White UP (+0.01)',
					style: { text: 'WHITE\\nUP\\n+0.01', size: '12', color: 0x000000, bgcolor: 0xC0C0C0 },
					steps: [{ down: [{ actionId: 'white_gain_increment', options: { increment: 0.01 } }], up: [] }],
					feedbacks: []
				})

				presets.push({
					type: 'button',
					category: 'White Gain',
					name: 'White DOWN (-0.01)',
					style: { text: 'WHITE\\nDOWN\\n-0.01', size: '12', color: 0x000000, bgcolor: 0x808080 },
					steps: [{ down: [{ actionId: 'white_gain_decrement', options: { decrement: 0.01 } }], up: [] }],
					feedbacks: []
				})

				// Red Gain Presets
				presets.push({
					type: 'button',
					category: 'Red Gain',
					name: 'Red Gain Display',
					style: { text: 'RED\\n$(norxe_unify:desired_red_gain)', size: '16', color: 0xFFFFFF, bgcolor: 0xFF4040 },
					steps: [{ down: [], up: [] }],
					feedbacks: []
				})

				presets.push({
					type: 'button',
					category: 'Red Gain',
					name: 'Red UP (+0.01)',
					style: { text: 'RED\\nUP\\n+0.01', size: '12', color: 0xFFFFFF, bgcolor: 0x802020 },
					steps: [{ down: [{ actionId: 'red_gain_increment', options: { increment: 0.01 } }], up: [] }],
					feedbacks: []
				})

				presets.push({
					type: 'button',
					category: 'Red Gain',
					name: 'Red DOWN (-0.01)',
					style: { text: 'RED\\nDOWN\\n-0.01', size: '12', color: 0xFFFFFF, bgcolor: 0x401010 },
					steps: [{ down: [{ actionId: 'red_gain_decrement', options: { decrement: 0.01 } }], up: [] }],
					feedbacks: []
				})
						// Green Gain Presets
					   	presets.push({
					   		type: 'button',
					   		category: 'Green Gain',
					   		name: 'Green Gain Display',
					   		style: { text: 'GREEN\\n$(norxe_unify:desired_green_gain)', size: '16', color: 0x000000, bgcolor: 0x40FF40 },
					   		steps: [{ down: [], up: [] }],
					   		feedbacks: []
					   	})

					   	presets.push({
					   		type: 'button',
					   		category: 'Green Gain',
					   		name: 'Green UP (+0.01)',
					   		style: { text: 'GREEN\\nUP\\n+0.01', size: '12', color: 0xFFFFFF, bgcolor: 0x208020 },
					   		steps: [{ down: [{ actionId: 'green_gain_increment', options: { increment: 0.01 } }], up: [] }],
					   		feedbacks: []
					   	})

					   	presets.push({
					   		type: 'button',
					   		category: 'Green Gain',
					   		name: 'Green DOWN (-0.01)',
					   		style: { text: 'GREEN\\nDOWN\\n-0.01', size: '12', color: 0xFFFFFF, bgcolor: 0x104010 },
					   		steps: [{ down: [{ actionId: 'green_gain_decrement', options: { decrement: 0.01 } }], up: [] }],
					   		feedbacks: []
					   	})

					   	// Blue Gain Presets
					   	presets.push({
					   		type: 'button',
					   		category: 'Blue Gain',
					   		name: 'Blue Gain Display',
					   		style: { text: 'BLUE\\n$(norxe_unify:desired_blue_gain)', size: '16', color: 0xFFFFFF, bgcolor: 0x4040FF },
					   		steps: [{ down: [], up: [] }],
					   		feedbacks: []
					   	})

					   	presets.push({
					   		type: 'button',
					   		category: 'Blue Gain',
					   		name: 'Blue UP (+0.01)',
					   		style: { text: 'BLUE\\nUP\\n+0.01', size: '12', color: 0xFFFFFF, bgcolor: 0x202080 },
					   		steps: [{ down: [{ actionId: 'blue_gain_increment', options: { increment: 0.01 } }], up: [] }],
					   		feedbacks: []
					   	})

					   	presets.push({
					   		type: 'button',
					   		category: 'Blue Gain',
					   		name: 'Blue DOWN (-0.01)',
					   		style: { text: 'BLUE\\nDOWN\\n-0.01', size: '12', color: 0xFFFFFF, bgcolor: 0x101040 },
					   		steps: [{ down: [{ actionId: 'blue_gain_decrement', options: { decrement: 0.01 } }], up: [] }],
					   		feedbacks: []
					   	})

					   	// Cyan Gain Presets
					   	presets.push({
					   		type: 'button',
					   		category: 'Cyan Gain',
					   		name: 'Cyan Gain Display',
					   		style: { text: 'CYAN\\n$(norxe_unify:desired_cyan_gain)', size: '16', color: 0x000000, bgcolor: 0x00FFFF },
					   		steps: [{ down: [], up: [] }],
					   		feedbacks: []
					   	})

					   	presets.push({
					   		type: 'button',
					   		category: 'Cyan Gain',
					   		name: 'Cyan UP (+0.01)',
					   		style: { text: 'CYAN\\nUP\\n+0.01', size: '12', color: 0x000000, bgcolor: 0x00C0C0 },
					   		steps: [{ down: [{ actionId: 'cyan_gain_increment', options: { increment: 0.01 } }], up: [] }],
					   		feedbacks: []
					   	})

					   	presets.push({
					   		type: 'button',
					   		category: 'Cyan Gain',
					   		name: 'Cyan DOWN (-0.01)',
					   		style: { text: 'CYAN\\nDOWN\\n-0.01', size: '12', color: 0x000000, bgcolor: 0x008080 },
					   		steps: [{ down: [{ actionId: 'cyan_gain_decrement', options: { decrement: 0.01 } }], up: [] }],
					   		feedbacks: []
					   	})

					   	// Magenta Gain Presets
					   	presets.push({
					   		type: 'button',
					   		category: 'Magenta Gain',
					   		name: 'Magenta Gain Display',
					   		style: { text: 'MAGENTA\\n$(norxe_unify:desired_magenta_gain)', size: '14', color: 0xFFFFFF, bgcolor: 0xFF00FF },
					   		steps: [{ down: [], up: [] }],
					   		feedbacks: []
					   	})

					   	presets.push({
					   		type: 'button',
					   		category: 'Magenta Gain',
					   		name: 'Magenta UP (+0.01)',
					   		style: { text: 'MAGENTA\\nUP\\n+0.01', size: '10', color: 0xFFFFFF, bgcolor: 0xC000C0 },
					   		steps: [{ down: [{ actionId: 'magenta_gain_increment', options: { increment: 0.01 } }], up: [] }],
					   		feedbacks: []
					   	})

					   	presets.push({
					   		type: 'button',
					   		category: 'Magenta Gain',
					   		name: 'Magenta DOWN (-0.01)',
					   		style: { text: 'MAGENTA\\nDOWN\\n-0.01', size: '10', color: 0xFFFFFF, bgcolor: 0x800080 },
					   		steps: [{ down: [{ actionId: 'magenta_gain_decrement', options: { decrement: 0.01 } }], up: [] }],
					   		feedbacks: []
					   	})

					   	// Yellow Gain Presets
					   	presets.push({
					   		type: 'button',
					   		category: 'Yellow Gain',
					   		name: 'Yellow Gain Display',
					   		style: { text: 'YELLOW\\n$(norxe_unify:desired_yellow_gain)', size: '16', color: 0x000000, bgcolor: 0xFFFF00 },
					   		steps: [{ down: [], up: [] }],
					   		feedbacks: []
					   	})

					   	presets.push({
					   		type: 'button',
					   		category: 'Yellow Gain',
					   		name: 'Yellow UP (+0.01)',
					   		style: { text: 'YELLOW\\nUP\\n+0.01', size: '12', color: 0x000000, bgcolor: 0xC0C000 },
					   		steps: [{ down: [{ actionId: 'yellow_gain_increment', options: { increment: 0.01 } }], up: [] }],
					   		feedbacks: []
					   	})

					   	presets.push({
					   		type: 'button',
					   		category: 'Yellow Gain',
					   		name: 'Yellow DOWN (-0.01)',
					   		style: { text: 'YELLOW\\nDOWN\\n-0.01', size: '12', color: 0x000000, bgcolor: 0x808000 },
					   		steps: [{ down: [{ actionId: 'yellow_gain_decrement', options: { decrement: 0.01 } }], up: [] }],
					   		feedbacks: []
					   	})

					   	this.setPresetDefinitions(presets)
					   }
					}

					runEntrypoint(NorxeUnifyInstance, [])