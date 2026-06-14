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
import { ShopService } from 'src/app/services/shop.service';
import { environment } from 'src/environments/environment';
import { ResponseDate } from 'src/app/app.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import Swal from 'sweetalert2';

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
  paymentService = inject(PaymentService);
  shopService = inject(ShopService);

  payableAmount: number = 0;
  isProcessing: boolean = false;
  generatedPaymentLink: string | null = null;
  paymentChannel: 'link' | 'collect' | 'qrcode' = 'link';
  customerUpiId: string = '';
  qrCodeBase64: string | null = null;
  currentOrderId: string | null = null;

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

  copyPaymentLink() {
    if (this.generatedPaymentLink) {
      navigator.clipboard.writeText(this.generatedPaymentLink);
      this._snackBar.success('Payment Link copied to clipboard!');
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Payment link copied to clipboard.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }

  downloadQrCode() {
    if (this.qrCodeBase64) {
      const base64Data = this.qrCodeBase64.includes('base64,')
        ? this.qrCodeBase64
        : 'data:image/png;base64,' + this.qrCodeBase64;

      const link = document.createElement('a');
      link.href = base64Data;
      link.download = `QR_CODE_${this.data.invoice.invoiceNumber}.png`;
      link.click();
      this._snackBar.success('QR Code downloaded successfully!');
    }
  }

  async copyQrCodeImage() {
    if (this.qrCodeBase64) {
      try {
        const base64Data = this.qrCodeBase64.includes('base64,')
          ? this.qrCodeBase64
          : 'data:image/png;base64,' + this.qrCodeBase64;

        const response = await fetch(base64Data);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        this._snackBar.success('QR Code image copied to clipboard!');
        Swal.fire({
          icon: 'success',
          title: 'Copied!',
          text: 'QR Code image copied to clipboard.',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (err) {
        console.error('Error copying image:', err);
        try {
          navigator.clipboard.writeText(this.qrCodeBase64);
          this._snackBar.success('QR Code base64 string copied!');
        } catch (subErr) {
          this._snackBar.error('Failed to copy QR code.');
        }
      }
    }
  }

  async ProcessPayment() {
    if (this.selectedPayment === 'PAYMENT_LINK') {
      if (this.paymentChannel === 'collect' && !this.customerUpiId.trim()) {
        this._snackBar.warning('Please enter the customer\'s UPI VPA.');
        return;
      }

      this.isProcessing = true;
      const body = {
        paymentMode: 'UPI',
        channel: this.paymentChannel,
        upiId: this.paymentChannel === 'collect' ? this.customerUpiId.trim() : null
      };

      this.paymentService.createPaymentSession(body, this.data.invoice.id).subscribe({
        next: (res: ResponseDate) => {
          console.log('Payment session response:', res);
          this.isProcessing = false;
          if (res.status === 200 && res.data) {
            this.generatedPaymentLink = res.data.shareableUrl;
            this.qrCodeBase64 = res.data.qrCodeBase64 || res.data.qrCode || res.data.qrcode;
            this.currentOrderId = res.data.orderId;
            this._snackBar.success('Payment session generated!');
            Swal.fire({
              icon: 'success',
              title: this.paymentChannel === 'qrcode' ? 'QR Code Generated!' : 'Link Generated!',
              text: this.paymentChannel === 'qrcode'
                ? 'QR Code generated successfully. Scan to complete transaction.'
                : 'Payment session generated successfully. Share the copied link with the customer.',
              confirmButtonText: 'Great'
            });
          } else {
            this._snackBar.error(res.message || 'Failed to generate payment session.');
          }
        },
        error: (err: any) => {
          console.error('Error generating payment session:', err);
          this._snackBar.error(err.error?.message || 'Server error generating payment session.');
          this.isProcessing = false;
        }
      });
      return;
    }

    if (this.selectedPayment === 'CASHFREE') {
      this.isProcessing = true;
      this.paymentService.createCashfreeOrder(this.data.invoice.id).subscribe({
        next: async (res: ResponseDate) => {
          console.log('Cashfree order response:', res);
          if (res.status !== 200 || !res.data || !res.data.paymentSessionId) {
            this._snackBar.error(res.message || 'Failed to initiate Cashfree order.');
            this.isProcessing = false;
            return;
          }

          this.currentOrderId = res.data.orderId;

          try {
            const isProd = environment.production;
            if (!(window as any).Cashfree) {
              this._snackBar.error('Cashfree SDK is not loaded. Please refresh the page.');
              this.isProcessing = false;
              return;
            }

            const cashfree = (window as any).Cashfree({
              mode: isProd ? 'production' : 'sandbox'
            });

            const checkoutOptions = {
              paymentSessionId: res.data.paymentSessionId,
              redirectTarget: '_modal'
            };

            cashfree.checkout(checkoutOptions).then((result: any) => {

              console.log('Checkout closed', result);

              // Only start verification if payment attempt exists
              if (result?.paymentDetails || result?.cf_payment_id) {
                this.verifyCashfreePayment();
              } else {
                this.isProcessing = false;
                this._snackBar.error('User likely cancelled payment!');
                console.log('User likely cancelled payment');
              }
            }).catch((err: any) => {
              console.error('Cashfree checkout error:', err);
              this._snackBar.error('An error occurred during checkout.');
              this.isProcessing = false;
            });

          } catch (err: any) {
            console.error('Error loading Cashfree:', err);
            this._snackBar.error('Could not initialize payment gateway.');
            this.isProcessing = false;
          }
        },
        error: (err: any) => {
          console.error('Error creating order:', err);
          this._snackBar.error(err.error?.message || 'Failed to initiate Cashfree payment.');
          this.isProcessing = false;
        }
      });
    } else {
      let payment: PaymentModel = {
        paymentMode: this.selectedPayment!,
        grandTotal: this.data.invoice.grandTotal!,
        paidAmount: this.payableAmount
      };

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
          this._snackBar.error('Failed to record payment.');
        }
      });
    }
  }

  verifyCashfreePayment(attempt: number = 1) {
    Swal.fire({
      title: 'Verifying payment...',
      text: `Please wait while we confirm your payment status. (${attempt}/5)`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.shopService.getInvoiceById(this.data.invoice.id!).subscribe({
      next: (res: ResponseDate) => {
        console.log('Invoice status verification:', res);
        const invoiceData = res.data;
        if (invoiceData) {
          // Check if there is any COMPLETED or PAID status payment
          const payments = invoiceData.payments || [];
          let completedPayment = null;

          if (this.currentOrderId) {
            completedPayment = payments.find((p: any) =>
              p.orderId === this.currentOrderId &&
              (p.status === 'COMPLETED' || p.status === 'SUCCESS' || p.status === 'PAID')
            );
          }

          if (completedPayment) {
            Swal.close();
            completedPayment.invoiceId = invoiceData.id;
            this.dialogRef.close(completedPayment);
            return;
          }

          // If not paid yet, check invoice status itself
          if (invoiceData.status === 'PAID') {
            Swal.close();
            // Mock a payment response object to satisfy the pos.component.ts expected result
            const mockPaymentResponse = {
              id: invoiceData.id,
              invoiceId: invoiceData.id,
              status: 'COMPLETED',
              paidAmount: this.payableAmount,
              paymentMode: 'CASHFREE',
              transactionId: 'CASHFREE-' + Date.now()
            };
            this.dialogRef.close(mockPaymentResponse);
            return;
          }
        }

        // Retry polling if not completed and we have remaining attempts
        if (attempt < 8) {
          setTimeout(() => {
            this.verifyCashfreePayment(attempt + 1);
          }, 2000);
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Payment Status Pending',
            text: 'We could not confirm the payment completion automatically. Please check the invoice list in a few moments or verify with customer.',
            confirmButtonText: 'OK'
          }).then(() => {
            this.isProcessing = false;
            this.dialogRef.close();
          });
        }
      },
      error: (err: any) => {
        console.error('Error verifying payment:', err);
        if (attempt < 5) {
          setTimeout(() => {
            this.verifyCashfreePayment(attempt + 1);
          }, 2000);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Verification Failed',
            text: 'An error occurred while verifying the payment status.',
            confirmButtonText: 'OK'
          }).then(() => {
            this.isProcessing = false;
            this.dialogRef.close();
          });
        }
      }
    });
  }
}
