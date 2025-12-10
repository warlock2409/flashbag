import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, delay, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AblyService } from './ably.service';

export interface User {
  id: string;
  email: string;
  role: 'customer' | 'seller' | 'business';
  token?: string;
}

export interface OrganizationDTO {
  id?: number;
  name?: string;
  code?: string;
  termAccepted?: boolean;
  visitors?: number;
  email?: string;
  status?: string; // Use enum if defined in your frontend
}

export interface UserDto {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  token?: string;
  organizationDto?: OrganizationDTO[];
}

export interface StaffDTO {
  id?: number;
  staffType?: StaffType; // Define enum StaffType in frontend
  userDto?: UserDto;
  organizationDto?: OrganizationDTO;
  userId?: number;
}

export enum StaffType { OWNER, DRIVER, FRONT_DESK }


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  getToken() {
    let user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user).token : null;
  }

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  public isAuthenticated = new BehaviorSubject<boolean>(false);

  isAuthenticated$ = this.isAuthenticated.asObservable();

  constructor(private http: HttpClient, private router: Router, private ablyService: AblyService) {
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
    const loginPayload = { email, password, type };

    let url = 'http://localhost:8080/user/login'

    // Simulate API call
    return this.http.post(url, loginPayload).pipe(
      tap((response: any) => {
        this.currentUserSubject.next(response);
        localStorage.setItem('currentUser', JSON.stringify(response));
        this.isAuthenticated.next(true);
      })
    );
  }

  registerOrganization(staffDto: StaffDTO) {
    let url = 'http://localhost:8080/user/register/organization';

    return this.http.post(url, staffDto).pipe(
      tap((response: any) => {
        this.currentUserSubject.next(response.data.userDto);
        localStorage.setItem('currentUser', JSON.stringify(response.data.userDto));
      })
    );
  }

  register(email: string, password: string, identity: 'customer' | 'business'): Observable<any> {
    // Mock authentication
    const loginPayload = { email, password, identity };

    let url = 'http://localhost:8080/user/register'

    // Simulate API call
    return this.http.post(url, loginPayload).pipe(
      tap((response: any) => {
        this.currentUserSubject.next(response.data);
        localStorage.setItem('currentUser', JSON.stringify(response.data));
      })
    );
  }

  async logout(): Promise<void> {
    // Unsubscribe from all Ably channels before logout
    const currentShopCode = this.ablyService['shopCodeSubject'].getValue();
    console.log(`Unsubscribe from ${currentShopCode}`);
    if (currentShopCode) {
      await this.ablyService.unsubscribe(currentShopCode);
    }
    // Close the Ably connection
    await this.ablyService.close();
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    this.isAuthenticated.next(false);
    this.router.navigate(['/login'], { queryParams: { type: 'business' } });
    localStorage.clear();
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
    return this.currentUserValue?.role != 'business';
  }

  getCurrentUser(): User | null {
    return this.currentUserValue;
  }
} 