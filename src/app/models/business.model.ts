export interface BusinessModel {
    id: number;
    name: string;
    description: string;
    configurations: any[]; // You can replace 'any' with a proper type if you know the shape
    active: boolean;
    industryDtoList?: Industry[];
}

export interface IndustryType {
    id:number,
    name: string;
    description: string | null;
}

export interface Industry {
    id:number,
    name: string;
    description: string | null;
    industryTypeDtoList: IndustryType[];
}

export interface Plan {
    id: number;
    name: string;
    basePrice: number;
    description: string;
    months:number;
    discount:number;
    deleted: boolean;
    planBusinessModelConfigs: PlanBusinessModelConfig[];
    planFeatureDtos:any[];
}

export interface PlanBusinessModelConfig {
    id: number;
    businessModel: string; // or BusinessModelType enum if you have it defined
    checkInLimit: number | null;
    productLimit: number | null;
    rentalItemLimit: number | null;
    includedUtilityMessages: number | null;
    includedMarketingMessages: number | null;
}


export interface PlanAddOn {
    id: number;
    planId: number;
    type: string;
    unit: string;
    pricePerUnit: number;
    description: string;
    active: boolean;
    canHaveMultiple: boolean;
    icon: string;
    businessModel: string | null;
    selected: boolean;
}



export enum OperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  NONE = 'NONE' // untouched
}

export interface BusinessNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
  data?: any;
}