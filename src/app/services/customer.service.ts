import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ServiceResponse } from '../app.component';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {


  Http = inject(HttpClient);
  constructor() { }

  getCustomer(customerID: number) {
    let url = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX{id}".replace('{id}', customerID.toString());
  }


  searchCustomer(searchQuery: string) {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/api/search/customer/organization/{orgCode}?searchText={searchQuery}".replace("{orgCode}", orgCode!).replace("{searchQuery}",searchQuery);
    return this.Http.get<ServiceResponse<any>>(url);
  }


}
