import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PromotionOffer } from '../models/promotion.model';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl || 'http://localhost:8080';

  /**
   * Helper to retrieve active shop code from localStorage or fallback
   */
  getShopCode(): string {
    return localStorage.getItem('shopCode') || 'SHAPE_SHIFT';
  }

  /**
   * 1. Create offer
   * POST /promotion/shop/{shopCode}
   */
  createOffer(offer: Partial<PromotionOffer>, shopCode?: string): Observable<any> {
    const code = shopCode || this.getShopCode();
    const url = `${this.baseUrl}/promotion/shop/${code}`;
    return this.http.post<any>(url, offer);
  }

  /**
   * 2. Get all offers for a shop
   * GET /promotion/shop/{shopCode}
   */
  getAllOffers(shopCode?: string): Observable<any> {
    const code = shopCode || this.getShopCode();
    const url = `${this.baseUrl}/promotion/shop/${code}`;
    return this.http.get<any>(url);
  }

  /**
   * 3. Get offer by ID
   * GET /promotion/{offerId}/shop/{shopCode}
   */
  getOfferById(offerId: number | string, shopCode?: string): Observable<any> {
    const code = shopCode || this.getShopCode();
    const url = `${this.baseUrl}/promotion/${offerId}/shop/${code}`;
    return this.http.get<any>(url);
  }

  /**
   * 4. Update offer
   * PUT /promotion/{offerId}/shop/{shopCode}
   */
  updateOffer(offerId: number | string, offer: Partial<PromotionOffer>, shopCode?: string): Observable<any> {
    const code = shopCode || this.getShopCode();
    const url = `${this.baseUrl}/promotion/${offerId}/shop/${code}`;
    return this.http.put<any>(url, offer);
  }

  /**
   * 5. Delete offer
   * DELETE /promotion/{offerId}/shop/{shopCode}
   */
  deleteOffer(offerId: number | string, shopCode?: string): Observable<any> {
    const code = shopCode || this.getShopCode();
    const url = `${this.baseUrl}/promotion/${offerId}/shop/${code}`;
    return this.http.delete<any>(url);
  }

  /**
   * 6. Update offer status
   * PATCH /promotion/{offerId}/status/shop/{shopCode}?active={true/false}
   */
  updateOfferStatus(offerId: number | string, active: boolean, shopCode?: string): Observable<any> {
    const code = shopCode || this.getShopCode();
    const url = `${this.baseUrl}/promotion/${offerId}/status/shop/${code}?active=${active}`;
    return this.http.patch<any>(url, {});
  }

  /**
   * 7. Get commission policy for a shop
   * GET /CommissionPolicy/shop/{shopCode}
   */
  getCommissionPolicy(shopCode?: string): Observable<any> {
    const code = shopCode || this.getShopCode();
    const url = `${this.baseUrl}/CommissionPolicy/shop/${code}`;
    return this.http.get<any>(url);
  }
}
