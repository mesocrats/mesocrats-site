/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Report } from '../models/Report';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ReportsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * List reports
     * Returns all reports for this committee. Supports filtering by status and report type. Not paginated — returns all matching rows.
     * @param status Filter by report status
     * @param reportType Filter by report type
     * @returns any List of reports
     * @throws ApiError
     */
    public listReports(
        status?: 'draft' | 'review' | 'submitted' | 'accepted' | 'rejected',
        reportType?: 'quarterly' | 'monthly' | 'semiannual' | 'year_end' | 'amendment',
    ): CancelablePromise<{
        data?: Array<Report>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/reports',
            query: {
                'status': status,
                'report_type': reportType,
            },
            errors: {
                401: `Invalid or missing API key`,
                403: `API key not bound to a committee`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Create a report
     * Creates a new report in draft status. Coverage start must be before coverage end.
     * @param requestBody
     * @returns any Report created in draft status
     * @throws ApiError
     */
    public createReport(
        requestBody: {
            /**
             * Report period start date (YYYY-MM-DD)
             */
            coverage_start: string;
            /**
             * Report period end date (YYYY-MM-DD). Must be after coverage_start.
             */
            coverage_end: string;
            report_type?: 'quarterly' | 'monthly' | 'semiannual' | 'year_end' | 'amendment';
            /**
             * Filing deadline date (YYYY-MM-DD)
             */
            filing_deadline?: string;
        },
    ): CancelablePromise<{
        data?: Report;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/reports',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request body or parameters`,
                401: `Invalid or missing API key`,
                403: `API key not bound to a committee`,
                500: `Internal server error`,
            },
        });
    }
}
