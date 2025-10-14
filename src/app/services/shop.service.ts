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

  getAllInvoicesByShop(selectTab: string, searchQuery: string = "") {
    let shopCode = localStorage.getItem("shopCode");
    if (shopCode) {
      throw new Error('Shop Not Found');
    }
    let url = "http://localhost:8080/api/invoices/shop/{shopCode}".replace("{shopCode}", shopCode!);
    if (selectTab) {
      url = url + "?invoiceStatus=" + selectTab;
    }
    if (searchQuery.length > 0) {
      url = url + "&search=" + searchQuery;
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

}
