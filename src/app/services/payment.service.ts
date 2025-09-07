import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ServiceResponse } from '../app.component';
import { PaymentModel } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {







  Http = inject(HttpClient);

  constructor() { }

  makePayment(payment: PaymentModel, id: number | undefined) {
    let shopCode = localStorage.getItem("shopCode");
    let url = "http://localhost:8080/api/payments/shop/{shopCode}/invoice/{invoiceId}".replace("{shopCode}", shopCode!).replace("{invoiceId}",id!.toString());
    return this.Http.post<ServiceResponse<any>>(url, payment);
  }

}
