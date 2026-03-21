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
  isEditMode = false;
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
    // Check if opened in edit mode
    if (this.data && this.data.mode === 'edit') {
      this.isEditMode = true;
    }

    // Check if opened by export customer
    if (this.data && this.data.mode === 'export') {
      this.isExportCustomerMode = true;
    }

    // Initialize form with conditional fields based on mode
    this.initializeForm();

    // Pre-populate form fields in edit mode
    if (this.isEditMode && this.data.customer) {
      const c = this.data.customer;

      // Parse country code and phone from the stored contactNumber or phone (e.g. "+919876543210")
      const knownCodes = ['+91', '+1', '+44', '+61', '+81'];
      let countryCode = '+91';
      let phone = c.contactNumber || c.phone || '';
      if (phone) {
        const matched = knownCodes.find(code => phone.startsWith(code));
        if (matched) {
          countryCode = matched;
          phone = phone.slice(matched.length).trim();
        }
      }

      this.customerForm.patchValue({
        name: c.firstName || c.name || '',
        existingCustomerId: c.existingCustomerId || '',
        email: c.email || '',
        phone,
        countryCode
      });
    }
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

    this.customerForm = this.fb.group(
      formControls,
      this.isEditMode ? {} : { validators: [this.emailOrPhoneValidator] }
    );

    // In edit mode disable email & phone
    if (this.isEditMode) {
      this.customerForm.get('email')?.disable();
      this.customerForm.get('phone')?.disable();
      this.customerForm.get('countryCode')?.disable();
    }
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
        console.log(this.memberships, "loadMemberships");
        this.memberships = this.memberships.map(membership => {

          const durationBenefits = membership.benefits
            .filter((b: any) => b.benefitType === 'DURATION_ACCESS' && b.durationValue && b.durationUnit);

          if (!durationBenefits.length) {
            return { ...membership, durationLabel: null };
          }

          const longest = durationBenefits.reduce((max: any, item: any) => {
            const currentDays = this.convertToDays(item.durationValue, item.durationUnit);
            const maxDays = this.convertToDays(max.durationValue, max.durationUnit);
            return currentDays > maxDays ? item : max;
          });

          const durationLabel = `${longest.durationValue}-${this.capitalize(longest.durationUnit || '')}`;

          return { ...membership, durationLabel };
        });

        console.log(this.memberships, "updatedMemberships");
      },
      error: (err) => {
        console.error('Error loading memberships:', err);
        this._snackBar.error('Error loading memberships');
      }
    });
  }

  capitalize(unit: string): string {
    return unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase();
  }

  convertToDays(value: number, unit: string): number {
    switch (unit) {
      case 'DAY': return value;
      case 'WEEK': return value * 7;
      case 'MONTH': return value * 30;   // approximate
      case 'YEAR': return value * 365;   // approximate
      default: return 0;
    }
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
    const formValue = this.customerForm.getRawValue();

    if (!formValue.name) {
      this._snackBar.error('Please enter a name');
      return;
    }
    if (!formValue.phone) {
      this._snackBar.error('Please enter a phone number');
      return;
    }
    if (this.customerForm.invalid) return;

    if (this.isEditMode) {
      this.submitEditCustomerForm();
    } else if (this.isExportCustomerMode) {
      const membershipId = formValue.membershipId;
      const startDate = formValue.startDate;

      if (!startDate) {
        this._snackBar.error('Please select a start date');
        return;
      }
      if (!membershipId) {
        this._snackBar.error('Please select a membership');
        return;
      }
      this.submitExportCustomerForm();
    } else {
      this.submitRegularCustomerForm();
    }
  }

  submitEditCustomerForm() {
    const formValue = this.customerForm.getRawValue();
    const customerId: number = this.data?.customer?.id;
    const existingCustomerId: number = formValue.existingCustomerId
      ? parseInt(formValue.existingCustomerId)
      : this.data?.customer?.existingCustomerId;
    const customerName: string = formValue.name;

    this.orgService.updateCustomerDetails(customerId, existingCustomerId, customerName).subscribe({
      next: (res: any) => {
        this._snackBar.success('Customer updated successfully');
        this.dialogRef.close(res.data);
      },
      error: (err) => {
        this._snackBar.error(err?.error?.message || 'Error updating customer');
      }
    });
  }

  submitRegularCustomerForm() {
    let newCustomer = this.getCustomer();

    this.orgService.addCustomerToOrganization(newCustomer).subscribe({
      next: (res: any) => {
        console.log(res.data, "addCustomerToOrganization");

        this._snackBar.success('Customer added succesfully');
        this.customerForm.reset();
        this.dialogRef.close(res.data);
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

    const customer: any = {
      firstName: formValue.name,
      email: formValue.email || undefined,
      contactNumber: fullPhoneNumber || undefined,
      existingCustomerId: formValue.existingCustomerId ? parseInt(formValue.existingCustomerId) : undefined
    };

    // If we have a document uploaded, include the document ID
    if (this.sampleUploads && this.sampleUploads.id) {
      customer.documentId = this.sampleUploads.id;
    }

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
        this.recordPayment(invoiceId, res.data.grandTotal);
      },
      error: (err) => {
        this._snackBar.error('Error creating membership invoice');
        this._snackBar.error(err.error.message);
        console.error('Error issuing invoice:', err);
      }
    });
  }

  recordPayment(invoiceId: number, grandTotal: any) {

    const payment: PaymentModel = {
      paymentMode: 'CASH',
      grandTotal: grandTotal,
      paidAmount: grandTotal
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
