import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { SidePanelComponent } from '../side-panel/side-panel.component';
import { ProfilePanelService } from '../../../services/profile-panel.service';

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isActive: boolean;
}

@Component({
  selector: 'app-profile-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatRadioModule, FormsModule, SidePanelComponent],
  template: `
    <app-side-panel [isOpen]="isOpen" [title]="'Profile'" (closePanel)="close()">
      <div class="profile-content">
        <div class="profile-header">
          <div class="avatar-circle large">
            {{ getUserInitial() }}
          </div>
        </div>

        <div class="profile-section">
          <h3>Personal Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Email</span>
              <span class="value">{{ getUserEmail() }}</span>
            </div>
            <div class="info-item">
              <span class="label">Member Since</span>
              <span class="value">March 2024</span>
            </div>
            <!-- Add more profile information -->
          </div>
        </div>

        <!-- Address Section -->
        <div class="profile-section">
          <div class="section-header">
            <button class="add-btn" (click)="showAddAddress = true">
              <mat-icon>add</mat-icon>
              Add Address
            </button>
          </div>

          <div class="address-list" *ngIf="!showAddAddress">
            <div class="address-card" *ngFor="let address of addresses">
              <div class="address-content">
                <div class="address-type">
                  <mat-icon>{{ getAddressIcon(address.type) }}</mat-icon>
                  <span>{{ address.type | titlecase }}</span>
                </div>
                <div class="address-details">
                  <p>{{ address.line1 }}</p>
                  <p *ngIf="address.line2">{{ address.line2 }}</p>
                  <p>{{ address.city }}, {{ address.state }} - {{ address.pincode }}</p>
                </div>
              </div>
              <div class="address-actions">
                <mat-radio-button
                  [checked]="address.isActive"
                  (change)="setActiveAddress(address.id)">
                  Make Default
                </mat-radio-button>
                <button class="icon-btn" (click)="editAddress(address)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button class="icon-btn" (click)="deleteAddress(address.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Add/Edit Address Form -->
          <div class="address-form" *ngIf="showAddAddress">
            <div class="form-header">
              <h4>{{ editingAddress ? 'Edit' : 'Add New' }} Address</h4>
              <button class="icon-btn" (click)="cancelAddressEdit()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <div class="form-content">
              <div class="form-group">
                <label>Type</label>
                <select [(ngModel)]="newAddress.type">
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>Address Line 1</label>
                <input type="text" [(ngModel)]="newAddress.line1">
              </div>
              <div class="form-group">
                <label>Address Line 2 (Optional)</label>
                <input type="text" [(ngModel)]="newAddress.line2">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>City</label>
                  <input type="text" [(ngModel)]="newAddress.city">
                </div>
                <div class="form-group">
                  <label>State</label>
                  <input type="text" [(ngModel)]="newAddress.state">
                </div>
              </div>
              <div class="form-group">
                <label>Pincode</label>
                <input type="text" [(ngModel)]="newAddress.pincode">
              </div>
              <div class="form-actions">
                <button class="btn-cancel" (click)="cancelAddressEdit()">Cancel</button>
                <button class="btn-save" (click)="saveAddress()">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-side-panel>
  `,
  styles: [`
    .profile-content {
      padding: 6px;
    }

    .profile-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;

      .avatar-circle.large {
        width: 96px;
        height: 96px;
        font-size: 36px;
        border: 1px solid;
        border-radius: 50%;
      }

      h2 {
        margin: 0;
        color: #333;
      }
    }

    .profile-section {
      h3 {
        margin: 0 0 16px;
        color: #333;
      }

      .info-grid {
        display: grid;
        gap: 16px;

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .label {
            font-size: 14px;
            color: #666;
          }

          .value {
            font-size: 16px;
            color: #333;
          }
        }
      }
    }

    .section-header {
      display: flex;
      justify-content: end;
      align-items: center;
      margin-bottom: 20px;

      .add-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 16px;
        border: none;
        border-radius: 20px;
        background: #8884d8;
        color: white;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: #6c63c7;
        }
      }
    }

    .address-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .address-card {
      padding: 16px;
      background: #f8f8f8;
      border-radius: 8px;
      border: 1px solid #eee;

      .address-content {
        margin-bottom: 12px;
      }

      .address-type {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #666;
        margin-bottom: 8px;
      }

      .address-details {
        p {
          margin: 4px 0;
          color: #333;
        }
      }

      .address-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 12px;
        border-top: 1px solid #eee;

        .icon-btn {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;

          &:hover {
            background: rgba(0,0,0,0.05);
            color: #333;
          }
        }
      }
    }

    .address-form {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      
      .form-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid #eee;
      }

      .form-content {
        padding: 16px;
      }

      .form-group {
        margin-bottom: 16px;

        label {
          display: block;
          margin-bottom: 8px;
          color: #666;
        }

        input, select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;

          &:focus {
            outline: none;
            border-color: #8884d8;
          }
        }
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 20px;

        button {
          padding: 8px 16px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-weight: 500;

          &.btn-cancel {
            background: #f5f5f5;
            color: #666;

            &:hover {
              background: #eee;
            }
          }

          &.btn-save {
            background: #8884d8;
            color: white;

            &:hover {
              background: #6c63c7;
            }
          }
        }
      }
    }
  `]
})
export class ProfilePanelComponent implements OnInit {
  isOpen = false;
  showAddAddress = false;
  editingAddress: Address | null = null;
  addresses: Address[] = [
    {
      id: '1',
      type: 'home',
      line1: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      isActive: true
    },
    {
      id: '2',
      type: 'work',
      line1: '456 Business Park',
      line2: 'Building B, Floor 5',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400051',
      isActive: false
    }
  ];

  newAddress: Partial<Address> = {
    type: 'home',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: ''
  };

  constructor(private profilePanelService: ProfilePanelService) {}

  ngOnInit() {
    this.profilePanelService.isOpen$.subscribe(
      isOpen => this.isOpen = isOpen
    );
  }

  close() {
    this.profilePanelService.closePanel();
  }

  getUserInitial(): string {
    return 'A';
  }

  getUserEmail(): string {
    return 'admin@example.com';
  }

  getAddressIcon(type: string): string {
    switch(type) {
      case 'home': return 'home';
      case 'work': return 'business';
      default: return 'location_on';
    }
  }

  setActiveAddress(id: string) {
    this.addresses = this.addresses.map(addr => ({
      ...addr,
      isActive: addr.id === id
    }));
  }

  editAddress(address: Address) {
    this.editingAddress = address;
    this.newAddress = { ...address };
    this.showAddAddress = true;
  }

  deleteAddress(id: string) {
    this.addresses = this.addresses.filter(addr => addr.id !== id);
  }

  saveAddress() {
    if (this.editingAddress) {
      this.addresses = this.addresses.map(addr => 
        addr.id === this.editingAddress?.id ? { ...addr, ...this.newAddress } : addr
      );
    } else {
      const newId = (Math.max(...this.addresses.map(a => parseInt(a.id))) + 1).toString();
      this.addresses.push({
        ...this.newAddress as Address,
        id: newId,
        isActive: false
      });
    }
    this.cancelAddressEdit();
  }

  cancelAddressEdit() {
    this.showAddAddress = false;
    this.editingAddress = null;
    this.newAddress = {
      type: 'home',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: ''
    };
  }
} 