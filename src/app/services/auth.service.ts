import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, delay, tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  role: 'customer' | 'seller' | 'business';
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  public isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticated.asObservable();

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();

    // Check localStorage for existing session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  login(email: string, password: string, type: 'customer' | 'business'): Observable<any> {
    // Mock authentication
    const mockUser: User = {
      id: '1',
      email: email,
      role: type
    };

    // Simulate API call
    return of(mockUser).pipe(
      delay(1000), // Simulate network delay
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.isAuthenticated.next(true);
      })
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
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

  isBusiness(): boolean {
    return this.currentUserValue?.role === 'business';
  }

  getCurrentUser(): User | null {
    return this.currentUserValue;
  }
} 