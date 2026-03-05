/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AggregateInfo } from '../models/AggregateInfo';
import type { Contribution } from '../models/Contribution';
import type { Pagination } from '../models/Pagination';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ContributionsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * List contributions
     * Returns a paginated list of contributions for this committee. Supports filtering by date range, contributor, and itemization status.
     * @param page Page number (default: 1)
     * @param limit Results per page (default: 50, max: 250)
     * @param startDate Filter contributions received on or after this date
     * @param endDate Filter contributions received on or before this date
     * @param contributorId Filter by contributor UUID
     * @param itemized Filter by itemization status (aggregate > $200)
     * @returns any Paginated list of contributions
     * @throws ApiError
     */
    public listContributions(
        page: number = 1,
        limit: number = 50,
        startDate?: string,
        endDate?: string,
        contributorId?: string,
        itemized?: 'true' | 'false',
    ): CancelablePromise<{
        data?: Array<Contribution>;
        pagination?: Pagination;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/contributions',
            query: {
                'page': page,
                'limit': limit,
                'start_date': startDate,
                'end_date': endDate,
                'contributor_id': contributorId,
                'itemized': itemized,
            },
            errors: {
                401: `Invalid or missing API key`,
                403: `API key not bound to a committee`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Record a contribution
     * Records a new contribution. Validates the contributor belongs to this committee, enforces FEC contribution limits based on committee type, updates the contributor's year-to-date aggregate, and sets the itemization flag when the aggregate exceeds $200. Returns the contribution with aggregate info.
     * @param requestBody
     * @returns any Contribution created
     * @throws ApiError
     */
    public createContribution(
        requestBody: {
            /**
             * Must reference a contributor belonging to this committee
             */
            contributor_id: string;
            /**
             * Amount in cents. Minimum $1.00 (100 cents)
             */
            amount_cents: number;
            /**
             * Date the contribution was received (YYYY-MM-DD)
             */
            date_received: string;
            /**
             * individual, pac, party_transfer, or other
             */
            contribution_type?: string;
            /**
             * credit_card, check, wire, or other
             */
            payment_method?: string;
            stripe_charge_id?: string;
            /**
             * one_time, monthly, or quarterly
             */
            frequency?: string;
            citizenship_attested?: boolean;
            personal_funds_attested?: boolean;
            non_contractor_attested?: boolean;
            personal_card_attested?: boolean;
            age_attested?: boolean;
            /**
             * Falls back to x-forwarded-for if omitted
             */
            ip_address?: string;
        },
    ): CancelablePromise<{
        data?: (Contribution & {
            aggregate?: AggregateInfo;
        });
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/contributions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request body or parameters`,
                401: `Invalid or missing API key`,
                403: `API key not bound to a committee`,
                404: `Contributor not found or does not belong to this committee`,
                422: `FEC contribution limit would be exceeded`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get a contribution
     * Returns a single contribution by ID, scoped to this committee. Returns 404 if the contribution doesn't exist or belongs to a different committee.
     * @param id Contribution UUID
     * @returns any Contribution found
     * @throws ApiError
     */
    public getContribution(
        id: string,
    ): CancelablePromise<{
        data?: Contribution;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/contributions/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Invalid or missing API key`,
                403: `API key not bound to a committee`,
                404: `Contribution not found`,
            },
        });
    }
}
