import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerProfileResponse } from '../models/customer-profile.model';
import { CustomerProfileUpdateRequest, CustomerProfileUpdateResponse } from '../models/customer-profile-update.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerProfileService {
  private baseUrl = 'http://localhost:8080/api/dynamic-configuration/user/customer';
  private updateBaseUrl = 'http://localhost:8080/api/dynamic-configuration/user/shop';

  constructor(private http: HttpClient) { }

  getCustomerProfiles(customerId: number): Observable<CustomerProfileResponse> {
    return this.http.get<CustomerProfileResponse>(`${this.baseUrl}/${customerId}/profiles`);
  }

  updateCustomerProfiles(shopCode: string, customerId: number, updates: CustomerProfileUpdateRequest): Observable<CustomerProfileUpdateResponse> {
    return this.http.put<CustomerProfileUpdateResponse>(`${this.updateBaseUrl}/${shopCode}/customer/${customerId}`, updates);
  }
}