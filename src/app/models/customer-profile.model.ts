export interface CustomerProfile {
    createdOn: string;
    id: number;
    configurationId: number;
    type: string;
    valueType: string | null;
    value: string;
    defaultValue: string | null;
    description: string;
}

export interface CustomerProfileResponse {
    message: string;
    status: number;
    data: CustomerProfile[];
}