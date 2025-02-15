import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SidePanelComponent } from '../side-panel/side-panel.component';
import { ProfilePanelService } from '../../../services/profile-panel.service';

@Component({
  selector: 'app-profile-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule, SidePanelComponent],
  template: `
    <app-side-panel 
      [isOpen]="isOpen" 
      [title]="'Profile'"
      (closePanel)="close()">
      <div class="profile-content">
        <div class="profile-header">
          <div class="avatar-circle large">
            {{ getUserInitial() }}
          </div>
          <h2>{{ getUserEmail() }}</h2>
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
      </div>
    </app-side-panel>
  `,
  styles: [`
    .profile-content {
      padding: 24px;
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
  `]
})
export class ProfilePanelComponent implements OnInit {
  isOpen = false;

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
} 