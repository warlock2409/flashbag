import { UserDto } from "../services/auth.service";
import { Customer } from "./customer.model";

export interface InvoiceModel {
    id?:number,
    customerId: number;
    customer?:Customer
    discount: number;
    items: ItemModel[];
    invoiceNumber?: string,
    status?: string,
    grandTotal?:number,
    invoiceDate?:string
}

export interface ItemModel {
    itemName: string;
    itemType: 'MEMBERSHIPS' | 'SERVICES' | 'PRODUCTS'; // restrict if you know all possible types
    itemId: number;
    quantity: number;
    startDate?: number
}


export interface PaymentModel {
    paymentMode:string,
    grandTotal:number
}

export interface PaymentResponse {
  id: number;
  invoiceId: number;
  status: 'COMPLETED' | 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';
  paidAmount: number;
  paymentMode: 'CASH' | 'CARD' | 'UPI' | 'WALLET' | 'NET_BANKING';
  transactionId: string;
}