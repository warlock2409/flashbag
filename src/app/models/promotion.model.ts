export interface PromotionOffer {
  id?: number | string;
  name: string;
  description: string;
  giftCostPaise: number;
  discountAmountPaise: number;
  minimumPurchasePaise: number;
  maximumRedemptions: number;
  newCustomersOnly: boolean;
  startDate: string; // ISO 8601 string
  endDate: string;   // ISO 8601 string
  active?: boolean;
  status?: string;
  currentRedemptions?: number;
  shopCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromotionOfferFormValue {
  name: string;
  description: string;
  giftCostRupees: number;
  discountAmountRupees: number;
  minimumPurchaseRupees: number;
  maximumRedemptions: number;
  newCustomersOnly: boolean;
  startDate: string | Date;
  endDate: string | Date;
}

export interface CommissionPolicy {
  id?: number | string;
  shopCode: string;
  industrySegmentId?: number | string;
  industrySegmentName?: string;
  commissionType: string; // e.g. "PERCENTAGE"
  commissionValue: number;
  effectiveFrom: string;
  effectiveTo: string;
  description?: string;
  businessModelType?: string | null;
}

