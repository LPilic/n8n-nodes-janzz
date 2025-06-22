import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	IHttpRequestMethods,
} from 'n8n-workflow';

export async function apiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject,
	qs?: IDataObject,
): Promise<any> {
	const credentials = await this.getCredentials('janzzApi');
	const baseUrl = 'https://www.janzz.jobs/japi/';

	const options: IHttpRequestOptions = {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': `Token ${credentials.apiKey}`,
		},
		method,
		body,
		qs,
		url: `${baseUrl}${endpoint}`,
		json: true,
	};

	return this.helpers.httpRequest(options);
}
