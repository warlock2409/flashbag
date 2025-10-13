import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { NzNotificationService } from 'ng-zorro-antd/notification';


@Injectable({
  providedIn: 'root'
})
export class SweatAlertService {


  constructor(private notification: NzNotificationService) { }


  createNotification(type: string, title: string, message: string): void {
    this.notification.create(
      type,
      title,
      message
    );
  }

  success(message: string) {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: message,
      showConfirmButton: false,
      timer: 1500
    });
  }

  error(message: string) {
    Swal.fire({
      position: "top-end",
      icon: "error",
      title: message,
      showConfirmButton: false,
      timer: 1500
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
