import { Component, OnInit, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { SidePanelComponent } from '../side-panel/side-panel.component';
import { OrderPanelService } from '../../../services/order-panel.service';

interface OrderTimeline {
  date: Date;
  status: string;
  icon: string;
}

interface Order {
  id: string;
  type: 'product' | 'service' | 'rental';
  title: string;
  price: number;
  timeline: OrderTimeline[];
}

@Component({
  selector: 'app-order-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatExpansionModule, SidePanelComponent],
  template: `
    <app-side-panel 
      [isOpen]="isOpen" 
      [title]="'My Orders'"
      (closePanel)="close()">
      
      <mat-accordion class="orders-accordion">
        <mat-expansion-panel *ngFor="let order of orders">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <div class="order-header">
                <span class="order-id">#{{order.id}}</span>
                <span class="order-title">{{order.title}}</span>
                <span class="order-price">₹{{order.price}}</span>
              </div>
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div class="timeline">
            <div class="timeline-item" *ngFor="let event of order.timeline">
              <div class="timeline-icon">
                <mat-icon>{{event.icon}}</mat-icon>
              </div>
              <div class="timeline-content">
                <span class="status">{{event.status}}</span>
                <span class="date">{{event.date | date:'medium'}}</span>
              </div>
            </div>
          </div>
        </mat-expansion-panel>
      </mat-accordion>
    </app-side-panel>
  `,
  styles: [`
    .orders-accordion {
      .mat-expansion-panel {
        margin-bottom: 16px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);

        .order-header {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;

          .order-id {
            color: #666;
            font-size: 14px;
          }

          .order-title {
            flex: 1;
          }

          .order-price {
            font-weight: 500;
          }
        }
      }
    }

    .timeline {
      margin-top: 20px;
      position: relative;

      &:before {
        content: '';
        position: absolute;
        left: 16px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #eee;
      }

      .timeline-item {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 16px 0;
        position: relative;

        .timeline-icon {
          width: 32px;
          height: 32px;
          background: #8884d8;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;

          mat-icon {
            color: white;
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }

        .timeline-content {
          flex: 1;
          display: flex;
          flex-direction: column;

          .status {
            font-weight: 500;
            color: #333;
          }

          .date {
            font-size: 14px;
            color: #666;
          }
        }
      }
    }
  `]
})
export class OrderPanelComponent implements OnInit {
  isOpen = false;
  orders: Order[] = [];

  constructor(private orderPanelService: OrderPanelService) {}

  ngOnInit() {
    this.orderPanelService.isOpen$.subscribe(
      isOpen => {
        console.log('Panel state changed:', isOpen);
        this.isOpen = isOpen;
      }
    );
    this.orders = this.orderPanelService.getOrders();
  }

  close() {
    this.orderPanelService.closePanel();
  }
} 