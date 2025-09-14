import { Component, Inject, DOCUMENT } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { filter } from 'rxjs/operators';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../services/auth.service';

import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OrderPanelService } from '../../../services/order-panel.service';
import { Injectable } from '@angular/core';
import { ProfilePanelService } from '../../../services/profile-panel.service';
import { SettingsPanelService } from '../../../services/settings-panel.service';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';


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
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './navbar.component.html',
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
      padding: 8px 13px;
      background: transparent;
      color: white;
      // border-bottom: 2px solid #a684ff;
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
      background: linear-gradient(45deg, #8884d8, #6c63c7);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 500;
      text-transform: uppercase;
      transition: all 0.2s;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }

      &.menu-avatar {
        width: 48px;
        height: 48px;
        font-size: 20px;
      }

      .placeholder-text {
        line-height: 1;
        user-select: none;
      }
    }

    .menu-header {
      padding: 16px;
      border-bottom: 1px solid #eee;
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f8f8f8;
      min-width: 200px;

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
  `]
})
export class NavbarComponent {
  hideLoginButtons = false; // Hide in onboard route
  isLandingPage = false;
  isLoginPage = false;
  isDarkTheme = false;
  isHomePage = false;
  isBusinessRoute: boolean = false;
  hiddenRoutes = ['/onboarding'];


  constructor(
    private router: Router,
    private themeService: ThemeService,
    public authService: AuthService,
    @Inject(DOCUMENT) private document: Document,
    private orderPanelService: OrderPanelService,
    private profilePanelService: ProfilePanelService,
    private settingsPanelService: SettingsPanelService,
    private dialog: MatDialog
  ) {

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      this.isLandingPage = event.url === '/';
      this.isLoginPage = event.url.includes('/login');
      const hiddenRoutes = ['/onboarding'];
      this.hideLoginButtons = hiddenRoutes.includes(url);

      // Home page check 
      this.isHomePage = event.url.includes('/home');
    });

    this.themeService.isDarkTheme$.subscribe(
      isDark => this.isDarkTheme = isDark
    );
  }


  ngOnInit() {

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Now this.router.url reflects the current, fully updated URL
        this.isBusinessRoute = this.router.url.includes('/business');
      });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  getInitials(): string {
    const email = this.getUserEmail();
    if (!email) return 'U';

    // Split email and get first letter of each part before @
    const nameParts = email.split('@')[0].split('.');
    return nameParts.map(part => part[0].toUpperCase()).join('');
  }

  getUserName(): string {
    const email = this.getUserEmail();
    if (!email) return 'User';

    // Convert email name part to display name
    const name = email.split('@')[0].split('.');
    return name.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  }

  getUserEmail(): string {
    return this.authService.currentUserValue?.email || '';
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

  openLoginDialog() {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      width: '400px',
      data: { type: 'customer' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle successful login
        console.log('Logged in:', result);
      }
    });
  }

  navigateToHome() {
    if (this.authService.isLoggedIn()) {
      if (this.authService.isBusiness()) {
        this.router.navigate(['/business/home']);
      } else {
        this.router.navigate(['/']);
      }
    } else {
      this.router.navigate(['/']);
    }
  }

  // WABA
} 