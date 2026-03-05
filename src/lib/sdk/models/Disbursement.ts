/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Disbursement = {
    id?: string;
    committee_id?: string;
    payee_name?: string;
    payee_address?: string | null;
    amount_cents?: number;
    date?: string;
    purpose?: string;
    category?: Disbursement.category;
    check_number?: string | null;
    receipt_url?: string | null;
    report_id?: string | null;
    created_at?: string;
};
export namespace Disbursement {
    export enum category {
        OPERATING = 'operating',
        CONTRIBUTION_TO_CANDIDATE = 'contribution_to_candidate',
        INDEPENDENT_EXPENDITURE = 'independent_expenditure',
        COORDINATED_EXPENDITURE = 'coordinated_expenditure',
        OTHER = 'other',
    }
}

