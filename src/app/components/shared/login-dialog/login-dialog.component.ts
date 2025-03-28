import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule
  ],
  template: `
    <div class="login-dialog">
      <h2>{{isLogin ? 'Login to Continue' : 'Create Account'}}</h2>
      <form (ngSubmit)="onSubmit()">
        <div class="form-group" *ngIf="!isLogin">
          <label>Username</label>
          <input type="text" [(ngModel)]="username" name="username" required>
        </div>

        <div class="form-group">
          <label>Email</label>
          <input type="email" [(ngModel)]="email" name="email" required>
        </div>

        <div class="form-group">
          <label>Password</label>
          <input type="password" [(ngModel)]="password" name="password" required>
        </div>

        <div class="actions">
          <button type="button" class="btn-cancel" (click)="onCancel()">Cancel</button>
          <button type="submit" class="btn-login">{{isLogin ? 'Login' : 'Sign Up'}}</button>
        </div>
      </form>

      <div class="switch-form">
        <p>
          {{isLogin ? "Don't have an account?" : "Already have an account?"}}
          <button class="switch-btn" (click)="toggleForm()">
            {{isLogin ? 'Create here' : 'Login here'}}
          </button>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-dialog {
      padding: 24px 20px;
      background: white;
      border-radius: 8px;
      color: #333;

      h2 {
        margin: 0 0 24px;
        text-align: center;
        color: #333;
      }

      form {
        width: 85%;
        margin: 0 auto;
      }

      .form-group {
        margin-bottom: 16px;

        label {
          display: block;
          margin-bottom: 8px;
          color: #666;
        }

        input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          background: white;
          color: #333;

          &:focus {
            outline: none;
            border-color: #8884d8;
          }
        }
      }

      .actions {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 24px;

        button {
          padding: 8px 24px;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          border: none;

          &.btn-cancel {
            background: transparent;
            border: 1px solid #ddd;
            color: #666;
          }

          &.btn-login {
            background: #8884d8;
            color: white;

            &:hover {
              background: #6c63c7;
            }
          }
        }
      }

      .switch-form {
        text-align: center;
        margin-top: 16px;
        color: #666;

        p {
          margin: 0;
          font-size: 14px;
        }

        .switch-btn {
          background: none;
          border: none;
          color: #8884d8;
          padding: 0;
          margin-left: 4px;
          cursor: pointer;
          font-size: 14px;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  `]
})
export class LoginDialogComponent {
  email: string = '';
  password: string = '';
  username: string = '';
  isLogin: boolean = true;

  constructor(
    private dialogRef: MatDialogRef<LoginDialogComponent>,
    private authService: AuthService
  ) {}

  onSubmit() {
    if (this.isLogin) {
      this.authService.login(this.email, this.password, 'customer').subscribe({
        next: (user) => {
          this.dialogRef.close(true);
        },
        error: (err) => {
          alert('Invalid credentials. Use admin/1234');
        }
      });
    } else {
      // Handle signup
      alert('Signup functionality to be implemented');
      this.isLogin = true;
    }
  }

  toggleForm() {
    this.isLogin = !this.isLogin;
    this.email = '';
    this.password = '';
    this.username = '';
  }

  onCancel() {
    this.dialogRef.close(false);
  }
} 