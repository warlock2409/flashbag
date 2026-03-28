import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ServiceResponse } from '../app.component';
import { InvoiceModel } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  Http = inject(HttpClient);

  constructor() {
    // localStorage.setItem('shopCode', 'BIFITN888');
  }

  getAllShopMembership() {
    let shopCode = localStorage.getItem("shopCode");
    let url = "http://localhost:8080/api/membership/shop/{shopCode}".replace("{shopCode}", shopCode!);
    return this.Http.get<ServiceResponse<any>>(url);
  }

  getCurrentMembership(memId: number) {
    let shopCode = localStorage.getItem("shopCode");
    let url = "http://localhost:8080/api/membership/{memId}/shop/{shopCode}".replace("{shopCode}", shopCode!).replace("{memId}", memId.toString());
    return this.Http.get<ServiceResponse<any>>(url);
  }

  createInvoice(invoice: InvoiceModel) {
    let shopCode = localStorage.getItem("shopCode");
    let url = "http://localhost:8080/api/invoices/shop/{shopCode}".replace("{shopCode}", shopCode!);
    return this.Http.post<ServiceResponse<any>>(url, invoice);
  }

  updateInvoiceStatus(invoiceId: any, status: string) {
    let shopCode = localStorage.getItem("shopCode");
    let url = `http://localhost:8080/api/invoices/{invoiceId}/shop/{shopCode}/action?action=${status}`.replace("{shopCode}", shopCode!).replace("{invoiceId}", invoiceId);
    return this.Http.put<ServiceResponse<any>>(url, {});
  }

  getInvoiceById(invoiceId: number) {
    let shopCode = localStorage.getItem("shopCode");
    let url = `http://localhost:8080/api/invoices/{invoiceId}/shop/{shopCode}`.replace("{shopCode}", shopCode!).replace("{invoiceId}", invoiceId.toString());
    return this.Http.get<ServiceResponse<any>>(url);
  }

  getAllInvoicesByShop(selectTab: string, searchQuery: string = "", page: number = 0, size: number = 10) {
    let shopCode = localStorage.getItem("shopCode");
    if (!shopCode) {
      throw new Error('Shop Not Found');
    }
    let url = "http://localhost:8080/api/invoices/shop/{shopCode}".replace("{shopCode}", shopCode!);

    // Build query parameters
    const params = new URLSearchParams();

    if (selectTab) {
      params.append('invoiceStatus', selectTab);
    }

    if (searchQuery.length > 0) {
      params.append('search', searchQuery);
    }

    // Add pagination parameters
    params.append('page', page.toString());
    params.append('size', size.toString());

    // Append query parameters to URL
    if (params.toString()) {
      url = url + "?" + params.toString();
    }

    return this.Http.get<ServiceResponse<any>>(url);
  }

  getInvoiceStatusCount() {
    let shopCode = localStorage.getItem("shopCode");
    let url = "http://localhost:8080/api/invoices/shop/{shopCode}/status".replace("{shopCode}", shopCode!);
    return this.Http.get<ServiceResponse<any>>(url);
  }


  PostMembershipCheckIn(code: string) {
    let shopCode = localStorage.getItem("shopCode");
    let url = "http://localhost:8080/api/membership/shop/{shopCode}/customer/{code}/system/attendance".replace("{shopCode}", shopCode!).replace("{code}", code!);
    return this.Http.post<ServiceResponse<any>>(url, {});
  }

  getAdvertisementsForArea(area: string) {
    let shopCode = localStorage.getItem("shopCode");
    let url = "http://localhost:8080/api/advertisements/shop/{shopCode}?area={area}".replace("{shopCode}", shopCode!).replace("{area}", area);
    return this.Http.get<ServiceResponse<any>>(url);
  }

  getCustomerMembershipDetails(customerId: number) {
    let url = "http://localhost:8080/api/membership/customer/membership/{customerId}".replace("{customerId}", customerId.toString());
    return this.Http.get<ServiceResponse<any>>(url);
  }

  updateCustomerMembershipStatus(customerId: number, membershipId: number, status: string) {
    let url = "http://localhost:8080/api/membership/customer/{customerId}/membership/{membershipId}/status"
      .replace("{customerId}", customerId.toString())
      .replace("{membershipId}", membershipId.toString());
    let body = {
      status: status
    }
    console.log(body);
    return this.Http.put<ServiceResponse<any>>(url, body);
  }

  updatePendingMembershipStatus(customerId: number, membershipId: number, data: any) {
    let url = "http://localhost:8080/api/membership/{membershipId}/customer/{customerId}/pending"
      .replace("{customerId}", customerId.toString())
      .replace("{membershipId}", membershipId.toString());
    return this.Http.put<ServiceResponse<any>>(url, data);
  }

  assignGoalToMembership(membershipId: number, payload: { goalId: number; mode: string }) {
    let url = "http://localhost:8080/api/membership/{membershipId}/assign-goal"
      .replace("{membershipId}", membershipId.toString());
    return this.Http.put<ServiceResponse<any>>(url, payload);
  }

}
