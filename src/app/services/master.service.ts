import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ResponseDate, ServiceResponse } from '../app.component';
import { CreateOrganizationPlanDto } from '../business/components/point-of-sale/point-of-sale.component';

@Injectable({
  providedIn: 'root'
})
export class MasterService {





  Http = inject(HttpClient);

  constructor() {

  }

  getOrganizations(segment: string | null) {

    let url = "http://localhost:8080/organizations";
    if (segment != null)
      url = url + "?status=" + segment;
    return this.Http.get<ServiceResponse<any>>(url);
  }

  createOrganization(payLoad: any) {
    let url = "http://localhost:8080/organization";
    return this.Http.post<ServiceResponse<any>>(url, payLoad);
  }

  updateOrganization(payLoad: { status: string; }, code: string, needUser: boolean) {
    let url = "http://localhost:8080/organization/{code}?newUser=" + needUser;
    url = url.replace('{code}', code);

    return this.Http.put<ServiceResponse<any>>(url, payLoad);
  }

  getAllBusinessModel() {
    // /business-models
    let url = "http://localhost:8080/business-models";
    return this.Http.get<ServiceResponse<any>>(url);
  }

  getPlansByOrganization() {
    let orgCode = localStorage.getItem("orgCode");
    let url = `http://localhost:8080/plan/businessModel/organization/${orgCode}`;
    return this.Http.get<ServiceResponse<any>>(url);
  }

  getPlanAddonByPlan(planId: number, modelId: number) {
    let url = `http://localhost:8080/plan/${planId}/addon/businessModel/${modelId}`;
    return this.Http.get<ServiceResponse<any>>(url);
  }


  createBusinessModel(payload: ResponseDate) {
    let url = "http://localhost:8080/business-models";
    return this.Http.post<ServiceResponse<any>>(url, payload);
  }

  addOrRemoveModel(selectedIds: any, code: any) {
    let url = "http://localhost:8080/organization/{code}/updateBusinessModels".replace('{code}', code);
    return this.Http.put<ServiceResponse<any>>(url, selectedIds);
  }

  requestPurchase(requestPurchase: CreateOrganizationPlanDto) {
    let url = "http://localhost:8080/plan/purchase/organization/{orgCode}".replace("{orgCode}", localStorage.getItem("orgCode")!);
    return this.Http.post<ServiceResponse<any>>(url, requestPurchase);
  }



  organizationBuilder(name: string, termAccepted: boolean, visitors: number, email: string) {
    return {
      "name": name,
      "termAccepted": termAccepted,
      "visitors": visitors,
      "email": email
    }
  }


}
