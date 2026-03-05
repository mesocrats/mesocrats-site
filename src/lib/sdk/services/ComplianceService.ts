/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ComplianceService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get FEC contribution limits
     * Returns the FEC contribution limits for this committee's type for the 2025-2026 election cycle. All values in cents. Null means unlimited.
     * @returns any Contribution limits
     * @throws ApiError
     */
    public getComplianceLimits(): CancelablePromise<{
        data?: {
            committee_type?: 'national_party' | 'state_party' | 'pac' | 'super_pac' | 'candidate';
            cycle?: string;
            limits?: {
                /**
                 * Cents. Null = unlimited.
                 */
                individual_per_year?: number | null;
                /**
                 * Cents. Null = unlimited.
                 */
                pac_per_year?: number | null;
                /**
                 * Cents. Null = unlimited.
                 */
                party_per_year?: number | null;
            };
            /**
             * Aggregate YTD threshold in cents for FEC itemization ($200)
             */
            itemization_threshold?: number;
        };
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/compliance/limits',
            errors: {
                401: `Invalid or missing API key`,
                403: `API key not bound to a committee`,
                500: `Internal server error`,
            },
        });
    }
}
