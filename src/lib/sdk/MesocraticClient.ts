/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { FetchHttpRequest } from './core/FetchHttpRequest';
import { CommitteesService } from './services/CommitteesService';
import { ComplianceService } from './services/ComplianceService';
import { ContributionsService } from './services/ContributionsService';
import { ContributorsService } from './services/ContributorsService';
import { DisbursementsService } from './services/DisbursementsService';
import { ReportsService } from './services/ReportsService';
import { SystemService } from './services/SystemService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class MesocraticClient {
    public readonly committees: CommitteesService;
    public readonly compliance: ComplianceService;
    public readonly contributions: ContributionsService;
    public readonly contributors: ContributorsService;
    public readonly disbursements: DisbursementsService;
    public readonly reports: ReportsService;
    public readonly system: SystemService;
    public readonly request: BaseHttpRequest;
    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = FetchHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? 'https://developer.mesocrats.org/api/v1',
            VERSION: config?.VERSION ?? '1.0.0',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });
        this.committees = new CommitteesService(this.request);
        this.compliance = new ComplianceService(this.request);
        this.contributions = new ContributionsService(this.request);
        this.contributors = new ContributorsService(this.request);
        this.disbursements = new DisbursementsService(this.request);
        this.reports = new ReportsService(this.request);
        this.system = new SystemService(this.request);
    }
}

