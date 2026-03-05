/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Contributor = {
    id?: string;
    committee_id?: string;
    entity_type?: string;
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
    email?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    state?: string | null;
    zip_code?: string | null;
    employer?: string | null;
    occupation?: string | null;
    /**
     * Auto-generated: lowercase(last_name)_zip_code
     */
    match_key?: string | null;
    created_at?: string;
    updated_at?: string;
};

