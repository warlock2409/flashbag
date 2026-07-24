import { HealthStatus } from '../services/dashboard.service';

// A single computed signal on a customer's retention health
// (e.g. days_since_last_visit, visits_last_30_days).
export interface HealthFeature {
  featureKey: string;
  numericValue: number | null;
  stringValue: string | null;
  referenceDate: string | null;
}

// One customer's health-status record as returned by the retention API.
export interface HealthStatusRecord {
  id?: number;
  shopId: number;
  customerId: number;
  healthScore: number;
  healthStatus: HealthStatus;
  riskLevel?: string;
  revenueRisk?: number;
  features: HealthFeature[];
}

// A single retention follow-up (outreach) logged against a customer.
export interface FollowUp {
  id: number;
  shopId: number;
  customerId: number;
  actionType: 'CALL' | 'WHATSAPP' | string;
  outcome: string | null;       // customer's response, if any
  notes: string;                // the outbound message sent to the customer
  followUpDate: string;         // ISO date the follow-up happened
  nextFollowUpDate: string | null;
  staffId: number;
}

// Spring-style paginated response wrapping HealthStatusRecord[].
export interface HealthStatusPage {
  content: HealthStatusRecord[];
  totalPages: number;
  totalElements: number;
  number: number; // current (zero-based) page index
  size: number;
  first: boolean;
  last: boolean;
}
