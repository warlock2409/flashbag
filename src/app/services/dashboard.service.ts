import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ResponseDate } from '../app.component';
import { HealthStatusPage } from '../models/retention.model';

export type HealthStatus = 'HEALTHY' | 'WATCH' | 'NEEDS_ATTENTION' | 'CRITICAL';

export interface DailyBriefResponse {
  countsByStatus: Record<HealthStatus, number>;
  revenueRiskByStatus: Record<HealthStatus, number>;
  total: number;
  totalRevenueRisk: number;
}

export type FollowUpActionType = 'CALL' | 'WHATSAPP' | 'EMAIL' | 'SCHEDULED_VISIT' | 'NOTE_ONLY';

export interface FollowUpRequest {
  organizationId: number;
  shopId: number;
  customerId: number;
  actionType: FollowUpActionType;
  notes: string;
  followUpDate: string;         // yyyy-MM-dd
  nextFollowUpDate?: string | null; // yyyy-MM-dd, optional
  staffId?: number;
  outcome?: string | null;      // CALL only — the follow-up outcome enum
  doNotDisturb?: boolean;       // CALL only — true when outcome is DND
}

export interface MembershipPlanSale {
  planId: number;
  planName: string;
  soldCount: number;
  revenue: number;
}

export interface MonthlyMembershipSalesData {
  year: number;
  month: number;
  totalSoldCount: number;
  totalRevenue: number;
  plans: MembershipPlanSale[];
}

export interface MonthlyMembershipSalesResponse {
  data: MonthlyMembershipSalesData;
  message: string;
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  http = inject(HttpClient);
  constructor() { }

  getDailyBrief() {
    // Organization and shop IDs kept static for now.
    const organizationId = 2;
    const shopId = 2;
    const url = `http://localhost:8080/api/retention/organizations/${organizationId}/shops/${shopId}/health/daily-brief`;
    return this.http.get<DailyBriefResponse>(url);
  }

  // Paginated health-status records for a single status bucket.
  // orgId/shopId kept static to match getDailyBrief() — move to localStorage
  // when multi-shop support lands.
  getHealthStatusPage(status: HealthStatus, page = 0, size = 20) {
    const organizationId = 2;
    const shopId = 2;
    const url = `http://localhost:8080/api/retention/organizations/${organizationId}/shops/${shopId}/health/status/${status}?page=${page}&size=${size}`;
    return this.http.get<HealthStatusPage>(url);
  }

  getActiveMemberships() {
    const shopCode = localStorage.getItem("shopCode");
    if (!shopCode) throw new Error("shop code not found");

    const url = `http://localhost:8080/dashboard/shop/${shopCode}/memberships/active`;
    return this.http.get<ResponseDate>(url);
  }

  getMembershipSummary() {
    const shopCode = localStorage.getItem("shopCode");
    if (!shopCode) throw new Error("shop code not found");

    const url = `http://localhost:8080/dashboard/shop/${shopCode}/memberships/summary`;
    return this.http.get<ResponseDate>(url);
  }

  getHourlyCheckIns() {
    const shopCode = localStorage.getItem("shopCode");
    if (!shopCode) throw new Error("shop code not found");

    const url = `http://localhost:8080/dashboard/shop/${shopCode}/memberships/hourly-comparison`;
    return this.http.get<any[]>(url);
  }

  getRenewalTrends() {
    const shopCode = localStorage.getItem("shopCode");
    if (!shopCode) throw new Error("shop code not found");

    const url = `http://localhost:8080/shop/${shopCode}/memberships/renewal-trends`;
    return this.http.get<any>(url);
  }
  getRevenueHeatmap(year: number = 2025) {
    const shopCode = localStorage.getItem("shopCode");
    if (!shopCode) throw new Error("shop code not found");

    const url = `http://localhost:8080/api/invoices/revenue/${shopCode}/heatmap/${year}`;
    return this.http.get<any>(url);
  }

  getHeatmapInvoices(date: string) {
    const shopCode = localStorage.getItem("shopCode");
    if (!shopCode) throw new Error("shop code not found");

    const url = `http://localhost:8080/api/invoices/revenue/heatmap/${shopCode}/invoices?date=${date}`;
    return this.http.get<any>(url);
  }

  getMonthlyMembershipSales(year: number, month: number) {
    const shopCode = localStorage.getItem("shopCode");
    if (!shopCode) throw new Error("shop code not found");

    const url = `http://localhost:8080/api/invoices/revenue/${shopCode}/memberships/${year}/${month}`;
    return this.http.get<MonthlyMembershipSalesResponse>(url);
  }

  // Log a retention follow-up (e.g. after a call or WhatsApp message).
  // orgId/shopId kept static to match the other retention endpoints.
  createFollowUp(body: Omit<FollowUpRequest, 'organizationId' | 'shopId'>) {
    const organizationId = 2;
    const shopId = 2;
    const url = `http://localhost:8080/api/retention/follow-ups`;
    return this.http.post(url, { organizationId, shopId, ...body });
  }

  getMembershipPurchaseCounts() {
    const shopCode = localStorage.getItem("shopCode");
    if (!shopCode) throw new Error("shop code not found");

    const url = `http://localhost:8080/api/membership/purchase-count/shop/${shopCode}`;
    return this.http.get<ResponseDate>(url);
  }

}
