import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SweatAlertService {
  

  constructor() { }

  success(message: string) {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: message,
      showConfirmButton: false,
      timer: 1500
    });
  }

  error(message: string, timer=1500) {
    Swal.fire({
      position: "top-end",
      icon: "error",
      title: message,
      showConfirmButton: false,
      timer: timer
    });
  }

  errorHtml(errors: string) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Form',
      html: errors
    });
  }


}
