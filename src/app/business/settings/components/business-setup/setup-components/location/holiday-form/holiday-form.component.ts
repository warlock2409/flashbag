import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HolidayDto } from 'src/app/models/holiday.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NzCardModule } from 'ng-zorro-antd/card';
import { HolidayService } from 'src/app/services/holiday.service';

@Component({
    selector: 'app-holiday-form',
    imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatCheckboxModule, NzCardModule],
    templateUrl: './holiday-form.component.html',
    styleUrl: './holiday-form.component.scss'
})
export class HolidayFormComponent {
    holiday: HolidayDto;

    constructor(
        public dialogRef: MatDialogRef<HolidayFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { holiday: HolidayDto, isEdit: boolean },
        private holidayService: HolidayService
    ) {
        // Initialize with provided holiday data or default values
        if (data.holiday) {
            // Format the date for the input field (YYYY-MM-DD) respecting local timezone
            const dateObj = new Date(data.holiday.holidayDate);
            // Use local timezone instead of UTC to avoid date shifting
            const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
            
            this.holiday = {
                ...data.holiday,
                holidayDate: formattedDate as any // Cast to any to match expected type
            };
        } else {
            const now = new Date();
            this.holiday = {
                holidayDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}` as any, // Current date in YYYY-MM-DD format
                name: '',
                notify: true
            };
        }
    }

    saveHoliday() {
        this.dialogRef.close(this.holiday);
    }
}   
