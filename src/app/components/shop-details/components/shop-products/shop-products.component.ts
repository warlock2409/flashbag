import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Product {
  name: string;
  price: number;
  description?: string;
}

@Component({
  selector: 'app-shop-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-products.component.html',
  styleUrls: ['./shop-products.component.scss']
})
export class ShopProductsComponent {
  @Input() products: Product[] = [];
} 