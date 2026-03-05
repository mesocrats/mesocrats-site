/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Contribution = {
    id?: string;
    committee_id?: string;
    contributor_id?: string;
    amount_cents?: number;
    date_received?: string;
    contribution_type?: string;
    payment_method?: string | null;
    stripe_charge_id?: string | null;
    frequency?: string;
    citizenship_attested?: boolean;
    personal_funds_attested?: boolean;
    non_contractor_attested?: boolean;
    personal_card_attested?: boolean;
    age_attested?: boolean;
    ip_address?: string | null;
    /**
     * Year-to-date aggregate for this contributor after this contribution
     */
    aggregate_ytd_cents?: number | null;
    /**
     * True if aggregate YTD exceeds $200 (20000 cents)
     */
    itemized?: boolean;
    report_id?: string | null;
    created_at?: string;
};

