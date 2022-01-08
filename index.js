// CTP Systems DIO8008R or DIO8008RX

var tcp = require('../../tcp')
var instance_skel = require('../../instance_skel')
var debug
var log

function instance(system) {
	var self = this

	// Request id counter
	self.request_id = 0
	self.stash = []
	self.command = null

	self.locks = []
	self.port_labels = []

	for (var i = 1; i <= 8; i++) {
		self.port_labels.push({ id: 'A' + i, label: 'Analogue ' + i })
		self.locks.push({ id: 'A' + i, value: 0 })
	}

	for (var i = 1; i <= 16; i++) {
		self.port_labels.push({ id: 'D' + i, label: 'Dante ' + i })
		self.locks.push({ id: 'D' + i, value: 0 })
	}

	// super-constructor
	instance_skel.apply(this, arguments)

	self.actions()

	return self
}

instance.prototype.updateConfig = function (config) {
	var self = this

	self.config = config
	self.init_tcp()
}

instance.prototype.init = function () {
	var self = this

	debug = self.debug
	log = self.log

	self.init_tcp()

	self.create_variables()
	self.init_presets()
	self.update_variables()
}

instance.prototype.init_tcp = function () {
	var self = this
	var receivebuffer = ''

	if (self.socket !== undefined) {
		self.socket.destroy()
		delete self.socket
	}

	self.has_data = false

	if (self.config.host) {
		self.socket = new tcp(self.config.host, self.config.port)

		self.socket.on('status_change', function (status, message) {
			self.status(status, message)
		})

		self.socket.on('error', function (err) {
			debug('Network error', err)
			self.log('error', 'Network error: ' + err.message)
		})

		self.socket.on('connect', function () {
			debug('Connected')
		})

		// separate buffered stream into lines with responses
		self.socket.on('data', function (chunk) {
			self.log('debug', 'data received')
			var i = 0,
				line = '',
				offset = 0
			receivebuffer += chunk

			while ((i = receivebuffer.indexOf('\n', offset)) !== -1) {
				line = receivebuffer.substr(offset, i - offset)
				offset = i + 1
				self.socket.emit('receiveline', line.toString())
			}

			receivebuffer = receivebuffer.substr(offset)
		})

		self.socket.on('receiveline', function (line) {
			debug('Response from device: ', line)
			if (line != 'OK') {
				self.log('debug', line.toString())
			}
		})
	}
}

instance.prototype.config_fields = function () {
	var self = this

	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This module will allow you to control the CTP Systems DIO8008R or DIO8008RX.',
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Device IP',
			width: 6,
			regex: self.REGEX_IP,
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Device Port',
			width: 6,
			default: '10001',
			regex: self.REGEX_PORT,
		},
	]
}

instance.prototype.destroy = function () {
	var self = this

	if (self.socket !== undefined) {
		self.socket.destroy()
	}
}

instance.prototype.create_variables = function (system) {
	var self = this
	var variables = []

	for (var i = 0; i < self.locks.length; i++) {
		variables.push({
			label: 'Lock state ' + self.locks[i].id,
			name: 'lock_state_' + self.locks[i].id,
		})
	}

	self.setVariableDefinitions(variables)
}

instance.prototype.update_variables = function (system) {
	var self = this

	for (var i = 0; i < self.locks.length; i++) {
		self.setVariable('lock_state_' + self.locks[i].id, self.locks[i].value)
	}
}

instance.prototype.feedback = function (feedback, bank) {
	var self = this
}

instance.prototype.init_presets = function () {
	var self = this
	var presets = []
	self.setPresetDefinitions(presets)
}

instance.prototype.actions = function () {
	var self = this

	self.system.emit('instance_actions', self.id, {
		crosspoint: {
			label: 'Connect',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'source',
					default: 'A1',
					choices: self.port_labels,
				},
				{
					type: 'dropdown',
					label: 'Destination',
					id: 'destination',
					default: 'D1',
					choices: self.port_labels,
				},
			],
		},
		disconnect: {
			label: 'Disconnect',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'disconnect_source',
					default: 'A1',
					choices: self.port_labels,
				},
				{
					type: 'dropdown',
					label: 'Destination',
					id: 'disconnect_destination',
					default: 'D1',
					choices: self.port_labels,
				},
			],
		},
		lock: {
			label: 'Set destination lock',
			options: [
				{
					type: 'dropdown',
					label: 'Destination',
					id: 'lock_destination',
					default: 'A1',
					choices: self.port_labels,
				},
				{
					type: 'dropdown',
					label: 'Set',
					id: 'lock',
					default: '1',
					choices: [
						{ id: '1', label: 'Lock Destination' },
						{ id: '0', label: 'Unlock Destination' },
						{ id: 't', label: 'Toggle Lock' },
					],
				},
			],
		},
		input_level: {
			label: 'Adjust input level',
			options: [
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input_level_port',
					default: 'A1',
					choices: self.port_labels,
				},
				{
					type: 'number',
					label: 'Level',
					id: 'input_level',
					default: 0,
					min: -12,
					max: 12,
				},
			],
		},
		output_level: {
			label: 'Adjust output level',
			options: [
				{
					type: 'dropdown',
					label: 'Output',
					id: 'output_level_port',
					default: 'A1',
					choices: self.port_labels,
				},
				{
					type: 'number',
					label: 'Level',
					id: 'output_level',
					default: 0,
					min: -12,
					max: 12,
				},
			],
		},
		status: {
			label: 'Ask device for status',
		},
		reset: {
			label: 'Reset',
			options: [
				{
					type: 'dropdown',
					label: 'Action',
					id: 'reset',
					default: 'all off',
					choices: [
						{ id: 'all off', label: 'Reset all routing' },
						{ id: 'all zero', label: 'Reset all levels to zero' },
						// { id: 'all unlock', label: 'Unlock all destinations' }
					],
				},
			],
		},
	})
}

instance.prototype.action = function (action) {
	var self = this
	var cmd

	if (action.action === 'crosspoint') {
		objIndex = self.locks.findIndex((obj) => obj.id == action.options.destination)
		if (self.locks[objIndex].value == 1) {
			self.log('warn', 'Unable to route to ' + action.options.destination + ' because it is locked')
		} else {
			cmd = action.options.source + '>' + action.options.destination + 'On\r\n'
		}
	}

	if (action.action === 'disconnect') {
		objIndex = self.locks.findIndex((obj) => obj.id == action.options.disconnect_destination)
		if (self.locks[objIndex].value == 1) {
			self.log('warn', 'Unable to disconnect ' + action.options.disconnect_destination + ' because it is locked')
		} else {
			cmd = action.options.disconnect_source + '>' + action.options.disconnect_destination + 'Off\r\n'
		}
	}

	if (action.action === 'lock') {
		self.debug('set dest ' + action.options.lock_destination + ' to lock value ' + action.options.lock)
		objIndex = self.locks.findIndex((obj) => obj.id == action.options.lock_destination)

		if (action.options.lock === 't') {
			// toggle
			self.locks[objIndex].value = self.locks[objIndex].value == 0 ? 1 : 0
		} else {
			self.locks[objIndex].value = action.options.lock
		}
		self.update_variables()
		self.debug(self.locks)
	}

	if (action.action === 'input_level') {
		cmd = 'I ' + action.options.input_level_port + '=' + action.options.input_level + '\r\n'
	}

	if (action.action === 'output_level') {
		cmd = 'O ' + action.options.output_level_port + '=' + action.options.output_level + '\r\n'
	}

	if (action.action === 'reset') {
		cmd = action.options.reset + '\r\n'
	}

	if (action.action === 'status') {
		cmd = 'status\r\n'
	}

	if (cmd !== undefined) {
		if (self.socket !== undefined && self.socket.connected) {
			self.debug('sending: ' + cmd)
			self.socket.send(cmd)
		} else {
			self.log('warn', 'Socket not connected')
			self.debug('Socket not connected, tried to send: ' + cmd)
		}
	}
}

instance_skel.extendedBy(instance)
exports = module.exports = instance
