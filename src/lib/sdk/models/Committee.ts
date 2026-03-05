/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Committee = {
    id?: string;
    owner_user_id?: string;
    name?: string;
    legal_name?: string | null;
    fec_id?: string | null;
    ein?: string | null;
    committee_type?: Committee.committee_type;
    treasurer_name?: string | null;
    treasurer_address?: string | null;
    mailing_address?: string | null;
    filing_frequency?: Committee.filing_frequency;
    created_at?: string;
    updated_at?: string;
};
export namespace Committee {
    export enum committee_type {
        NATIONAL_PARTY = 'national_party',
        STATE_PARTY = 'state_party',
        PAC = 'pac',
        SUPER_PAC = 'super_pac',
        CANDIDATE = 'candidate',
    }
    export enum filing_frequency {
        QUARTERLY = 'quarterly',
        MONTHLY = 'monthly',
        SEMIANNUAL = 'semiannual',
    }
}

