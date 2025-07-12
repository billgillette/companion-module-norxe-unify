// lib/network.js
// This file handles all TCP/JSON-RPC communication with the Norxe Unify device
// COPY THIS ENTIRE FILE TO: lib/network.js (REPLACE THE EXISTING ONE)

const net = require('net')
const { InstanceStatus } = require('@companion-module/base')

class NetworkManager {
	constructor(instance) {
		this.instance = instance
		this.client = null
		this.isConnected = false
		this.reconnectTimer = null
		this.messageBuffer = ''
		this.messageId = 1
		this.isSubscribedToNotifications = false
	}

	init(config) {
		this.config = config
		if (this.config.enable_network) {
			this.initTCPConnection()
		} else {
			this.instance.debugLog('info', 'Network control disabled')
		}
	}

	initTCPConnection() {
		if (this.client) {
			this.client.destroy()
			this.client = null
		}

		const host = this.config.host
		const port = parseInt(this.config.port)

		if (!host || !port) {
			this.instance.log('error', 'Invalid host or port configuration')
			return
		}

		this.instance.debugLog('info', `Initializing TCP connection to ${host}:${port}`)

		this.client = new net.Socket()
		this.client.setKeepAlive(true, 1000)

		this.client.on('connect', () => {
			this.instance.debugLog('info', 'TCP connection established')
			this.isConnected = true
			this.instance.updateStatus(InstanceStatus.Ok)
			this.subscribeToNotifications()
			this.queryCurrentState()
		})

		this.client.on('data', (data) => {
			const messages = data.toString().split('\n').filter(msg => msg.trim())
			messages.forEach(msg => this.processJSONRPCMessage(msg))
		})

		this.client.on('error', (error) => {
			this.instance.log('error', `TCP connection error: ${error.message}`)
			this.isConnected = false
			this.instance.updateStatus(InstanceStatus.ConnectionFailure)
			this.scheduleReconnect()
		})

		this.client.on('close', () => {
			this.instance.debugLog('info', 'TCP connection closed')
			this.isConnected = false
			this.instance.updateStatus(InstanceStatus.Disconnected)
			this.scheduleReconnect()
		})

		this.client.connect(port, host)
	}

	closeTCPConnection() {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = null
		}

		if (this.client) {
			this.client.destroy()
			this.client = null
		}

		this.isConnected = false
		this.isSubscribedToNotifications = false
		this.instance.updateStatus(InstanceStatus.Ok)
	}

	scheduleReconnect() {
		if (!this.config.enable_network) return

		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
		}

		this.reconnectTimer = setTimeout(() => {
			this.instance.debugLog('info', 'Attempting to reconnect...')
			this.initTCPConnection()
		}, 5000)
	}

	handleIncomingData(data) {
		this.messageBuffer += data.toString()

		const messages = this.messageBuffer.split('\n')
		this.messageBuffer = messages.pop() || ''

		messages.forEach(message => {
			if (message.trim()) {
				this.instance.debugLog('debug', `Received: ${message}`)
				this.processJSONRPCMessage(message.trim())
			}
		})
	}

	processJSONRPCMessage(messageStr) {
		try {
			const message = JSON.parse(messageStr)
		
			if (message.id) {
				this.instance.debugLog('info', `JSON-RPC Response: ${JSON.stringify(message)}`)
			
				if (message.error) {
					this.instance.log('error', `JSON-RPC Error: ${JSON.stringify(message.error)}`)
				} else {
					// Handle query responses for DESIRED gains
					if (message.id.startsWith('query_brightness_')) {
						const currentLevel = parseInt(message.result)
						if (!isNaN(currentLevel)) {
							this.instance.debugLog('info', `Device brightness queried: ${currentLevel}`)
							this.instance.updateLocalRGBPowerFromDevice(currentLevel)
						}
					}
					else if (message.id.startsWith('query_nvg_power_')) {
						const currentLevel = parseInt(message.result)
						if (!isNaN(currentLevel)) {
							this.instance.debugLog('info', `Device NVG power queried: ${currentLevel}`)
							this.instance.updateLocalNVGPowerFromDevice(currentLevel)
						}
					}
					else if (message.id.startsWith('query_whitegain_')) {
						const currentGain = parseFloat(message.result)
						if (!isNaN(currentGain)) {
							this.instance.debugLog('info', `Device white gain queried: ${currentGain.toFixed(3)}`)
							this.instance.updateWhiteGainFromDevice(currentGain)
						}
					}
					else if (message.id.startsWith('query_redgain_')) {
						const currentGain = parseFloat(message.result)
						if (!isNaN(currentGain)) {
							this.instance.debugLog('info', `Device red gain queried: ${currentGain.toFixed(3)}`)
							this.instance.updateRedGainFromDevice(currentGain)
						}
					}
					else if (message.id.startsWith('query_greengain_')) {
						const currentGain = parseFloat(message.result)
						if (!isNaN(currentGain)) {
							this.instance.debugLog('info', `Device green gain queried: ${currentGain.toFixed(3)}`)
							this.instance.updateGreenGainFromDevice(currentGain)
						}
					}
					else if (message.id.startsWith('query_bluegain_')) {
						const currentGain = parseFloat(message.result)
						if (!isNaN(currentGain)) {
							this.instance.debugLog('info', `Device blue gain queried: ${currentGain.toFixed(3)}`)
							this.instance.updateBlueGainFromDevice(currentGain)
						}
					}
					else if (message.id.startsWith('query_cyangain_')) {
						const currentGain = parseFloat(message.result)
						if (!isNaN(currentGain)) {
							this.instance.debugLog('info', `Device cyan gain queried: ${currentGain.toFixed(3)}`)
							this.instance.updateCyanGainFromDevice(currentGain)
						}
					}
					else if (message.id.startsWith('query_magentagain_')) {
						const currentGain = parseFloat(message.result)
						if (!isNaN(currentGain)) {
							this.instance.debugLog('info', `Device magenta gain queried: ${currentGain.toFixed(3)}`)
							this.instance.updateMagentaGainFromDevice(currentGain)
						}
					}
					else if (message.id.startsWith('query_yellowgain_')) {
						const currentGain = parseFloat(message.result)
						if (!isNaN(currentGain)) {
							this.instance.debugLog('info', `Device yellow gain queried: ${currentGain.toFixed(3)}`)
							this.instance.updateYellowGainFromDevice(currentGain)
						}
					}
					// NEW: Handle query responses for MEASURED gains
					else if (message.id.startsWith('query_measured_whitegain_')) {
						const currentGain = parseFloat(message.result)
						if (!isNaN(currentGain)) {
							this.instance.debugLog('info', `Device measured white gain queried: ${currentGain.toFixed(4)}`)
							this.instance.updateLocalMeasuredGainFromDevice('white', currentGain)
						}
					}
					else if (message.id.startsWith('query_measured_redgain_')) {
						const currentGain = parseFloat(message.result)
						if (!isNaN(currentGain)) {
							this.instance.debugLog('info', `Device measured red gain queried: ${currentGain.toFixed(4)}`)
							this.instance.updateLocalMeasuredGainFromDevice('red', currentGain)
						}
					}
					else if (message.id.startsWith('query_measured_greengain_')) {
						const currentGain = parseFloat(message.result)
						if (!isNaN(currentGain)) {
							this.instance.debugLog('info', `Device measured green gain queried: ${currentGain.toFixed(4)}`)
							this.instance.updateLocalMeasuredGainFromDevice('green', currentGain)
						}
					}
					else if (message.id.startsWith('query_measured_bluegain_')) {
						const currentGain = parseFloat(message.result)
						if (!isNaN(currentGain)) {
							this.instance.debugLog('info', `Device measured blue gain queried: ${currentGain.toFixed(4)}`)
							this.instance.updateLocalMeasuredGainFromDevice('blue', currentGain)
						}
					}
				}
			}
			else if (message.method) {
				this.instance.debugLog('info', `JSON-RPC Notification: ${JSON.stringify(message)}`)
			
				// Handle notifications for DESIRED gains
				if (message.method === 'lightsource.brightness.level') {
					const newLevel = parseInt(message.params)
					if (!isNaN(newLevel) && newLevel !== this.instance.rgbPowerLevel) {
						this.instance.debugLog('info', `External brightness change: ${newLevel}`)
						this.instance.updateLocalRGBPowerFromDevice(newLevel)
					}
				}
				else if (message.method === 'lightsource.infrared.power') {
					const newLevel = parseInt(message.params)
					if (!isNaN(newLevel) && newLevel !== this.instance.nvgPowerLevel) {
						this.instance.debugLog('info', `External NVG power change: ${newLevel}`)
						this.instance.updateLocalNVGPowerFromDevice(newLevel)
					}
				}
				else if (message.method === 'image.p7.desiredwhitegain') {
					const newGain = parseFloat(message.params)
					if (!isNaN(newGain) && Math.abs(newGain - this.instance.desiredWhiteGain) > 0.001) {
						this.instance.debugLog('info', `External white gain change: ${newGain.toFixed(3)}`)
						this.instance.updateWhiteGainFromDevice(newGain)
					}
				}
				else if (message.method === 'image.p7.desiredredgain') {
					const newGain = parseFloat(message.params)
					if (!isNaN(newGain) && Math.abs(newGain - this.instance.desiredRedGain) > 0.001) {
						this.instance.debugLog('info', `External red gain change: ${newGain.toFixed(3)}`)
						this.instance.updateRedGainFromDevice(newGain)
					}
				}
				else if (message.method === 'image.p7.desiredgreengain') {
					const newGain = parseFloat(message.params)
					if (!isNaN(newGain) && Math.abs(newGain - this.instance.desiredGreenGain) > 0.001) {
						this.instance.debugLog('info', `External green gain change: ${newGain.toFixed(3)}`)
						this.instance.updateGreenGainFromDevice(newGain)
					}
				}
				else if (message.method === 'image.p7.desiredbluegain') {
					const newGain = parseFloat(message.params)
					if (!isNaN(newGain) && Math.abs(newGain - this.instance.desiredBlueGain) > 0.001) {
						this.instance.debugLog('info', `External blue gain change: ${newGain.toFixed(3)}`)
						this.instance.updateBlueGainFromDevice(newGain)
					}
				}
				else if (message.method === 'image.p7.desiredcyangain') {
					const newGain = parseFloat(message.params)
					if (!isNaN(newGain) && Math.abs(newGain - this.instance.desiredCyanGain) > 0.001) {
						this.instance.debugLog('info', `External cyan gain change: ${newGain.toFixed(3)}`)
						this.instance.updateCyanGainFromDevice(newGain)
					}
				}
				else if (message.method === 'image.p7.desiredmagentagain') {
					const newGain = parseFloat(message.params)
					if (!isNaN(newGain) && Math.abs(newGain - this.instance.desiredMagentaGain) > 0.001) {
						this.instance.debugLog('info', `External magenta gain change: ${newGain.toFixed(3)}`)
						this.instance.updateMagentaGainFromDevice(newGain)
					}
				}
				else if (message.method === 'image.p7.desiredyellowgain') {
					const newGain = parseFloat(message.params)
					if (!isNaN(newGain) && Math.abs(newGain - this.instance.desiredYellowGain) > 0.001) {
						this.instance.debugLog('info', `External yellow gain change: ${newGain.toFixed(3)}`)
						this.instance.updateYellowGainFromDevice(newGain)
					}
				}
				// NEW: Handle notifications for MEASURED gains
				else if (message.method === 'image.p7.measuredwhitegain') {
					const newGain = parseFloat(message.params)
					if (!isNaN(newGain)) {
						this.instance.debugLog('info', `External measured white gain change: ${newGain.toFixed(4)}`)
						this.instance.updateLocalMeasuredGainFromDevice('white', newGain)
					}
				}
				else if (message.method === 'image.p7.measuredredgain') {
					const newGain = parseFloat(message.params)
					if (!isNaN(newGain)) {
						this.instance.debugLog('info', `External measured red gain change: ${newGain.toFixed(4)}`)
						this.instance.updateLocalMeasuredGainFromDevice('red', newGain)
					}
				}
				else if (message.method === 'image.p7.measuredgreengain') {
					const newGain = parseFloat(message.params)
					if (!isNaN(newGain)) {
						this.instance.debugLog('info', `External measured green gain change: ${newGain.toFixed(4)}`)
						this.instance.updateLocalMeasuredGainFromDevice('green', newGain)
					}
				}
				else if (message.method === 'image.p7.measuredbluegain') {
					const newGain = parseFloat(message.params)
					if (!isNaN(newGain)) {
						this.instance.debugLog('info', `External measured blue gain change: ${newGain.toFixed(4)}`)
						this.instance.updateLocalMeasuredGainFromDevice('blue', newGain)
					}
				}
			}
		} catch (error) {
			this.instance.log('error', `Error processing JSON-RPC message: ${error.message}`)
		}
	}

	sendJSONRPCMessage(message) {
		if (!this.isConnected) {
			this.instance.log('error', 'Cannot send message: Not connected')
			return
		}

		try {
			const messageStr = JSON.stringify(message) + '\n'
			this.instance.debugLog('debug', `Sending: ${messageStr.trim()}`)
			
			this.client.write(messageStr, (error) => {
				if (error) {
					this.instance.log('error', `Failed to send message: ${error.message}`)
					this.isConnected = false
					this.instance.updateStatus(InstanceStatus.ConnectionFailure)
					this.scheduleReconnect()
				}
			})
		} catch (error) {
			this.instance.log('error', `Error preparing message: ${error.message}`)
		}
	}

	subscribeToNotifications() {
		this.instance.debugLog('info', 'Subscribing to device notifications...')

		// Subscribe to measured gains
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			id: `subscribe_measured_whitegain_${this.messageId++}`,
			method: 'image.p7.measuredwhitegain.connect'
		})
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			id: `subscribe_measured_redgain_${this.messageId++}`,
			method: 'image.p7.measuredredgain.connect'
		})
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			id: `subscribe_measured_greengain_${this.messageId++}`,
			method: 'image.p7.measuredgreengain.connect'
		})
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			id: `subscribe_measured_bluegain_${this.messageId++}`,
			method: 'image.p7.measuredbluegain.connect'
		})

		// Subscribe to desired gains
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			id: `subscribe_desired_whitegain_${this.messageId++}`,
			method: 'image.p7.desiredwhitegain.connect'
		})
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			id: `subscribe_desired_redgain_${this.messageId++}`,
			method: 'image.p7.desiredredgain.connect'
		})
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			id: `subscribe_desired_greengain_${this.messageId++}`,
			method: 'image.p7.desiredgreengain.connect'
		})
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			id: `subscribe_desired_bluegain_${this.messageId++}`,
			method: 'image.p7.desiredbluegain.connect'
		})

		// Subscribe to brightness
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			id: `subscribe_brightness_${this.messageId++}`,
			method: 'lightsource.brightness.level.connect'
		})

		// Subscribe to NVG power
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			id: `subscribe_nvg_power_${this.messageId++}`,
			method: 'lightsource.infrared.power.connect'
		})

		this.isSubscribedToNotifications = true
	}

	queryCurrentState() {
		this.instance.debugLog('info', 'Querying current device state...')

		// Query existing values
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			method: 'lightsource.brightness.level.get',
			id: `query_brightness_${this.messageId++}`
		})
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			method: 'lightsource.infrared.power.get',
			id: `query_nvg_power_${this.messageId++}`
		})
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			method: 'image.p7.desiredwhitegain.get',
			id: `query_whitegain_${this.messageId++}`
		})
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			method: 'image.p7.desiredredgain.get',
			id: `query_redgain_${this.messageId++}`
		})
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			method: 'image.p7.desiredgreengain.get',
			id: `query_greengain_${this.messageId++}`
		})
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			method: 'image.p7.desiredbluegain.get',
			id: `query_bluegain_${this.messageId++}`
		})
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			method: 'image.p7.desiredcyangain.get',
			id: `query_cyangain_${this.messageId++}`
		})
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			method: 'image.p7.desiredmagentagain.get',
			id: `query_magentagain_${this.messageId++}`
		})
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			method: 'image.p7.desiredyellowgain.get',
			id: `query_yellowgain_${this.messageId++}`
		})

		// Query measured gain values
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			method: 'image.p7.measuredwhitegain.get',
			id: `query_measured_whitegain_${this.messageId++}`
		})
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			method: 'image.p7.measuredredgain.get',
			id: `query_measured_redgain_${this.messageId++}`
		})
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			method: 'image.p7.measuredgreengain.get',
			id: `query_measured_greengain_${this.messageId++}`
		})
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			method: 'image.p7.measuredbluegain.get',
			id: `query_measured_bluegain_${this.messageId++}`
		})
	}

	// EXISTING DESIRED GAIN COMMANDS
	sendBrightnessCommand(level) {
		if (!this.isConnected) {
			this.instance.log('error', 'Cannot send brightness command: Not connected')
			return
		}

		try {
			// Ensure level is between 0 and 100
			const boundedLevel = Math.max(0, Math.min(100, level))
			
			this.instance.debugLog('info', `Sending brightness command: ${boundedLevel}`)
			this.sendJSONRPCMessage({
				jsonrpc: '2.0',
				method: 'lightsource.brightness.level.set',
				params: boundedLevel,
				id: `brightness_${this.messageId++}`
			})
		} catch (error) {
			this.instance.log('error', `Error sending brightness command: ${error.message}`)
		}
	}

	sendWhiteGainCommand(gain) {
		this.instance.debugLog('info', `Sending white gain command: ${gain.toFixed(3)}`)
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			method: 'image.p7.desiredwhitegain.set',
			params: gain,
			id: `whiteGain_${this.messageId++}`
		})
	}

	sendRedGainCommand(gain) {
		this.instance.debugLog('info', `Sending red gain command: ${gain.toFixed(3)}`)
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			method: 'image.p7.desiredredgain.set',
			params: gain,
			id: `redGain_${this.messageId++}`
		})
	}

	sendGreenGainCommand(gain) {
		this.instance.debugLog('info', `Sending green gain command: ${gain.toFixed(3)}`)
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			method: 'image.p7.desiredgreengain.set',
			params: gain,
			id: `greenGain_${this.messageId++}`
		})
	}

	sendBlueGainCommand(gain) {
		this.instance.debugLog('info', `Sending blue gain command: ${gain.toFixed(3)}`)
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			method: 'image.p7.desiredbluegain.set',
			params: gain,
			id: `blueGain_${this.messageId++}`
		})
	}

	sendCyanGainCommand(gain) {
		this.instance.debugLog('info', `Sending cyan gain command: ${gain.toFixed(3)}`)
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			method: 'image.p7.desiredcyangain.set',
			params: gain,
			id: `cyanGain_${this.messageId++}`
		})
	}

	sendMagentaGainCommand(gain) {
		this.instance.debugLog('info', `Sending magenta gain command: ${gain.toFixed(3)}`)
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			method: 'image.p7.desiredmagentagain.set',
			params: gain,
			id: `magentaGain_${this.messageId++}`
		})
	}

	sendYellowGainCommand(gain) {
		this.instance.debugLog('info', `Sending yellow gain command: ${gain.toFixed(3)}`)
		this.sendJSONRPCMessage({
			jsonrpc: '2.0',
			method: 'image.p7.desiredyellowgain.set',
			params: gain,
			id: `yellowGain_${this.messageId++}`
		})
	}

	// NEW: MEASURED GAIN COMMANDS
	sendMeasuredWhiteGainCommand(gain) {
		try {
			const boundedGain = Math.max(0.0000, Math.min(1.0000, gain))
			const message = {
				jsonrpc: '2.0',
				method: 'image.p7.measuredwhitegain.set',
				params: boundedGain.toFixed(4),
				id: `measuredWhiteGain_${this.messageId++}`
			}
			this.instance.debugLog('info', `Sending measured white gain command: ${JSON.stringify(message)}`)
			this.sendJSONRPCMessage(message)
		} catch (error) {
			this.instance.debugLog('error', `Error sending measured white gain command: ${error.message}`)
		}
	}

	sendMeasuredRedGainCommand(gain) {
		try {
			const boundedGain = Math.max(0.0000, Math.min(1.0000, gain))
			const message = {
				jsonrpc: '2.0',
				method: 'image.p7.measuredredgain.set',
				params: boundedGain.toFixed(4),
				id: `measuredRedGain_${this.messageId++}`
			}
			this.instance.debugLog('info', `Sending measured red gain command: ${JSON.stringify(message)}`)
			this.sendJSONRPCMessage(message)
		} catch (error) {
			this.instance.debugLog('error', `Error sending measured red gain command: ${error.message}`)
		}
	}

	sendMeasuredGreenGainCommand(gain) {
		try {
			const boundedGain = Math.max(0.0000, Math.min(1.0000, gain))
			const message = {
				jsonrpc: '2.0',
				method: 'image.p7.measuredgreengain.set',
				params: boundedGain.toFixed(4),
				id: `measuredGreenGain_${this.messageId++}`
			}
			this.instance.debugLog('info', `Sending measured green gain command: ${JSON.stringify(message)}`)
			this.sendJSONRPCMessage(message)
		} catch (error) {
			this.instance.debugLog('error', `Error sending measured green gain command: ${error.message}`)
		}
	}

	sendMeasuredBlueGainCommand(gain) {
		try {
			const boundedGain = Math.max(0.0000, Math.min(1.0000, gain))
			const message = {
				jsonrpc: '2.0',
				method: 'image.p7.measuredbluegain.set',
				params: boundedGain.toFixed(4),
				id: `measuredBlueGain_${this.messageId++}`
			}
			this.instance.debugLog('info', `Sending measured blue gain command: ${JSON.stringify(message)}`)
			this.sendJSONRPCMessage(message)
		} catch (error) {
			this.instance.debugLog('error', `Error sending measured blue gain command: ${error.message}`)
		}
	}

	// Add NVG power command
	sendNVGPowerCommand(level) {
		if (!this.isConnected) {
			this.instance.log('error', 'Cannot send NVG power command: Not connected')
			return
		}

		try {
			// Ensure level is between 0 and 100
			const boundedLevel = Math.max(0, Math.min(100, level))
			
			this.instance.debugLog('info', `Sending NVG power command: ${boundedLevel}`)
			this.sendJSONRPCMessage({
				jsonrpc: '2.0',
				method: 'lightsource.infrared.power.set',
				params: boundedLevel,
				id: `nvg_power_${this.messageId++}`
			})
		} catch (error) {
			this.instance.log('error', `Error sending NVG power command: ${error.message}`)
		}
	}

	// Called when config is updated
	configUpdated(config) {
		this.config = config
		
		if (this.config.enable_network && !this.isConnected) {
			this.instance.debugLog('info', 'Network control enabled - initializing TCP connection')
			this.initTCPConnection()
		} else if (!this.config.enable_network && this.isConnected) {
			this.instance.debugLog('info', 'Network control disabled - closing TCP connection')
			this.closeTCPConnection()
		}
	}

	// Called when module is destroyed
	destroy() {
		this.closeTCPConnection()
	}
}

module.exports = NetworkManager