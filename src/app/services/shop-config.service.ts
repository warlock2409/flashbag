import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ShopConfigurationResponse } from '../models/shop-config.model';

@Injectable({
  providedIn: 'root'
})
export class ShopConfigService {
  private http = inject(HttpClient);

  constructor() { }

  getShopConfigurations(shopCode: string) {
    const url = `http://localhost:8080/shop/${shopCode}/configurations`;
    return this.http.get<ShopConfigurationResponse>(url);
  }
}