import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ServiceResponse } from '../app.component';
import { Customer } from '../models/customer.model';
import { AddressModel, ShopHoursModel, ShopModel } from '../models/shop.model';
import { OrganizationMembershipPlan, OrganizationServiceModel } from '../models/organization';

@Injectable({
  providedIn: 'root'
})
export class OrganizationServiceService {
 
 
  















  Http = inject(HttpClient);

  constructor() {
    
  }

  getBusinessModel(key: string) {
    let url = "http://localhost:8080/organization/{key}".replace("{key}", key);
    return this.Http.get<ServiceResponse<any>>(url);
  }

  getLocations() {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/shop/organization/{orgCode}/shops".replace("{orgCode}", orgCode!);
    return this.Http.get<ServiceResponse<any>>(url);
  }


  addCustomerToOrganization(newCustomer: Customer) {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/users/organization/{orgCode}/addCustomer".replace("{orgCode}", orgCode!);
    return this.Http.post<ServiceResponse<any>>(url, newCustomer);
  }

  uploadCustomes(currentBatch: any[]) {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/users/organization/{orgCode}/addCustomers".replace("{orgCode}", orgCode!);
    return this.Http.post<ServiceResponse<any>>(url, currentBatch);
  }


  getCustomerCountByOrg() {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/users/organization/{orgCode}/customers/count".replace("{orgCode}", orgCode!);
    return this.Http.get<ServiceResponse<any>>(url);
  }

  getOrganizationDetails() {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/organization/{orgCode}/details".replace("{orgCode}", orgCode!);
    return this.Http.get<ServiceResponse<any>>(url);
  }

  getActiveBusinessModels() {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/organization/{orgCode}/business-models".replace("{orgCode}", orgCode!);
    return this.Http.get<ServiceResponse<any>>(url);
  }

  getOrgIndustryByShop() {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/organization/{orgCode}/industry".replace("{orgCode}", orgCode!);
    return this.Http.get<ServiceResponse<any>>(url);
  }

  getOrgShopsByIndustry(industryId: number) {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/organization/{orgCode}/industry/{industryId}/shops".replace("{orgCode}", orgCode!).replace("{industryId}", industryId.toString());
    return this.Http.get<ServiceResponse<any>>(url);
  }

  addNewShop(shop: ShopModel) {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/shop/organization/{orgCode}".replace("{orgCode}", orgCode!);
    return this.Http.post<ServiceResponse<any>>(url, shop);
  }

  addShopAddress(addressDto: AddressModel, code: string) {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/shop/organization/{orgCode}/shop/{shopCode}/address".replace("{orgCode}", orgCode!).replace("{shopCode}", code);
    return this.Http.put<ServiceResponse<any>>(url, addressDto);
  }

  addBusinessHours(requestBody: ShopHoursModel[], code: string | undefined) {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/shop/organization/{orgCode}/shop/{shopCode}/shop/hours".replace("{orgCode}", orgCode!).replace("{shopCode}", code!);
    return this.Http.post<ServiceResponse<any>>(url, requestBody);
  }

  addShopTax(requestBody: any, code: string | undefined) {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/shop/organization/{orgCode}/shop/{shopCode}/tax".replace("{orgCode}", orgCode!).replace("{shopCode}", code!);
    return this.Http.post<ServiceResponse<any>>(url, requestBody);
  }

  createOrgService(requestBody: OrganizationServiceModel) {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/organization/{orgCode}/service".replace("{orgCode}", orgCode!);
    return this.Http.post<ServiceResponse<any>>(url, requestBody);
  }

  getOrgService() {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/organization/{orgCode}/service".replace("{orgCode}", orgCode!);
    return this.Http.get<ServiceResponse<any>>(url);
  }

  getOrgShopsByActiveService(selectedServices: any[]) {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/organization/{orgCode}/shops/activeService".replace("{orgCode}", orgCode!);
    if(selectedServices.length > 0){
      url = url + "?serviceIds=" + selectedServices.toString();
    }
    return this.Http.get<ServiceResponse<any>>(url);
  }

  deleteService(serviceKey: string) {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/organization/{orgCode}/service/{serviceKey}".replace("{orgCode}", orgCode!).replace("{serviceKey}", serviceKey!);
    return this.Http.delete<ServiceResponse<any>>(url);
  }


  createOrgMembership(membershipPlan: OrganizationMembershipPlan) {
      let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/organization/{orgCode}/membership".replace("{orgCode}", orgCode!);
    return this.Http.post<ServiceResponse<any>>(url, membershipPlan);
  }

   getAllOrgMembership() {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/organization/{orgCode}/membership".replace("{orgCode}", orgCode!);
    return this.Http.get<ServiceResponse<any>>(url);
  }

   getAllCustomerByOrg() {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/users/organization/{orgCode}/customers".replace("{orgCode}", orgCode!);
    return this.Http.get<ServiceResponse<any>>(url);
  }
  
}
