import { Regex } from '@companion-module/base'

export function updateActions() {
	let actions = {}

	actions['crosspoint'] = {
		name: 'Connect crosspoint',
		options: [
			{
				type: 'dropdown',
				label: 'Source',
				id: 'source',
				default: 'A1',
				choices: this.source_port_labels,
			},
			{
				type: 'dropdown',
				label: 'Destination',
				id: 'destination',
				default: 'D1',
				choices: this.dest_port_labels,
			},
		],
		callback: ({ options }) => {
			var cmd = options.source + '>' + options.destination + 'On\r\n'
			this.sendCommand(cmd)
		},
	}

	actions['disconnect'] = {
		name: 'Disconnect crosspoint',
		options: [
			{
				type: 'dropdown',
				label: 'Source',
				id: 'disconnect_source',
				default: 'A1',
				choices: this.source_port_labels,
			},
			{
				type: 'dropdown',
				label: 'Destination',
				id: 'disconnect_destination',
				default: 'D1',
				choices: this.dest_port_labels,
			},
		],
		callback: ({ options }) => {
			var cmd = options.disconnect_source + '>' + options.disconnect_destination + 'Off\r\n'
			this.sendCommand(cmd)
		},
	}

	actions['user_source_label'] = {
		name: 'Change source label',
		options: [
			{
				type: 'dropdown',
				label: 'Port',
				id: 'source_label_port',
				default: 'A1',
				choices: this.source_port_labels,
			},
			{
				type: 'textinput',
				id: 'source_label_text',
				label: 'New label',
				tooltip: 'Enter text between 1 and 30 characters long',
				regex: '/^.{1,30}$/',
			},
		],
		callback: ({ options }) => {
			if (options.source_label_text.length > 0) {
				console.log(options.source_label_port + ' changing to ' + options.source_label_text)
				var objIndex = this.source_port_labels.findIndex((obj) => obj.id == options.source_label_port)
				// console.log(objIndex)
				this.source_port_labels[objIndex].label = options.source_label_text
				var label_to_update = 'label_source_' + this.source_port_labels[objIndex].id
				this.setVariableValues({ [label_to_update]: this.source_port_labels[objIndex].label })
				this.updateActions()
				console.log(this.source_port_labels)
			} else {
				this.log('warn', 'New label for source ' + options.source_label_port + ' cannot be empty')
			}
		},
	}

	actions['user_dest_label'] = {
		name: 'Change destination label',
		options: [
			{
				type: 'dropdown',
				label: 'Port',
				id: 'dest_label_port',
				default: 'A1',
				choices: this.dest_port_labels,
			},
			{
				type: 'textinput',
				id: 'dest_label_text',
				label: 'New label',
				tooltip: 'Enter text between 1 and 30 characters long',
				regex: '/^.{1,30}$/',
			},
		],
		callback: ({ options }) => {
			if (options.dest_label_text.length > 0) {
				console.log(options.dest_label_port + ' changing to ' + options.dest_label_text)
				var objIndex = this.dest_port_labels.findIndex((obj) => obj.id == options.dest_label_port)
				// console.log(objIndex)
				this.dest_port_labels[objIndex].label = options.dest_label_text
				var label_to_update = 'label_dest_' + this.dest_port_labels[objIndex].id
				this.setVariableValues({ [label_to_update]: this.dest_port_labels[objIndex].label })
				this.updateActions()
				console.log(this.dest_port_labels)
			} else {
				this.log('warn', 'New label for destination ' + options.dest_label_port + ' cannot be empty')
			}
		},
	}

	actions['input_level'] = {
		name: 'Adjust input level',
		options: [
			{
				type: 'dropdown',
				label: 'Input',
				id: 'input_level_port',
				default: 'A1',
				choices: this.source_port_labels,
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
		callback: ({ options }) => {
			console.log('Set input ' + options.input_level_port + ' to ' + options.input_level)
			var cmd = 'I ' + options.input_level_port + '=' + options.input_level + '\r\n'
			this.sendCommand(cmd)
		}
	},

	actions['output_level'] = {
		name: 'Adjust output level',
		options: [
			{
				type: 'dropdown',
				label: 'Output',
				id: 'output_level_port',
				default: 'A1',
				choices: this.dest_port_labels,
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
		callback: ({ options }) => {
			console.log('Set output ' + options.output_level_port + ' to ' + options.output_level)
			var cmd = 'O ' + options.output_level_port + '=' + options.output_level + '\r\n'
			this.sendCommand(cmd)
		}
	},

	actions['reset'] = {
		name: 'Reset',
		options: [
			{
				type: 'dropdown',
				label: 'Action',
				id: 'reset',
				default: 'all off',
				choices: [
					{ id: 'all off', label: 'Reset all routing' },
					{ id: 'all zero', label: 'Reset all levels to zero' },
				],
			},
		],
		callback: ({ options }) => {
			var cmd = options.reset + '\r\n'
			this.sendCommand(cmd)
		}
	},

	actions['status'] = {
		name: 'Status',
		options: [
		],
		callback: ({ options }) => {
			var cmd = 'status\r\n'
			this.sendCommand(cmd)
		}
	},

	this.setActionDefinitions(actions)
}
