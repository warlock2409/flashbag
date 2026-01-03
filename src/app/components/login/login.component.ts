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
    google.accounts.id.initialize({
      client_id: "196972985831-fma8p5mvuhhrl3tkrhpborng0094f48o.apps.googleusercontent.com",
      callback: (resp:any)=>{

      }
    });

    google.accounts.id.renderButton(
      document.getElementById("buttonDiv"),
      { theme: "outline", size: "large" }  // customization attributes
    );

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