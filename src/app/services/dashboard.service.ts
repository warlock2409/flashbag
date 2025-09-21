import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ResponseDate } from '../app.component';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  http = inject(HttpClient);
  constructor() { }

  getActiveMemberships() {
    const shopCode = localStorage.getItem("shopCode");
    if (!shopCode) throw new Error("shop code not found");

    const url = `http://localhost:8080/dashboard/shop/${shopCode}/memberships/active`;
    return this.http.get<ResponseDate>(url);
  }

  getCheckIns() {
    const shopCode = localStorage.getItem("shopCode");
    if (!shopCode) throw new Error("shop code not found");

    const url = `http://localhost:8080/dashboard/shop/${shopCode}/memberships/checkIn`;
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

}
