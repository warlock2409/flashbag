import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Service {
  name: string;
  duration: string;
  price: number;
  description?: string;
}

@Component({
  selector: 'app-shop-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-services.component.html',
  styleUrls: ['./shop-services.component.scss']
})
export class ShopServicesComponent {
  @Input() services: Service[] = [];
} 