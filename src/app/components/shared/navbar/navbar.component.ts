import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { filter } from 'rxjs/operators';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../services/auth.service';
import { DOCUMENT } from '@angular/common';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OrderPanelService } from '../../../services/order-panel.service';
import { Injectable } from '@angular/core';
import { ProfilePanelService } from '../../../services/profile-panel.service';
import { SettingsPanelService } from '../../../services/settings-panel.service';

@Injectable()
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SearchBarComponent,
    MatIconModule,
    MatMenuModule,
    MatButtonModule
  ],
  template: `
    <nav class="navbar">
      <div class="logo">Flashbag</div>
      <div class="nav-right">
        <ng-container *ngIf="!authService.isLoggedIn()">
          <button class="btn-login customer" routerLink="/login" [queryParams]="{type: 'customer'}">
            Customer Login
          </button>
          <button class="btn-login business" routerLink="/login" [queryParams]="{type: 'business'}">
            Business Login
          </button>
        </ng-container>
        <button *ngIf="authService.isLoggedIn()" 
                class="nav-icon-btn"
                (click)="openOrders()">
          <mat-icon>receipt_long</mat-icon>
        </button>
        <div class="avatar-container" *ngIf="authService.isLoggedIn()">
          <button class="avatar-btn" [matMenuTriggerFor]="menu">
            <div class="avatar-circle">
              {{ getUserInitial() }}
            </div>
          </button>
          <mat-menu #menu="matMenu" class="admin-menu">
            <div class="menu-header">
              <div class="avatar-circle menu-avatar">
                {{ getUserInitial() }}
              </div>
              <div class="user-info">
                <span class="name">{{ getUserEmail() }}</span>
                <span class="email">{{ getUserEmail() }}</span>
              </div>
            </div>
            <div class="menu-items">
              <button mat-menu-item (click)="openOrders()">
                <mat-icon>receipt_long</mat-icon>
                <span>Orders</span>
              </button>
              <button mat-menu-item (click)="openProfile()">
                <mat-icon>account_circle</mat-icon>
                <span>Profile</span>
              </button>
              <button mat-menu-item (click)="openSettings()">
                <mat-icon>settings</mat-icon>
                <span>Settings</span>
              </button>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </div>
          </mat-menu>
        </div>
        <button class="theme-toggle" (click)="toggleTheme()">
          <i class="icon-{{ isDarkTheme ? 'sun' : 'moon' }}"></i>
        </button>
      </div>
    </nav>
  `,
  styles: [`

    .btn-login {
        padding: 0.5rem 1.5rem;
        border: 2px solid #000;
        border-radius: 25px;
        background: transparent;
        color: #000;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;

        &:hover {
          background: #000;
          color: white;
        }

        &.business {
          background: #000;
          color: white;

          &:hover {
            background: transparent;
            color: #000;
          }
        }
    }
  
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 24px;
      background: #ffffff;
      border-bottom: 1px solid #eee;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      gap: 24px;

      .logo {
        min-width: 120px;
        font-size: 24px;
        font-weight: 600;
        text-decoration: none;
        color: #000;
      }

      .nav-right {
        min-width: 220px;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        align-items: center;
      }
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 8px 16px;
        flex-wrap: wrap;
        
        .nav-right {
          min-width: auto;
          gap: 8px;
          
          .btn-login {
            padding: 8px 12px;
            font-size: 12px;
          }
        }
      }
    }

    .theme-toggle {
      padding: 8px;
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--text);
      
      &:hover {
        color: var(--primary);
      }
    }

    .nav-icon-btn {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: rgba(0,0,0,0.05);
        color: #333;
      }

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .avatar-container {
      position: relative;
    }

    .avatar-btn {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
    }

    .avatar-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #8884d8;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 500;
      transition: all 0.2s;

      &:hover {
        background: #6c63c7;
      }
    }

    .menu-avatar {
      width: 48px;
      height: 48px;
      font-size: 20px;
    }

    ::ng-deep .admin-menu {
      .mat-mdc-menu-content {
        padding: 0;
      }

      .menu-header {
        padding: 16px;
        border-bottom: 1px solid #eee;
        display: flex;
        align-items: center;
        gap: 12px;
        background: #f8f8f8;
        min-width: 200px;

        .menu-avatar {
          width: 48px;
          height: 48px;
          font-size: 20px;
        }

        .user-info {
          display: flex;
          flex-direction: column;

          .name {
            font-weight: 500;
            color: #333;
          }

          .email {
            font-size: 14px;
            color: #666;
          }
        }
      }

      .menu-items {
        padding: 8px 0;

        .mat-mdc-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: #333;

          mat-icon {
            margin: 0;
            color: #666;
          }

          &:hover {
            background: #f5f5f5;
          }
        }
      }
    }
  `]
})
export class NavbarComponent {
  isLandingPage = false;
  isLoginPage = false;
  isDarkTheme = false;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    public authService: AuthService,
    @Inject(DOCUMENT) private document: Document,
    private orderPanelService: OrderPanelService,
    private profilePanelService: ProfilePanelService,
    private settingsPanelService: SettingsPanelService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isLandingPage = event.url === '/';
      this.isLoginPage = event.url.includes('/login');
    });

    this.themeService.isDarkTheme$.subscribe(
      isDark => this.isDarkTheme = isDark
    );
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  getUserInitial(): string {
    const email = this.authService.currentUserValue?.email;
    return email ? email.charAt(0).toUpperCase() : 'U';
  }

  getUserEmail(): string {
    return this.authService.currentUserValue?.email || 'User';
  }

  openOrders() {
    console.log('Opening orders panel');
    this.orderPanelService.openPanel();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  openProfile() {
    this.profilePanelService.openPanel();
  }

  openSettings() {
    this.settingsPanelService.openPanel();
  }
} 