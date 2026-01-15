import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { AddressModel, ShopModel } from 'src/app/models/shop.model';
// import { LocationPickerComponent } from '../../../location-picker/location-picker.component';

@Component({
  selector: 'app-address-config-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    NzButtonModule,
    NzCardModule
  ],
  template: `
    <div class="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center border-b border-gray-200 py-3 px-4">
          <h2 class="text-lg font-semibold text-gray-800 m-0">Address Settings</h2>
          <button (click)="closeDialog()" class="text-gray-400 hover:text-red-500 cursor-pointer">
            <mat-icon style="color: lightcoral;">cancel</mat-icon>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6">
          <form [formGroup]="addressForm">
            <nz-card nzType="inner" nzTitle="Shop Address">
              <div class="space-y-4">
                <mat-form-field class="w-full">
                  <mat-label>Address Line 1</mat-label>
                  <input matInput formControlName="address1" placeholder="Street address">
                </mat-form-field>
                
                <mat-form-field class="w-full">
                  <mat-label>Address Line 2</mat-label>
                  <input matInput formControlName="address2" placeholder="Apartment, suite, etc. (optional)">
                </mat-form-field>
                
                <div class="grid grid-cols-2 gap-4">
                  <mat-form-field>
                    <mat-label>City</mat-label>
                    <input matInput formControlName="city" placeholder="City">
                  </mat-form-field>
                  
                  <mat-form-field>
                    <mat-label>State</mat-label>
                    <input matInput formControlName="state" placeholder="State">
                  </mat-form-field>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <mat-form-field>
                    <mat-label>Postal Code</mat-label>
                    <input matInput formControlName="postalCode" placeholder="ZIP/Postal code">
                  </mat-form-field>
                  
                  <mat-form-field>
                    <mat-label>Country</mat-label>
                    <input matInput formControlName="country" placeholder="Country">
                  </mat-form-field>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <mat-form-field>
                    <mat-label>Latitude</mat-label>
                    <input matInput formControlName="latitude" type="number" placeholder="Latitude">
                  </mat-form-field>
                  
                  <mat-form-field>
                    <mat-label>Longitude</mat-label>
                    <input matInput formControlName="longitude" type="number" placeholder="Longitude">
                  </mat-form-field>
                </div>
                
<!--                 <div class="flex items-center gap-2">
                  <button mat-stroked-button type="button" (click)="openLocationPicker()" class="flex items-center gap-2">
                    <mat-icon>location_on</mat-icon>
                    <span>Select Location on Map</span>
                  </button>
                </div> -->
              </div>
            </nz-card>
            
            <div class="flex justify-end mt-6 gap-2">
              <button mat-stroked-button (click)="closeDialog()">Cancel</button>
              <button mat-flat-button color="primary" 
                [disabled]="addressForm.invalid"
                (click)="saveChanges()">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AddressConfigDialogComponent {
  addressForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddressConfigDialogComponent>,
    // private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { shop: ShopModel }
  ) {
    const addressDto: any = data.shop?.addressDto || {};
    this.addressForm = this.fb.group({
      address1: [addressDto.addressLine1 || '', Validators.required],
      address2: [addressDto.addressLine2 || ''],
      city: [addressDto.city || '', Validators.required],
      state: [addressDto.state || '', Validators.required],
      postalCode: [addressDto.postalCode || '', [Validators.required, Validators.pattern('^[0-9]{5,6}$')]],
      country: [addressDto.country || '', Validators.required],
      latitude: [addressDto.latitude || ''],
      longitude: [addressDto.longitude || '']
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  saveChanges() {
    if (this.addressForm.valid) {
      const formValue = this.addressForm.value;
      const addressModel: AddressModel = {
        id: this.data.shop?.addressDto?.id,
        addressLine1: formValue.address1,
        addressLine2: formValue.address2,
        city: formValue.city,
        state: formValue.state,
        postalCode: formValue.postalCode,
        country: formValue.country,
        latitude: formValue.latitude ? Number(formValue.latitude) : undefined,
        longitude: formValue.longitude ? Number(formValue.longitude) : undefined
      };
      this.dialogRef.close(addressModel);
    }
  }

  // openLocationPicker() {
  //   // Implementation commented out for now
  // }
}