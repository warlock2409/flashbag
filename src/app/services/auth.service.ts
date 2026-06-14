import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, delay, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AblyService } from './ably.service';
import { Auth, GoogleAuthProvider, signInWithPopup, UserCredential } from '@angular/fire/auth';
import { from, switchMap, EMPTY } from 'rxjs';
import { environment } from '../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { PhoneUpdateDialogComponent } from '../components/shared/phone-update-dialog/phone-update-dialog.component';

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

  constructor(
    private http: HttpClient,
    private router: Router,
    private ablyService: AblyService,
    private fireAuth: Auth,
    private dialog: MatDialog
  ) {
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

  googleSignIn(): Observable<any> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.fireAuth, provider)).pipe(
      switchMap((result: UserCredential) =>
        from(result.user.getIdToken()).pipe(
          map(token => ({ token, uid: result.user.uid }))
        )
      ),
      switchMap(({ token, uid }) => this.backendAuth(token, uid))
    );
  }

  backendAuth(token: string, uid: string): Observable<any> {
    const payload = { token };
    const url = `${environment.apiUrl}/user/firebase`;

    return this.http.post(url, payload).pipe(
      switchMap((response: any) => {
        if (response && response.data && response.data.phoneRequired) {
          const dialogRef = this.dialog.open(PhoneUpdateDialogComponent, {
            data: { email: response.data.email },
            disableClose: true,
            width: '450px'
          });

          return dialogRef.afterClosed().pipe(
            switchMap(result => {
              if (result) {
                return this.updatePhone({
                  ...result,
                  fireBaseIdToken: token,
                  firebaseUid: uid
                });
              }
              return EMPTY;
            })
          );
        }
        return of(response);
      }),
      tap((response: any) => {
        console.log(response);
        if (response && response.data) {
          const user = {
            ...response.data,
            token: response.data.token,
            firebaseUid: response.data.firebaseUid || uid
          };
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('firebaseUid', user.firebaseUid);
          localStorage.setItem('type', 'customer');
          this.isAuthenticated.next(true);
        }
      })
    );
  }

  updatePhone(userData: any): Observable<any> {
    const url = `${environment.apiUrl}/user/updatePhone`;
    return this.http.post(url, userData);
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
    // Determine the redirect type based on the current URL before clearing anything
    const url = this.router.url;
    const isShopPage = url.includes('/s/');
    let shopCode = '';

    if (isShopPage) {
      const parts = url.split('/');
      const sIndex = parts.indexOf('s');
      if (sIndex !== -1 && parts[sIndex + 1]) {
        shopCode = parts[sIndex + 1];
      }
    }

    // Unsubscribe from all Ably channels before logout
    const currentShopCode = this.ablyService['shopCodeSubject'].getValue() || shopCode;
    console.log(`Unsubscribe from ${currentShopCode}`);
    if (currentShopCode) {
      await this.ablyService.unsubscribe(currentShopCode);
    }
    // Close the Ably connection
    await this.ablyService.close();
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    this.isAuthenticated.next(false);
    
    // Redirect with the appropriate type
    if (isShopPage && currentShopCode) {
      this.router.navigate([`/login/s/${currentShopCode}`]);
    } else {
      this.router.navigate(['/login'], { queryParams: { type: 'business' } });
    }
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