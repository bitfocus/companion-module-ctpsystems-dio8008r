// CTP Systems DIO8008R or DIO8008RX

import { InstanceBase, InstanceStatus, runEntrypoint, TCPHelper } from '@companion-module/base'
import { ConfigFields } from './config.js'
import { updateActions } from './actions.js'
import { updatePresets } from './presets.js'
import { updateVariables } from './variables.js'

class CTP_DIO8008 extends InstanceBase {
	constructor(internal) {
		super(internal)

		this.updateActions = updateActions.bind(this)
		this.updatePresets = updatePresets.bind(this)
		this.updateVariables = updateVariables.bind(this)
	}

	async init(config) {
		this.config = config

		this.source_port_labels = []
		this.dest_port_labels = []

		for (var i = 1; i <= 8; i++) {
			this.source_port_labels.push({ id: 'A' + i, label: 'Analogue ' + i })
		}

		for (var i = 1; i <= 16; i++) {
			this.source_port_labels.push({ id: 'D' + i, label: 'Dante ' + i })
		}

		for (var i = 1; i <= 8; i++) {
			this.dest_port_labels.push({ id: 'A' + i, label: 'Analogue ' + i })
		}

		for (var i = 1; i <= 16; i++) {
			this.dest_port_labels.push({ id: 'D' + i, label: 'Dante ' + i })
		}

		this.updateActions()
		this.updateVariables()
		this.updatePresets()

		await this.configUpdated(config)
	}

	async configUpdated(config) {

		if (this.socket) {
			this.socket.destroy()
			delete this.socket
		}

		this.config = config

		this.init_tcp()
		this.updateVariables()
	}

	async destroy() {
		if (this.socket) {
			this.socket.destroy()
		}
	}

	getConfigFields() {
		return ConfigFields
	}

	init_tcp() {
		console.log('initTCP ' + this.config.host + ':' + this.config.port)

		if (this.socket) {
			this.socket.destroy()
			delete this.socket
		}

		this.updateStatus(InstanceStatus.Connecting)

		if (this.config.host) {
			this.socket = new TCPHelper(this.config.host, this.config.port)

			this.socket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
			})

			this.socket.on('error', (err) => {
				this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
				this.log('error', 'Network error: ' + err.message)
			})

			this.socket.on('data', (data) => {
				// console.log('Data received')
				// console.log(data)

				var i = 0
				var line = ''
				var offset = 0
				var receivebuffer = ''
				receivebuffer += data

				while ((i = receivebuffer.indexOf('\n', offset)) !== -1) {
					line = receivebuffer.substr(offset, i - offset)
					offset = i + 1
					if (line != 'OK') {
						this.log('info', line)
					}
				}
				receivebuffer = receivebuffer.substr(offset)
			})
		} else {
			this.updateStatus(InstanceStatus.BadConfig)
		}
	}

	sendCommand(cmd) {
		if (cmd !== undefined) {
			if (this.socket !== undefined) {
				this.log('info', 'Sending: ' + cmd)
				this.socket.send(cmd)
			} else {
				this.log('warn', 'Socket not connected, tried to send: ' + cmd)
			}
		}
	}
}

runEntrypoint(CTP_DIO8008, [])
