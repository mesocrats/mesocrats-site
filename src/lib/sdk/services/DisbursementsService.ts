/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Disbursement } from '../models/Disbursement';
import type { Pagination } from '../models/Pagination';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DisbursementsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * List disbursements
     * Returns a paginated list of disbursements for this committee. Supports filtering by date range and category.
     * @param page Page number (default: 1)
     * @param limit Results per page (default: 50, max: 250)
     * @param startDate Filter disbursements on or after this date
     * @param endDate Filter disbursements on or before this date
     * @param category Filter by disbursement category
     * @returns any Paginated list of disbursements
     * @throws ApiError
     */
    public listDisbursements(
        page: number = 1,
        limit: number = 50,
        startDate?: string,
        endDate?: string,
        category?: 'operating' | 'contribution_to_candidate' | 'independent_expenditure' | 'coordinated_expenditure' | 'other',
    ): CancelablePromise<{
        data?: Array<Disbursement>;
        pagination?: Pagination;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/disbursements',
            query: {
                'page': page,
                'limit': limit,
                'start_date': startDate,
                'end_date': endDate,
                'category': category,
            },
            errors: {
                401: `Invalid or missing API key`,
                403: `API key not bound to a committee`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Record a disbursement
     * Records a new disbursement (expenditure) for the committee. Validates required fields and category.
     * @param requestBody
     * @returns any Disbursement created
     * @throws ApiError
     */
    public createDisbursement(
        requestBody: {
            payee_name: string;
            payee_address?: string;
            /**
             * Amount in cents. Minimum $0.01
             */
            amount_cents: number;
            /**
             * Disbursement date (YYYY-MM-DD)
             */
            date: string;
            /**
             * FEC-compliant expenditure purpose description
             */
            purpose: string;
            category?: 'operating' | 'contribution_to_candidate' | 'independent_expenditure' | 'coordinated_expenditure' | 'other';
            check_number?: string;
            receipt_url?: string;
        },
    ): CancelablePromise<{
        data?: Disbursement;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/disbursements',
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
