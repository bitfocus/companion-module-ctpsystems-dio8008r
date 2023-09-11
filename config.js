import { Regex } from '@companion-module/base'

export const ConfigFields = [
	{
		type: 'static-text',
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
		default: '',
		regex: Regex.IP,
	},
	{
		type: 'textinput',
		id: 'port',
		label: 'Device Port',
		width: 6,
		default: '10001',
		regex: Regex.Port,
	},
]
