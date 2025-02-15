import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  role: 'customer' | 'seller';
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticated.asObservable();

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  login(email: string, password: string, type: 'customer' | 'business' = 'customer'): Observable<User> {
    if (email === 'uat@suitepaws.com' && password === 'a12345678') {
      const user: User = {
        id: '1',
        email: 'admin',
        role: type === 'business' ? 'seller' : 'customer'
      };
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      this.isAuthenticated.next(true);
      return of(user);
    }
    return throwError(() => new Error('Invalid credentials'));
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticated.next(false);
  }

  isSeller(): boolean {
    return this.currentUserValue?.role === 'seller';
  }

  isCustomer(): boolean {
    return this.currentUserValue?.role === 'customer';
  }

  checkAuth(): boolean {
    return this.isAuthenticated.value;
  }
} 