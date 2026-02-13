import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ServiceResponse } from '../app.component';
import { Customer } from '../models/customer.model';
import { AddressModel, ShopHoursModel, ShopModel, WaitListDto } from '../models/shop.model';
import { OrganizationMembershipPlan, OrganizationServiceModel } from '../models/organization';
import { S } from 'node_modules/@angular/cdk/scrolling-module.d-ud2XrbF8';
import { Todo } from '../business/settings/components/business-setup/setup-components/membership-details/membership-actions/membership-actions.component';

@Injectable({
  providedIn: 'root'
})
export class OrganizationServiceService {































  Http = inject(HttpClient);

  constructor() {

  }

  generateContent(prompt: string, maxOutputTokens: number) {
    let data = {
      maxOutputTokens: maxOutputTokens,
      prompt: prompt
    }
    let url = "http://localhost:8080/api/llm/prompt/toGenerate";
    return this.Http.post<ServiceResponse<any>>(url, data);
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

  getTrailSessions() {
    let shopCode = localStorage.getItem("shopCode");
    let url = "http://localhost:8080/shop/{shopCode}/waitList".replace("{shopCode}", shopCode!);
    return this.Http.get<ServiceResponse<any>>(url);
  }

  updateTrailSessionStatus(waitList: WaitListDto, status: string) {
    waitList.status = status;
    let shopCode = localStorage.getItem("shopCode");
    let url = "http://localhost:8080/shop/{shopCode}/waitList".replace("{shopCode}", shopCode!);
    return this.Http.put<ServiceResponse<any>>(url, waitList);
  }

  addCustomerToOrganization(newCustomer: Customer) {
    let orgCode = localStorage.getItem("orgCode");
    let shopCode = localStorage.getItem("shopCode");
    let url = "http://localhost:8080/users/organization/{orgCode}/addCustomer/{shopCode}".replace("{orgCode}", orgCode!).replace("{shopCode}", shopCode!);
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

  toggleVisibility(shopCode: string) {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/shop/organization/{orgCode}/shop/visibility/{shopCode}".replace("{orgCode}", orgCode!).replace("{shopCode}", shopCode);
    return this.Http.get<ServiceResponse<any>>(url);
  }

  updateShop(shop: ShopModel, shopCode: string) {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/shop/organization/{orgCode}/shop/{shopCode}".replace("{orgCode}", orgCode!).replace("{shopCode}", shopCode);
    return this.Http.put<ServiceResponse<any>>(url, shop);
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

  updateOrgService(payload: OrganizationServiceModel, serviceId: number) {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/organization/{orgCode}/service/{serviceId}".replace("{orgCode}", orgCode!).replace("{serviceId}", serviceId.toString());
    return this.Http.put<ServiceResponse<any>>(url, payload);
  }

  getOrgService() {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/organization/{orgCode}/service".replace("{orgCode}", orgCode!);
    return this.Http.get<ServiceResponse<any>>(url);
  }

  getOrgServiceByIndustryId(industryId: any) {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/organization/{orgCode}/service/industry/{industryId}".replace("{orgCode}", orgCode!).replace("{industryId}", industryId!);
    return this.Http.get<ServiceResponse<any>>(url);
  }

  getOrgShopsByActiveService(selectedServices: any[]) {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/organization/{orgCode}/shops/activeService".replace("{orgCode}", orgCode!);
    if (selectedServices.length > 0) {
      url = url + "?serviceKeys=" + selectedServices.toString();
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

  updateOrgMembership(membershipPlan: OrganizationMembershipPlan, membershipId: number | undefined) {

    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/organization/{orgCode}/membership/{membershipId}".replace("{orgCode}", orgCode!).replace("{membershipId}", membershipId?.toString()!);
    return this.Http.put<ServiceResponse<any>>(url, membershipPlan);
  }

  createTodos(todos: Todo[], refId: number, totoType: string) {
    let url = "http://localhost:8080/api/todos/{type}/{refId}".replace("{type}", totoType).replace("{refId}", refId.toString());
    return this.Http.post<ServiceResponse<any>>(url, todos);
  }

  getTodos(refId: number, totoType: string) {
    let url = "http://localhost:8080/api/todos/{type}/{refId}".replace("{type}", totoType).replace("{refId}", refId.toString());
    return this.Http.get<ServiceResponse<any>>(url);
  }

  getAllOrgMembership() {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/organization/{orgCode}/membership".replace("{orgCode}", orgCode!);
    return this.Http.get<ServiceResponse<any>>(url);
  }

  getAllCustomerByOrg(page: number = 0, size: number = 10, search?: string, memStatus?: boolean) {
    const orgCode = localStorage.getItem("orgCode");
    let url = `http://localhost:8080/users/organization/${orgCode}/customers?page=${page}&size=${size}`;
    if (search) {
      url += `&query=${encodeURIComponent(search)}`;
    }
    if (memStatus !== undefined) {
      url += `&memStatus=${memStatus}`;
    }
    return this.Http.get<ServiceResponse<any>>(url);
  }

  getCustomerByOrgAndShopAndId(customerId: number) {
    const orgCode = localStorage.getItem("orgCode");
    const shopCode = localStorage.getItem("shopCode");
    let url = `http://localhost:8080/users/organization/${orgCode}/shop/${shopCode}/customer/${customerId}`;
    return this.Http.get<ServiceResponse<any>>(url);
  }

  // Gym 
  createExercise(exercise: any) {
    let orgCode = localStorage.getItem("orgCode");
    let url = "http://localhost:8080/api/exercise-activities/organization/{orgCode}".replace("{orgCode}", orgCode!);
    return this.Http.post<ServiceResponse<any>>(url, exercise);
  }

  updateExercise(exercise: any, id: any) {
    let url = "http://localhost:8080/api/exercise-activities/{id}".replace("{id}", id!);
    return this.Http.put<ServiceResponse<any>>(url, exercise);
  }

  deleteExercise(id: any) {
    let url = "http://localhost:8080/api/exercise-activities/{id}".replace("{id}", id!);
    return this.Http.delete<ServiceResponse<any>>(url);
  }

  getExercise(
    category?: string,
    name?: string,
    mode?: string,
    page?: number,
    size?: number
  ) {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) throw new Error("User not found in localStorage");

    const user = JSON.parse(userJson);
    const orgId = user.organizationDto?.[0]?.id;
    if (!orgId) throw new Error("Organization ID not found");

    let url = `http://localhost:8080/api/exercise-activities/organization/${orgId}`;

    const params: any = {};

    if (category) params.category = category;
    if (mode) params.mode = mode;
    if (name) params.name = name;
    if (page != null) params.page = page;
    if (size != null) params.size = size;

    return this.Http.get<ServiceResponse<any>>(url, { params });
  }

  getAdvertisementsByShop(page: number, size: number, expired?: boolean) {
    const shopCode = localStorage.getItem("shopCode");
    let url = `http://localhost:8080/api/advertisements/shop/${shopCode}`;
    let params: any = {
      page: page,
      size: size
    };
    if (expired !== undefined) {
      params.expired = expired;
    }
    return this.Http.get<ServiceResponse<any>>(url, { params });
  }

  createAdvertisement(advertisement: any) {
    const shopCode = localStorage.getItem("shopCode");
    let url = `http://localhost:8080/api/advertisements/shop/${shopCode}`;
    return this.Http.post<ServiceResponse<any>>(url, advertisement);
  }

  updateAdvertisement(id: number, advertisement: any) {
    let url = `http://localhost:8080/api/advertisements/${id}`;
    return this.Http.put<ServiceResponse<any>>(url, advertisement);
  }

  getCustomerProgress(customerId: number) {
    const shopCode = localStorage.getItem("shopCode");
    let url = `http://localhost:8080/api/membership/shop/${shopCode}/customer/${customerId}/progress`;
    return this.Http.get<ServiceResponse<any>>(url);
  }

}
