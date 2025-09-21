import { BusinessModel } from "./business.model";

export interface OrganizationModel {
  id: number;
  name: string;
  code: string;
  termAccepted: boolean;
  visitors: number;
  country: string;
  currency: string;
  status: string;
  businessModels: BusinessModel[];
  organizationPlan: OrganizationPlan;
}

export interface OrganizationPlan {
  planName: string;
  startDate: string; // or Date
  endDate: string;   // or Date
  subscribedPrice: number;
  branchLimit: number;
  memberLimit: number;
  staffLimit: number;
  checkInLimit: number;
  productLimit: number;
  utilityMessageLimit: number;
  marketingMessageLimit: number;
  productsUsed: number;
  addOns: AddOn[];
  paymentStatus: string;
}

export interface AddOn {
  id: number;
  addonName?: string | null;
  type: 'DATA_STORAGE' | 'IMAGE' | 'VIDEOS' | 'ADDITIONAL_STAFF' | string;
  value: number;
  price: number;
  purchaseDate: string; // or Date
  expiryDate: string;   // or Date
  expired: boolean;
}


export interface Industry{
  id:number;
  name:string
}

export interface IndustrySegment{
  id:number;
  name:string;
}

export interface OrganizationServiceModel {
  id?: number;                // optional (for updates)
  serviceKey?:string;
  name: string;               // service name
  description: string;        // service description
  isAddon: boolean;           // whether this service is an addon
  deleted: boolean;           // soft delete flag
  defaultPrice: number;       // base price
  defaultDuration: number;    // duration in minutes
  priceType: 'FREE' | 'FROM' | 'FIXED';  // enum-like string
  serviceType: 'BOOKABLE' | 'FACILITY' | 'VIRTUAL';  // enum-like string
  organizationId?: number;     // FK to organization
  industrySegment?: Pick<IndustrySegment, "id"> & Partial<IndustrySegment>;  // FK to industry segment
  shopIds: number[];          // list of shop IDs mapped to service
  checked?:boolean;
}

export interface OrganizationMembershipPlan {
  id?: number;      
  name: string;
  basePrice: number;
  description: string;
  challengeBased: boolean;
  industryId: number;
  benefits: MembershipBenefit[];
  shopIds: number[];

  industry?:string;
}

export interface MembershipBenefit {
  benefitType: string; // add more if needed
  serviceKey: string;
  days?: number;             // only if benefitType = DURATION_ACCESS
  discountPercent?: number;  // only if benefitType = DISCOUNT

  accessDurationInDays?:number
  id?:number
}