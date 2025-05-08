

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';  // Adjust the import to match your file structure

// This function replaces the class-based interceptor
export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
    const updatedUrl = req.url.replace('http://localhost:8080', 'https://6694-223-184-94-31.ngrok-free.app');
    const updatedReq = req.clone({
        url: updatedUrl,
        setHeaders: {
            'ngrok-skip-browser-warning': 'true',  // <--- This header skips the warning
        }
    });

    // Skip adding the token for login requests
    if (updatedReq.url.includes('login')) {
        return next(updatedReq);
    }

    // Get the AuthService instance
    const authService = inject(AuthService);
    const token = authService.getToken();

    // Check if the token exists before adding it to the request
    if (!token) {
        return next(updatedReq);
    }

    // Clone again to add the Authorization header
    const clonedRequest = updatedReq.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`,
        },
    });

    return next(clonedRequest);
};