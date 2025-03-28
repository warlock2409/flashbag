import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { BusinessRequestDialogComponent } from '../business-request-dialog/business-request-dialog.component';

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
    this.route.queryParams.subscribe(params => {
      this.loginType = params['type'] || 'customer';
    });

    if (this.authService.isLoggedIn()) {
      this.redirectBasedOnRole();
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(
      this.loginForm.get('email')?.value,
      this.loginForm.get('password')?.value,
      this.loginType
    ).subscribe({
      next: () => {
        this.redirectBasedOnRole();
      },
      error: error => {
        this.error = error.message || 'Login failed';
        this.loading = false;
      }
    });
  }

  private redirectBasedOnRole() {
    if (this.authService.isBusiness()) {
      this.router.navigate(['/business/home']);
    } else {
      this.router.navigate(['/']);
    }
  }

  openBusinessRequest() {
    const dialogRef = this.dialog.open(BusinessRequestDialogComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle the business request submission
        console.log('Business request:', result);
        // Show success message
        this.error = ''; // Clear any existing errors
        // You might want to show a success message or redirect
      }
    });
  }
} 