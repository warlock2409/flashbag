export interface GiftCampaign {
  id?: number | string;
  name: string;
  description: string;
  rewardPercentage: number;
  minimumPurchase: number;
  maximumGift: number;
  startDate: string; // ISO string e.g. 2026-11-01T00:00:00.000Z
  endDate: string;   // ISO string e.g. 2026-11-30T23:59:59.000Z
  active?: boolean;
  status?: string;
  shopCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GiftCampaignFormValue {
  name: string;
  description: string;
  rewardPercentage: number;
  minimumPurchaseRupees: number;
  maximumGiftRupees: number;
  startDateStr: string;
  endDateStr: string;
}
