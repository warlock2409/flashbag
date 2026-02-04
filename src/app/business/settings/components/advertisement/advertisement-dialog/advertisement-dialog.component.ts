import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
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
  // Advertisement form data
  adName: string = '';
  targetArea: string = '';
  endDate: string = '';
  isActive: boolean = true;
  imageFile: File | null = null;
  uploadedDocument: DocumentDto | null = null;

  // Available target areas
  targetAreas = [
    { id: 'CHECKIN_AREA', name: 'Customer Check In' },
  ];

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
    // In a real implementation, this would save the advertisement data
    console.log('Advertisement submitted:', {
      name: this.adName,
      targetArea: this.targetArea,
      endDate: this.endDate,
      isActive: this.isActive,
      imageFile: this.imageFile
    });
  }
}