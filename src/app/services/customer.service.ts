import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  
  http = inject(HttpClient);
  constructor() { }

  getCustomer(customerID: number) {
    let url = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX{id}".replace('{id}',customerID.toString());
  }
}
