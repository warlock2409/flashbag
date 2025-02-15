import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Rental {
  name: string;
  price: number;
  duration: string;
  description?: string;
}

@Component({
  selector: 'app-shop-rentals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-rentals.component.html',
  styleUrls: ['./shop-rentals.component.scss']
})
export class ShopRentalsComponent {
  @Input() rentals: Rental[] = [];
} 