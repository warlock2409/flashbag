import { Component, inject, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Customer } from 'src/app/models/customer.model';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './add-customer.component.html',
  styleUrl: './add-customer.component.scss'
})
export class AddCustomerComponent {

  customerForm !: FormGroup;
  private _snackBar = inject(NzMessageService);

  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddCustomerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private orgService: OrganizationServiceService
  ) {
    this.customerForm = this.fb.group({
      email: ['', [Validators.email]],
      phone: ['', [Validators.minLength(10)]],
      name: ['', Validators.required],
    },
      { validators: [this.emailOrPhoneValidator] }
    );
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
    let newCustomer = this.getCustomer();

    this.orgService.addCustomerToOrganization(newCustomer).subscribe({
      next: (res: any) => {
        console.log(res.data,"addCustomerToOrganization");
        
        this._snackBar.success('Customer added succesfully');
        this.customerForm.reset();
      }, error: (err) => {
        this._snackBar.success('This is a normal message');
      },
    })
  }

  getCustomer(): Customer {
    const formValue = this.customerForm.value;

    return {
      firstName: formValue.name,
      email: formValue.email || undefined,  // optional if not provided
      contactNumber: formValue.phone || undefined   // optional if not provided
    };
  }

}
