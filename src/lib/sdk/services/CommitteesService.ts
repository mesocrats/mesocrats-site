/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Committee } from '../models/Committee';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class CommitteesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get your committee
     * Returns the committee bound to this API key, or null if the key is not yet bound. Does not require committee binding.
     * @returns any Committee or null
     * @throws ApiError
     */
    public getCommittee(): CancelablePromise<{
        data?: (Committee | null);
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/committees',
            errors: {
                401: `Invalid or missing API key`,
            },
        });
    }
    /**
     * Create a committee
     * Creates a new committee and binds it to the calling API key. The key must not already be bound to a committee. Writes to both the PartyStack database (committee record) and the main database (key binding).
     * @param requestBody
     * @returns any Committee created
     * @throws ApiError
     */
    public createCommittee(
        requestBody: {
            /**
             * Committee display name
             */
            name: string;
            legal_name?: string;
            /**
             * FEC committee ID if registered
             */
            fec_id?: string;
            /**
             * IRS Employer Identification Number
             */
            ein?: string;
            committee_type?: 'national_party' | 'state_party' | 'pac' | 'super_pac' | 'candidate';
            treasurer_name?: string;
            treasurer_address?: string;
            mailing_address?: string;
            filing_frequency?: 'quarterly' | 'monthly' | 'semiannual';
        },
    ): CancelablePromise<{
        data?: Committee;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/committees',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request body or parameters`,
                401: `Invalid or missing API key`,
                409: `API key already bound to a committee`,
                500: `Internal server error`,
            },
        });
    }
}
