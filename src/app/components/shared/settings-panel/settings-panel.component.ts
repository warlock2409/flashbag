import { Component, OnInit ,Injectable} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SidePanelComponent } from '../side-panel/side-panel.component';
import { SettingsPanelService } from '../../../services/settings-panel.service';

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSlideToggleModule, SidePanelComponent],
  template: `
    <app-side-panel 
      [isOpen]="isOpen" 
      [title]="'Settings'"
      (closePanel)="close()">
      <div class="settings-content">
        <div class="settings-section">
          <h3>Preferences</h3>
          <div class="settings-grid">
            <div class="setting-item">
              <div class="setting-info">
                <span class="label">Dark Mode</span>
                <span class="description">Enable dark theme</span>
              </div>
              <mat-slide-toggle></mat-slide-toggle>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="label">Notifications</span>
                <span class="description">Enable push notifications</span>
              </div>
              <mat-slide-toggle></mat-slide-toggle>
            </div>
            <!-- Add more settings -->
          </div>
        </div>
      </div>
    </app-side-panel>
  `,
  styles: [`
    .settings-content {
      padding: 24px;
    }

    .settings-section {
      h3 {
        margin: 0 0 16px;
        color: #333;
      }

      .settings-grid {
        display: grid;
        gap: 16px;

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f8f8f8;
          border-radius: 8px;

          .setting-info {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .label {
              font-size: 16px;
              color: #333;
            }

            .description {
              font-size: 14px;
              color: #666;
            }
          }
        }
      }
    }
  `]
})
export class SettingsPanelComponent implements OnInit {
  isOpen = false;

  constructor(private settingsPanelService: SettingsPanelService) {}

  ngOnInit() {
    this.settingsPanelService.isOpen$.subscribe(
      isOpen => this.isOpen = isOpen
    );
  }

  close() {
    this.settingsPanelService.closePanel();
  }
} 