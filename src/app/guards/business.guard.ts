import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class BusinessGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(): boolean {
    return this.checkAccess();
  }

  canActivateChild(): boolean {
    return this.checkAccess();
  }

  private checkAccess(): boolean {
    console.log('BusinessGuard triggered');
    console.log(this.authService.isLoggedIn(), "isLoggedIn", this.authService.isBusiness());

    if (this.authService.isLoggedIn() && this.authService.isBusiness()) {
      return true;
    }

    this.router.navigate(['/login'], { queryParams: { type: 'business' } });
    return false;
  }
} 