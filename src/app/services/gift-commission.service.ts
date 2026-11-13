import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ServiceResponse } from '../app.component';

export interface CommissionSummary {
  totalEarnedPaise: number;
  accruedPaise: number;
  paidPaise: number;
  reversedPaise: number;
}

export interface CommissionRow {
  id: number;
  invoiceId: number;
  giftCardId: number;
  consumingShopId: number;
  consumingShopName?: string;
  redeemedAmountPaise: number;
  commissionAmountPaise: number;
  status: 'ACCRUED' | 'PAID' | 'REVERSED' | string;
  accruedAt: string;
}

export interface CommissionPage {
  content: CommissionRow[];
  totalElements: number;
  totalPages: number;
  number?: number;
}

export interface CommissionDashboard {
  summary: CommissionSummary;
  commissions: CommissionPage;
}

export interface CommissionFilters {
  from?: string;   // yyyy-MM-dd
  to?: string;     // yyyy-MM-dd
  status?: string; // ACCRUED | PAID | REVERSED
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GiftCommissionService {

  Http = inject(HttpClient);

  getShopCommissions(shopCode: string, filters: CommissionFilters = {}): Observable<ServiceResponse<CommissionDashboard>> {
    const url = `${environment.apiUrl}/GiftCommission/shop/${shopCode}`;
    let params = new HttpParams()
      .set('page', String(filters.page ?? 0))
      .set('size', String(filters.size ?? 10));
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    if (filters.status) params = params.set('status', filters.status);
    return this.Http.get<ServiceResponse<CommissionDashboard>>(url, { params });
  }
}
