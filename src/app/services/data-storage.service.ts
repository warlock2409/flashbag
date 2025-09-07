import { Injectable } from '@angular/core';
import { Industry } from '../models/business.model';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {

  constructor() { }

  industries:Industry[]=[];

  setIndustry(industries:Industry[]){
    this.industries = industries
  }

  getIndustry(){
    return this.industries;
  }
  
}
