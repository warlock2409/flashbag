import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { ThemeService } from './services/theme.service';
import { BookingPanelComponent } from './components/shared/booking-panel/booking-panel.component';
import { OrderPanelComponent } from './components/shared/order-panel/order-panel.component';
import { ProfilePanelComponent } from './components/shared/profile-panel/profile-panel.component';
import { SettingsPanelComponent } from './components/shared/settings-panel/settings-panel.component';
import { MatNativeDateModule } from '@angular/material/core';

declare const FB: any;

// Make a Promise to ensure SDK is loaded
let fbSdkLoaded: Promise<void>;

window.addEventListener('message', (event) => {
  if (!event.origin.endsWith('facebook.com')) return;
  try {
    const data = JSON.parse(event.data);
    if (data.type === 'WA_EMBEDDED_SIGNUP') {
      console.log('message event: ', data);
    }
  } catch {
    console.log('message event: ', event.data);
  }
});

const fbLoginCallback = (response: any) => {
  if (response.authResponse) {
    const code = response.authResponse.code;
    console.log('response: ', code);
  } else {
    console.log('response: ', response);
  }
};
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    NavbarComponent,
    BookingPanelComponent,
    OrderPanelComponent,
    ProfilePanelComponent,
    SettingsPanelComponent,
    MatNativeDateModule
  ],
  template: `
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <app-booking-panel></app-booking-panel>
    <app-order-panel></app-order-panel>
    <app-profile-panel></app-profile-panel>
    <app-settings-panel></app-settings-panel>
  `,
  styles: [`
    // .main-content {
    //   padding-top: 60px;
    // }
  `]
})
export class AppComponent implements OnInit {
  constructor(private themeService: ThemeService) { }

  ngOnInit() {
        console.log('Facebook SDK inside');

    this.themeService.setInitialTheme();

    fbSdkLoaded = new Promise((resolve) => {
      (window as any).fbAsyncInit = () => {
        FB.init({
          appId: '1296476498657396',
          autoLogAppEvents: true,
          xfbml: true,
          version: 'v19.0' // Use v19.0 or latest
        });
        console.log('Facebook SDK initialized');
        resolve(); 
      };

      const script = document.createElement('script');
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    });
  }

  async launchWhatsAppSignup() {
    await fbSdkLoaded; // Wait for the SDK to be loaded and initialized
    FB.login(fbLoginCallback, {
      config_id: '763366386067758',
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        setup: {},
        featureType: 'EXISTING_BUSINESS', // or 'NEW_BUSINESS'
        sessionInfoVersion: '3',
      }
    });
  }
}





export interface ResponseDate {
  message: string;
  status: number;
  data: any;
  totalElements?:number;
  pageSize?:number;
}

export interface ServiceResponse<T> { data: any, message: string, status: number }