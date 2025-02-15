import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { ThemeService } from './services/theme.service';
import { BookingPanelComponent } from './components/shared/booking-panel/booking-panel.component';
import { OrderPanelComponent } from './components/shared/order-panel/order-panel.component';
import { ProfilePanelComponent } from './components/shared/profile-panel/profile-panel.component';
import { SettingsPanelComponent } from './components/shared/settings-panel/settings-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule, 
    NavbarComponent, 
    BookingPanelComponent,
    OrderPanelComponent,
    ProfilePanelComponent,
    SettingsPanelComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <app-booking-panel></app-booking-panel>
    <app-order-panel></app-order-panel>
    <app-profile-panel></app-profile-panel>
    <app-settings-panel></app-settings-panel>
  `,
  styles: [`
    .main-content {
      padding-top: 64px; // Height of navbar
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.setInitialTheme();
  }
}
