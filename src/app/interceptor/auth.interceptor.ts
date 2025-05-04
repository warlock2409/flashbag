

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';  // Adjust the import to match your file structure

// This function replaces the class-based interceptor
export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
    // Skip adding the token for login requests
    if (req.url.includes('login')) {
        return next(req);
    }

    // Get the AuthService instance
    const authService = inject(AuthService);
    const token = authService.getToken();  // Get the auth token from your AuthService

    // Check if the token exists before adding it to the request
    if (!token) {
        return next(req);  // If no token, pass the request as-is
    }

    // Clone the request and add the Authorization header with the token
    const clonedRequest = req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`,
        },
    });

    return next(clonedRequest);
};