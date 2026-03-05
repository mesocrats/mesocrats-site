/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class SystemService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Health check
     * Returns API status and database connectivity. No authentication required.
     * @returns any API is running
     * @throws ApiError
     */
    public getHealth(): CancelablePromise<{
        status: string;
        version: string;
        timestamp: string;
        database: 'connected' | 'error';
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/health',
        });
    }
}
