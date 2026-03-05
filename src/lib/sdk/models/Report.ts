/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Report = {
    id?: string;
    committee_id?: string;
    report_type?: Report.report_type;
    coverage_start?: string;
    coverage_end?: string;
    filing_deadline?: string | null;
    status?: Report.status;
    fec_file_path?: string | null;
    fec_confirmation_number?: string | null;
    created_at?: string;
    updated_at?: string;
};
export namespace Report {
    export enum report_type {
        QUARTERLY = 'quarterly',
        MONTHLY = 'monthly',
        SEMIANNUAL = 'semiannual',
        YEAR_END = 'year_end',
        AMENDMENT = 'amendment',
    }
    export enum status {
        DRAFT = 'draft',
        REVIEW = 'review',
        SUBMITTED = 'submitted',
        ACCEPTED = 'accepted',
        REJECTED = 'rejected',
    }
}

