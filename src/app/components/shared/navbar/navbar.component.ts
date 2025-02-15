import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { filter } from 'rxjs/operators';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../services/auth.service';
import { DOCUMENT } from '@angular/common';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SearchBarComponent, MatIconModule, MatMenuModule],
  template: `
    <nav class="navbar">
      <div class="nav-left">
        <a class="logo" routerLink="/">Flashbag</a>
      </div>
      <div class="nav-search" *ngIf="!isLandingPage && !isLoginPage">
        <app-search-bar [isNavbar]="true" [category]="'services'"></app-search-bar>
      </div>
      <div class="nav-right">
        <ng-container *ngIf="!authService.isLoggedIn()">
          <button class="btn-login customer" routerLink="/login" [queryParams]="{type: 'customer'}">
            Customer Login
          </button>
          <button class="btn-login business" routerLink="/login" [queryParams]="{type: 'business'}">
            Business Login
          </button>
        </ng-container>
        <div class="avatar-container" *ngIf="authService.isLoggedIn()">
          <button class="avatar-btn" [matMenuTriggerFor]="menu">
            <div class="avatar">
              {{ (authService.currentUserValue?.email ?? 'U').charAt(0).toUpperCase() }}
            </div>
          </button>
          <mat-menu #menu="matMenu" class="avatar-menu">
            <button mat-menu-item (click)="openCart()">
              <mat-icon>shopping_cart</mat-icon>
              <span>Cart</span>
            </button>
            <button mat-menu-item routerLink="/account">
              <mat-icon>settings</mat-icon>
              <span>Account Settings</span>
            </button>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>
        <button class="theme-toggle" (click)="toggleTheme()">
          <i class="icon-{{ isDarkTheme ? 'sun' : 'moon' }}"></i>
        </button>
      </div>
    </nav>
  `,
  styles: [`
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

      .nav-left {
        min-width: 120px;
        .logo {
          font-size: 24px;
          font-weight: 600;
          text-decoration: none;
          color: #000;
        }
      }

      .nav-search {
        flex: 1;
        max-width: 800px;
        ::ng-deep .search-container {
          padding: 0;
          margin: 0;
        }
      }

      .nav-right {
        min-width: 220px;
        display: flex;
        gap: 12px;
        justify-content: flex-end;

        .btn-login {
          padding: 8px 16px;
          border-radius: 4px;
          border: 1px solid #ddd;
          background: white;
          font-size: 14px;
          cursor: pointer;

          &.business {
            background: #000;
            color: white;
            border: none;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 8px 16px;
        flex-wrap: wrap;
        
        .nav-search {
          order: 3;
          width: 100%;
          max-width: none;
        }

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

    ::ng-deep .avatar-menu {
      .mat-mdc-menu-item {
        display: flex;
        align-items: center;
        gap: 8px;

        mat-icon {
          margin-right: 8px;
          color: #666;
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
    @Inject(DOCUMENT) private document: Document
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

  logout() {
    this.authService.logout();
  }

  openCart() {
    const cartSidebar = this.document.querySelector('app-cart-sidebar');
    if (cartSidebar) {
      (cartSidebar as any).open();
    }
  }
} 