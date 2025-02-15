import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LandingComponent } from './components/landing/landing.component';
import { HomeComponent } from './components/home/home.component';
import { ShopDetailsComponent } from './components/shop-details/shop-details.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'shop/:id', component: ShopDetailsComponent },
  // Add more routes later for marketplace and seller dashboard
];
