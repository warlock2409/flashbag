export interface ShopConfiguration {
  id: number;
  type: string;
  valueType: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN';
  defaultValue: string;
  description: string;
  symbol: string | null;
  value: any;
  enable: boolean;
}

export interface ShopConfigurationResponse {
  message: string;
  status: number;
  data: ShopConfiguration[];
}