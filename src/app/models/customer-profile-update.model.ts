export interface CustomerProfileUpdate {
    configurationId: number;
    value: string;
}

export interface CustomerProfileUpdateRequest extends Array<CustomerProfileUpdate> {}

export interface CustomerProfileUpdateResponse {
    message: string;
    status: number;
    data: any;
}