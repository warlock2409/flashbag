declare var google:any;
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { BusinessRequestDialogComponent } from '../business-request-dialog/business-request-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatCheckboxModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  error = '';
  loginType: 'customer' | 'business' = 'customer';
  shopCode: string | null = null;
  shopName: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.shopCode = params['shopCode'];
    });

    this.route.queryParams.subscribe(params => {
      this.loginType = params['type'] || 'customer';
      this.shopName = params['shop'];
    });

    if (this.authService.isLoggedIn()) {
      this.redirectBasedOnRole();
    }
  }

  continueWithGoogle() {
    this.loading = true;
    this.error = '';

    Swal.fire({
      title: 'Processing...',
      text: 'Please wait while we sign you in',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.authService.googleSignIn().subscribe({
      next: () => {
        Swal.close();
        this.redirectBasedOnRole();
      },
      error: (err) => {
        Swal.close();
        this.error = err.message || 'Google login failed';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(
      this.loginForm.get('email')?.value.toLowerCase(),
      this.loginForm.get('password')?.value,
      this.loginType
    ).subscribe({
      next: () => {
        this.redirectBasedOnRole();
      },
      error: error => {
        this.error = error.error || 'Login failed';
        this.loading = false;
      }
    });
  }

  private redirectBasedOnRole() {
    if (this.shopCode) {
      this.router.navigate(['/s', this.shopCode]);
      return;
    }

    if (this.authService.isBusiness()) {
      this.router.navigate(['/business/pick-organization']);
    } else {
      this.router.navigate(['/']);
    }
  }

  openBusinessRequest() {
    this.router.navigate(['/onboarding']);
  }

  
} 