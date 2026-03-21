import { Component, inject, Inject, model } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceModel, PaymentModel } from 'src/app/models/payment.model';
import { MatButtonModule } from '@angular/material/button';
import { PaymentService } from 'src/app/services/payment.service';
import { ResponseDate } from 'src/app/app.component';
import { NzMessageService } from 'ng-zorro-antd/message';
@Component({
  selector: 'app-pos-actions',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDatepickerModule, MatCardModule, MatIconModule, MatButtonModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './pos-actions.component.html',
  styleUrl: './pos-actions.component.scss'
})
export class PosActionsComponent {
  private _snackBar = inject(NzMessageService);

  payableAmount: number = 0;

  constructor(private dialogRef: MatDialogRef<PosActionsComponent>, @Inject(MAT_DIALOG_DATA) public data: { type: string, name: string, invoice: InvoiceModel, payableAmount?: number, minDate?: Date }) {
    console.log(this.data);
    if (this.data.minDate !== undefined) {
      this.minDate = this.data.minDate;
    }
    if (this.data.payableAmount !== undefined) {
      this.payableAmount = this.data.payableAmount;
    } else if (this.data?.invoice?.grandTotal) {
      const totalPaid = this.data.invoice.payments?.reduce((sum, p) => sum + (p.amount || p.paidAmount || 0), 0) || 0;
      this.payableAmount = this.data.invoice.grandTotal - totalPaid;
    }
  }

  paymentService = inject(PaymentService);
  selected: Date | null = null;     // cannot be null
  minDate: Date | null = null;
  maxDate: Date = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

  // Payment 
  selectedPayment: string | null = 'CASH';


  closeDialog() {
    this.dialogRef.close();
  }

  onDateSelected(date: Date) {
    this.selected = date; // store the selected date
    this.dialogRef.close(this.selected)
  }


  selectPayment(method: string) {
    this.selectedPayment = method;
    console.log('Selected payment method:', this.selectedPayment);
  }

  ProcessPayment() {
    let payment: PaymentModel = {
      paymentMode: this.selectedPayment!,
      grandTotal: this.data.invoice.grandTotal!,
      paidAmount: this.payableAmount
    }

    this.paymentService.makePayment(payment, this.data.invoice.id).subscribe({
      next: (res: ResponseDate) => {
        console.log(res);
        if (res.data == null) {
          this._snackBar.warning(res.message);
        } else {
          this.dialogRef.close(res.data);
        }
      },
      error: (err: any) => {

      }
    })
  }
}
