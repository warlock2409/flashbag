import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-campaign-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, FormsModule,CommonModule],
  templateUrl: './campaign-dialog.component.html',
  styleUrl: './campaign-dialog.component.scss'
})
export class CampaignDialogComponent {

  campaignMedium = {
    whatsapp:true,
    email:false,
    sms:false,
    pushNotification:false
  }

}
