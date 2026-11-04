import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GiftCampaign } from '../models/gift-campaign.model';

@Injectable({
  providedIn: 'root'
})
export class GiftCampaignService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl || 'http://localhost:8080';

  /**
   * Helper to retrieve active shop code
   */
  getShopCode(): string {
    return localStorage.getItem('shopCode') || 'SHAPE_SHIFT';
  }

  /**
   * 1. Create campaign
   * POST /GiftCampaign/shop/{shopCode}
   */
  createCampaign(campaign: Partial<GiftCampaign>, shopCode?: string): Observable<any> {
    const code = shopCode || this.getShopCode();
    const url = `${this.baseUrl}/GiftCampaign/shop/${code}`;
    return this.http.post<any>(url, campaign);
  }

  /**
   * 2. List campaigns
   * GET /GiftCampaign/shop/{shopCode}
   */
  listCampaigns(shopCode?: string): Observable<any> {
    const code = shopCode || this.getShopCode();
    const url = `${this.baseUrl}/GiftCampaign/shop/${code}`;
    return this.http.get<any>(url);
  }

  /**
   * 3. Campaign details
   * GET /GiftCampaign/{campaignId}/shop/{shopCode}
   */
  getCampaignDetails(campaignId: number | string, shopCode?: string): Observable<any> {
    const code = shopCode || this.getShopCode();
    const url = `${this.baseUrl}/GiftCampaign/${campaignId}/shop/${code}`;
    return this.http.get<any>(url);
  }

  /**
   * 4. Update campaign
   * PUT /GiftCampaign/{campaignId}/shop/{shopCode}
   */
  updateCampaign(campaignId: number | string, campaign: Partial<GiftCampaign>, shopCode?: string): Observable<any> {
    const code = shopCode || this.getShopCode();
    const url = `${this.baseUrl}/GiftCampaign/${campaignId}/shop/${code}`;
    return this.http.put<any>(url, campaign);
  }

  /**
   * 5. Deactivate campaign
   * DELETE /GiftCampaign/{campaignId}/shop/{shopCode}
   */
  deleteCampaign(campaignId: number | string, shopCode?: string): Observable<any> {
    const code = shopCode || this.getShopCode();
    const url = `${this.baseUrl}/GiftCampaign/${campaignId}/shop/${code}`;
    return this.http.delete<any>(url);
  }

  /**
   * 6. Activate/deactivate campaign status
   * PATCH /GiftCampaign/{campaignId}/status/shop/{shopCode}?active=true
   */
  updateCampaignStatus(campaignId: number | string, active: boolean, shopCode?: string): Observable<any> {
    const code = shopCode || this.getShopCode();
    const url = `${this.baseUrl}/GiftCampaign/${campaignId}/status/shop/${code}?active=${active}`;
    return this.http.patch<any>(url, {});
  }
}
