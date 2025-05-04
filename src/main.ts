import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app/app.component';
import { routes } from './app/app-routing.module';
import { OrderPanelService } from './app/services/order-panel.service';
import { ProfilePanelService } from './app/services/profile-panel.service';
import { SettingsPanelService } from './app/services/settings-panel.service';
import { AuthInterceptor } from './app/interceptor/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, FormsModule),
    provideRouter(routes),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    provideAnimations(),
    OrderPanelService,
    ProfilePanelService,
    SettingsPanelService
  ]
}).catch(err => console.error(err));
