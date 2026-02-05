import { Component, inject, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Customer } from 'src/app/models/customer.model';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { OrganizationMembershipPlan } from 'src/app/models/organization';
import { ServiceResponse } from 'src/app/app.component';
import { UploadMediaComponent } from 'src/app/components/upload-media/upload-media.component'; // Added import
import { DocumentDto } from 'src/app/components/upload-media/upload-media.component'; // Added import
import { ShopService } from 'src/app/services/shop.service'; // Added import
import { PaymentService } from 'src/app/services/payment.service'; // Added import
import { InvoiceModel, ItemModel, PaymentModel } from 'src/app/models/payment.model'; // Added import

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule, MatButtonModule, ReactiveFormsModule, UploadMediaComponent], // Added UploadMediaComponent to imports
  templateUrl: './add-customer.component.html',
  styleUrl: './add-customer.component.scss'
})
export class AddCustomerComponent implements OnInit {

  customerForm !: FormGroup;
  private _snackBar = inject(NzMessageService);
  memberships: OrganizationMembershipPlan[] = [];
  isExportCustomerMode = false;
  // Added property for document uploads
  sampleUploads: DocumentDto | null = null;
  // Injected services
  shopService = inject(ShopService);
  paymentService = inject(PaymentService);

  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddCustomerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private orgService: OrganizationServiceService
  ) {
    // Check if opened by export customer
    if (this.data && this.data.mode === 'export') {
      this.isExportCustomerMode = true;
    }

    // Initialize form with conditional fields based on mode
    this.initializeForm();
  }

  // Added method to handle document upload
  setDocument($event: DocumentDto) {
    this.sampleUploads = $event;
    console.log("Document received", $event);
  }

  initializeForm(): void {
    const formControls: any = {
      email: ['', [Validators.email]],
      phone: ['', [Validators.minLength(10)]],
      name: ['', Validators.required],
      existingCustomerId: [''],
      countryCode: ['+91'] // Default country code
    };

    // Add membership-related fields only in import mode
    if (this.isExportCustomerMode) {
      formControls.membershipId = [''];
      formControls.startDate = [''];
    }

    this.customerForm = this.fb.group(formControls, { validators: [this.emailOrPhoneValidator] });
  }

  ngOnInit(): void {
    // Load memberships only in import mode
    if (this.isExportCustomerMode) {
      this.loadMemberships();
    }
  }

  loadMemberships(): void {
    this.orgService.getAllOrgMembership().subscribe({
      next: (res: ServiceResponse<any>) => {
        this.memberships = res.data;
      },
      error: (err) => {
        console.error('Error loading memberships:', err);
        this._snackBar.error('Error loading memberships');
      }
    });
  }

  emailOrPhoneValidator(group: AbstractControl): ValidationErrors | null {
    const email = group.get('email')?.value;
    const phone = group.get('phone')?.value;

    if (!email && !phone) {
      return { emailOrPhoneRequired: true };
    }

    return null;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submitAccountForm() {
    if (this.customerForm.invalid) return;

    if (this.isExportCustomerMode) {
      this.submitExportCustomerForm();
    } else {
      this.submitRegularCustomerForm();
    }
  }

  submitRegularCustomerForm() {
    let newCustomer = this.getCustomer();

    this.orgService.addCustomerToOrganization(newCustomer).subscribe({
      next: (res: any) => {
        console.log(res.data, "addCustomerToOrganization");

        this._snackBar.success('Customer added succesfully');
        this.customerForm.reset();
        this.dialogRef.close(true);
      }, error: (err) => {
        this._snackBar.error(err.error.message);
      },
    })
  }

  submitExportCustomerForm() {
    // Step 1: Add customer with name, email, phone, and documentId
    let newCustomer = this.getCustomerWithDocument();

    this.orgService.addCustomerToOrganization(newCustomer).subscribe({
      next: (res: any) => {
        console.log(res.data, "addCustomerToOrganization");
        const customerId = res.data.id;

        this._snackBar.success('Customer added successfully');

        // Step 2: Create invoice for membership
        this.createMembershipInvoice(customerId);
      },
      error: (err) => {
        this._snackBar.error(err.error.message);
        console.error('Error adding customer:', err);
      },
    })
  }

  getCustomer(): Customer {
    const formValue = this.customerForm.value;
    // Merge country code with phone number
    const fullPhoneNumber = formValue.countryCode && formValue.phone
      ? `${formValue.countryCode}${formValue.phone}`
      : formValue.phone;

    return {
      firstName: formValue.name,
      email: formValue.email || undefined,  // optional if not provided
      contactNumber: fullPhoneNumber || undefined,   // optional if not provided
      id: formValue.existingCustomerId ? parseInt(formValue.existingCustomerId) : undefined
    };
  }

  getCustomerWithDocument(): Customer {
    const formValue = this.customerForm.value;
    // Merge country code with phone number
    const fullPhoneNumber = formValue.countryCode && formValue.phone
      ? `${formValue.countryCode}${formValue.phone}`
      : formValue.phone;

    const customer: Customer = {
      firstName: formValue.name,
      email: formValue.email || undefined,
      contactNumber: fullPhoneNumber || undefined,
      existingCustomerId: formValue.existingCustomerId ? parseInt(formValue.existingCustomerId) : undefined
    };

    // If we have a document uploaded, we would typically associate it here
    // However, the Customer model doesn't seem to have a document field
    // The document ID would likely be associated during the invoice creation

    return customer;
  }

  createMembershipInvoice(customerId: number) {
    const formValue = this.customerForm.value;
    const membershipId = formValue.membershipId;
    const startDate = formValue.startDate;

    // Validate required fields
    if (!membershipId) {
      this._snackBar.error('Please select a membership');
      return;
    }

    // Find the selected membership to get its details
    const selectedMembership = this.memberships.find(m => m.id === membershipId);
    if (!selectedMembership) {
      this._snackBar.error('Selected membership not found');
      return;
    }

    const invoice: InvoiceModel = {
      customerId: customerId,
      discount: 0.0,
      items: [{
        itemType: 'MEMBERSHIPS',
        itemName: selectedMembership.name,
        itemId: membershipId,
        quantity: 1,
        startDate: startDate ? new Date(startDate).getTime() : undefined
      }]
    };

    this.shopService.createInvoice(invoice).subscribe({
      next: (res: ServiceResponse<any>) => {
        console.log(res.data, "createInvoice");
        this._snackBar.success('Membership invoice created');

        const invoiceId = res.data.id;

        // Step 3: Issue invoice (set status to ISSUED)
        this.issueInvoice(invoiceId);
      },
      error: (err) => {
        this._snackBar.error(err.error.message);
        console.error('Error creating invoice:', err);
      }
    });
  }

  issueInvoice(invoiceId: number) {
    this.shopService.updateInvoiceStatus(invoiceId, "ISSUED").subscribe({
      next: (res: ServiceResponse<any>) => {
        console.log(res.data, "issueInvoice");
        // Step 4: Record payment with CASH method
        this.recordPayment(invoiceId);
      },
      error: (err) => {
        this._snackBar.error('Error creating membership invoice');
        this._snackBar.error(err.error.message);
        console.error('Error issuing invoice:', err);
      }
    });
  }

  recordPayment(invoiceId: number) {
    const payment: PaymentModel = {
      paymentMode: 'CASH',
      grandTotal: 0 // This will be set by the backend based on the invoice
    };

    this.paymentService.makePayment(payment, invoiceId).subscribe({
      next: (res: ServiceResponse<any>) => {
        console.log(res.data, "recordPayment");
        this._snackBar.success('Import Completed');

        // All steps completed
        this.dialogRef.close(true);
      },
      error: (err) => {
        this._snackBar.error(err.error.message);
        console.error('Error recording payment:', err);
      }
    });
  }
} 
