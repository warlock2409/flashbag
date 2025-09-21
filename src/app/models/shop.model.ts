import { DocumentDto } from "../components/upload-media/upload-media.component";
import { BusinessModel } from "./business.model";

export interface ShopModel {
  // Response only
  id?: number;
  location?: string;
  addressDto?:AddressModel
  image?:string;
  address?:string
  status?: string;
  // Request + Response
  name: string;
  code?: string;
  contactNumber: string;
  email: string;
  primaryModel: BusinessModel;
  secondaryModels?: BusinessModel[];

  lat?: number;
  lng?: number;

  checked?:boolean;
  primaryIndustry?:any
  documentDto?:DocumentDto;
  active:null|boolean

  // UI
  shopCategory?:string
}

export interface AddressModel {
  id?: number,
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface SessionModel {
  id?: number;        // optional for new entries
  start: string;       // format: "HH:mm"
  end: string;      // format: "HH:mm"
}

export interface ShopHoursModel {
  id?: number;              // optional for new entries
  day: string;              // e.g. "Monday"
  enabled: boolean;
  sessions: SessionModel[];   // list of sessions
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Item {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  duration?: string;
  image: string;
  quantity?: number;
  startDate?: Date;  
  endDate?: Date;
  taxRate?:number;
  itemType:'MEMBERSHIPS' | 'SERVICES' | 'PRODUCTS';
}



export interface Customer {
  name: string;
  phone: string;
  email?: string;
}