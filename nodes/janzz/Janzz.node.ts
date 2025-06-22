import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';
import { apiRequest } from './GenericFunctions';

export class Janzz implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Janzz',
		name: 'janzz',
		icon: 'file:JANZZjobs.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume Janzz API',
		defaults: {
			name: 'Janzz',
		},
		inputs: ['main'] as NodeConnectionType[],
		outputs: ['main'] as NodeConnectionType[],
		credentials: [
			{
				name: 'janzzApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Job',
						value: 'job',
					},
				],
				default: 'job',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['job'],
					},
				},
				options: [
					{
						name: 'Parse',
						value: 'parse',
						action: 'Parse a job',
					},
				],
				default: 'parse',
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['parse'],
					},
				},
				placeholder: 'Paste the job description here...',
				description: 'The job description text to parse',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['parse'],
					},
				},
				placeholder: 'Optional title for the job',
				description: 'An optional title for the job description',
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{
						name: 'Standard',
						value: 'standard',
					},
					{
						name: 'Normalized',
						value: 'normalized',
					},
				],
				default: 'standard',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['parse'],
					},
				},
				description: 'The desired output format',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['parse'],
					},
				},
				placeholder: 'e.g., en, de, fr',
				description: '2-character ISO 639-1 language code. If not provided, it will be auto-detected.',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				if (resource === 'job' && operation === 'parse') {
					const text = this.getNodeParameter('text', i) as string;
					const title = this.getNodeParameter('title', i, '') as string;
					const outputFormat = this.getNodeParameter('outputFormat', i, 'standard') as string;
					const language = this.getNodeParameter('language', i, '') as string;

					const body: IDataObject = { text };
					if (title) body.title = title;

					const qs: IDataObject = { output: outputFormat };
					if (language) qs.lang = language;

					const responseData = await apiRequest.call(this, 'POST', 'parser/job/', body, qs);

					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray([responseData]),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray([{ error: error.message }]),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}