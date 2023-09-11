export function updateVariables() {
	let variables = []

	for (var i = 1; i <= 8; i++) {
		variables.push({
			name: 'Label source A' + i,
			variableId: 'label_source_A' + i,
		})
	}

	for (var i = 1; i <= 16; i++) {
		variables.push({
			name: 'Label source D' + i,
			variableId: 'label_source_D' + i,
		})
	}

	for (var i = 1; i <= 8; i++) {
		variables.push({
			name: 'Label destination A' + i,
			variableId: 'label_dest_A' + i,
		})
	}

	for (var i = 1; i <= 16; i++) {
		variables.push({
			name: 'Label destination D' + i,
			variableId: 'label_dest_D' + i,
		})
	}

	this.setVariableDefinitions(variables)
}
