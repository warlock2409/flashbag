import { Component, inject, Inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UploadMediaComponent, DocumentDto } from '../../../../../components/upload-media/upload-media.component';

@Component({
  selector: 'app-advertisement-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatSelectModule, MatSlideToggleModule, UploadMediaComponent],
  templateUrl: './advertisement-dialog.component.html',
  styleUrls: ['./advertisement-dialog.component.scss']
})
export class AdvertisementDialogComponent {
  // Services
  private orgService = inject(OrganizationServiceService);
  private message = inject(NzMessageService);
  private dialogRef = inject(MatDialogRef<AdvertisementDialogComponent>);
  public data: any = inject(MAT_DIALOG_DATA);

  // Advertisement form data
  id: number | null = null;
  adName: string = '';
  targetArea: string = '';
  endDate: string = '';
  isActive: boolean = true;
  imageFile: File | null = null;
  uploadedDocument: DocumentDto | null = null;
  isSubmitting = false;

  // Available target areas
  targetAreas = [
    { id: 'CHECKIN_AREA', name: 'Customer Check In' },
  ];

  constructor() {
    if (this.data) {
      console.log(this.data);

      this.patchData(this.data);
    }
  }

  patchData(data: any) {
    this.id = data.id || null;
    this.adName = data.name || '';
    this.targetArea = data.advertisementArea || '';
    if (data.endDate) {
      // Format date for date input (YYYY-MM-DD) in local timezone
      // toLocaleDateString('en-CA') returns YYYY-MM-DD format
      this.endDate = new Date(data.endDate).toLocaleDateString('en-CA');
    }
    this.isActive = data.status !== undefined ? data.status : true;

    // Handle existing document
    if (data.documentDto) {
      this.uploadedDocument = data.documentDto;
    }
  }

  // Handle uploaded media from upload-media component
  onMediaUploaded(document: DocumentDto) {
    this.uploadedDocument = document;
    // Get the first attachment as the selected image
    if (document.attachments && document.attachments.length > 0) {
      const attachment = document.attachments[0];
      // Create a mock File object for compatibility with existing logic
      this.imageFile = new File([], attachment.filename, {
        type: attachment.contentType
      });
    }
  }

  // Submit form handler
  submitForm() {
    if (!this.validForm()) return;

    if (!this.uploadedDocument || !this.uploadedDocument.id) {
      this.message.error("Please upload an image first");
      return;
    }

    // Create a date object from the input string (treated as local time)
    // Appending 'T00:00:00' forces local time construction instead of UTC
    const localDate = new Date(this.endDate + 'T00:00:00');

    const payload = {
      name: this.adName,
      endDate: localDate.toISOString(), // Convert local midnight to UTC
      status: this.isActive,
      documentDto: {
        id: this.uploadedDocument.id
      },
      advertisementArea: this.targetArea
    };

    this.isSubmitting = true;

    if (this.id) {
      // Update existing advertisement
      console.log("Updating advertisement with payload:", payload);
      this.orgService.updateAdvertisement(this.id, payload).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res && (res.status === 200 || res.status === 201 || res.status === 202)) {
            this.message.success("Advertisement updated successfully");
            this.dialogRef.close(true);
          } else {
            this.message.error(res.message || "Failed to update advertisement");
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error("Error updating advertisement:", err);
          this.message.error("An error occurred while updating advertisement");
        }
      });
    } else {
      // Create new advertisement
      console.log("Creating advertisement with payload:", payload);
      this.orgService.createAdvertisement(payload).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res && (res.status === 200 || res.status === 201 || res.status === 202)) {
            this.message.success("Advertisement created successfully");
            this.dialogRef.close(true);
          } else {
            this.message.error(res.message || "Failed to create advertisement");
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error("Error creating advertisement:", err);
          this.message.error("An error occurred while creating advertisement");
        }
      });
    }
  }

  validForm(): boolean {
    // For update, imageFile might be null if strictly relying on uploadedDocument, 
    // but onMediaUploaded creates a mock File. 
    // If populating from existing data, we might not have 'imageFile' but we have 'uploadedDocument'.
    // So check uploadedDocument instead of imageFile for validity.
    return !!(this.adName && this.endDate && this.targetArea && this.uploadedDocument);
  }
}