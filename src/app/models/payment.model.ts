import { UserDto } from "../services/auth.service";
import { Customer } from "./customer.model";

export interface InvoiceModel {
    id?: number,
    customerId: number;
    customer?: Customer
    discount: number;
    items: ItemModel[];
    invoiceNumber?: string,
    status?: string,
    grandTotal?: number,
    invoiceDate?: string,
    payments?: any[],
    customerRewardDto?: any // Add this
}

export interface ItemModel {
    itemName: string;
    itemType: 'MEMBERSHIPS' | 'SERVICES' | 'PRODUCT' | 'BOOSTER' | string; // restrict if you know all possible types
    itemId: number;
    quantity: number;
    startDate?: number;
    batchId?: number;
    price?: number; // added for completeness if needed
    taxRate?: number;
    customerRewardDto?: any; // Add this
    groupKey?: string; // Links related items like MEMBERSHIPS and BOOSTER
}


export interface PaymentModel {
    paymentMode: string;
    grandTotal: number;
    paidAmount?: number;
}

export interface PaymentResponse {
    id: number;
    invoiceId: number;
    status: 'COMPLETED' | 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED' | string;
    paidAmount?: number;
    amount?: number;
    paymentMode?: 'CASH' | 'CARD' | 'UPI' | 'WALLET' | 'GIFT_WALLET' | 'NET_BANKING' | string;
    method?: string;
    paymentDate?: string;
    transactionId?: string;
}
