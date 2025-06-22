import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class JanzzApi implements ICredentialType {
	name = 'janzzApi';
	displayName = 'Janzz API';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
		},
	];
}
