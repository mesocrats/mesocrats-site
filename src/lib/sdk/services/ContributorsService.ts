/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Contributor } from '../models/Contributor';
import type { Pagination } from '../models/Pagination';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ContributorsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * List contributors
     * Returns a paginated list of contributors for this committee. Supports case-insensitive search across full_name, email, and last_name.
     * @param page Page number (default: 1)
     * @param limit Results per page (default: 50, max: 250)
     * @param search Case-insensitive search against full_name, email, or last_name
     * @returns any Paginated list of contributors
     * @throws ApiError
     */
    public listContributors(
        page: number = 1,
        limit: number = 50,
        search?: string,
    ): CancelablePromise<{
        data?: Array<Contributor>;
        pagination?: Pagination;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/contributors',
            query: {
                'page': page,
                'limit': limit,
                'search': search,
            },
            errors: {
                401: `Invalid or missing API key`,
                403: `API key not bound to a committee`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Create a contributor
     * Creates a new contributor record. Automatically generates match_key (lowercase last_name + zip_code) for fuzzy matching and full_name if not provided.
     * @param requestBody
     * @returns any Contributor created
     * @throws ApiError
     */
    public createContributor(
        requestBody: {
            first_name: string;
            last_name: string;
            /**
             * Auto-generated from first_name + last_name if omitted
             */
            full_name?: string;
            /**
             * individual, organization, or committee
             */
            entity_type?: string;
            email?: string;
            address_line1?: string;
            address_line2?: string;
            city?: string;
            /**
             * Two-letter US state abbreviation
             */
            state?: string;
            zip_code?: string;
            employer?: string;
            occupation?: string;
        },
    ): CancelablePromise<{
        data?: Contributor;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/contributors',
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
