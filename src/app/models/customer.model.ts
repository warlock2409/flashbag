export interface Customer {
    id?: number;
    userId?: number;
    existingCustomerId?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    contactNumber?: string;
    introduced?: boolean;
    active?: boolean;
    phone?: string;
    membershipName?: string;
    membershipExpiry?: string | Date;
    documentId?: number;
    documentDto?: any;
}