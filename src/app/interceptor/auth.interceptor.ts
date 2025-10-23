

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';  // Adjust the import to match your file structure
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';

// This function replaces the class-based interceptor
export const AuthInterceptor: HttpInterceptorFn = (req, next) => {

    // const updatedUrl = req.url.replace('http://localhost:8080', 'http://localhost:9000');
    // const updatedUrl = req.url.replace('http://localhost:8080', 'http://164.52.222.190:8080');
    const updatedUrl = req.url.replace('http://localhost:8080', 'https://9myle.duckdns.org');


    const updatedReq = req.clone({
        url: updatedUrl,
        setHeaders: {
            'ngrok-skip-browser-warning': 'true',  // <--- This header skips the warning
        }
    });

    // Skip adding the token for login requests
    if (updatedReq.url.includes('login') || updatedReq.url.includes('register') || updatedReq.url.includes('cloudflarestorage.com')) {
        return next(updatedReq);
    }

    // Get the AuthService instance
    const authService = inject(AuthService);
    const token = authService.getToken();

    // Check if the token exists before adding it to the request
    if (!token) {
        console.log("No Token Found");
        return next(updatedReq);
    }

    // Clone again to add the Authorization header
    const clonedRequest = updatedReq.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`,
        },
    });

    return next(clonedRequest).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                console.warn('Unauthorized! Logging out...');
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: "Session TimeOut Login-again",
                    showConfirmButton: false,
                    timer: 2500
                });
                authService.logout(); // ⬅️ Log out the user
            }
            return throwError(() => error);
        })
    );
};