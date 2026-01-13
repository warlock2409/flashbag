import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ShopModel } from 'src/app/models/shop.model';
import { MatButtonModule } from '@angular/material/button';
import { HolidayDto } from 'src/app/models/holiday.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NzCardModule } from 'ng-zorro-antd/card';
import { HolidayFormComponent } from '../holiday-form/holiday-form.component';
import { HolidayService } from 'src/app/services/holiday.service';
import { catchError, of } from 'rxjs';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-holiday-actions',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCheckboxModule, NzCardModule],
  templateUrl: './holiday-actions.component.html',
  styleUrls: ['./holiday-actions.component.scss']

})
export class HolidayActionsComponent {
  holidays: HolidayDto[] = [];
  
  constructor(
    public dialogRef: MatDialogRef<HolidayActionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { shop: ShopModel },
    private dialog: MatDialog,
    private holidayService: HolidayService
  ) {
    // Initialize with data from service
    this.loadHolidays();
  }
  
  loadHolidays() {
    if (this.data.shop.code) {
      this.holidayService.getHolidays(this.data.shop.code).pipe(
        catchError(error => {
          console.error('Error loading holidays:', error);
          return of({ data: [], message: 'Error loading holidays', status: 500 });
        })
      ).subscribe(response => {
        this.holidays = response.data || [];
      });
    }
  }
  
  addHoliday() {
    const dialogRef = this.dialog.open(HolidayFormComponent, {
      data: { holiday: null, isEdit: false },
      width: '700px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.data.shop.code) {
        // Convert holiday date to UTC timestamp based on client timezone (IST)
        const holidayWithTimestamp = {
          ...result,
          holidayDate: moment.tz(result.holidayDate, 'Asia/Kolkata').utc().toISOString()
        };
        
        // Add the new holiday to the backend
        this.holidayService.createHoliday(this.data.shop.code, holidayWithTimestamp).pipe(
          catchError(error => {
            console.error('Error creating holiday:', error);
            return of({ data: null, message: 'Error creating holiday', status: 500 });
          })
        ).subscribe(response => {
          if (response.data) {
            // Add the new holiday to the list
            this.holidays = [...this.holidays, response.data];
          }
        });
      }
    });
  }
  
  editHoliday(holiday: HolidayDto, index: number) {
    const dialogRef = this.dialog.open(HolidayFormComponent, {
      data: { holiday: holiday, isEdit: true },
      width: '700px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.data.shop.code) {
        // Convert holiday date to UTC timestamp based on client timezone (IST)
        const holidayWithTimestamp = {
          ...result,
          holidayDate: moment.tz(result.holidayDate, 'Asia/Kolkata').utc().toISOString()
        };
        
        // Update the holiday in the backend
        this.holidayService.updateHoliday(this.data.shop.code, holidayWithTimestamp).pipe(
          catchError(error => {
            console.error('Error updating holiday:', error);
            return of({ data: null, message: 'Error updating holiday', status: 500 });
          })
        ).subscribe(response => {
          if (response.data) {
            // Update the holiday in the list
            this.holidays[index] = response.data;
            this.holidays = [...this.holidays]; // Trigger change detection
          }
        });
      }
    });
  }
  
  removeHoliday(index: number) {
    const holiday = this.holidays[index];
    if (holiday.id && this.data.shop.code) {
      this.holidayService.deleteHoliday(this.data.shop.code, holiday.id).pipe(
        catchError(error => {
          console.error('Error deleting holiday:', error);
          return of({ data: false, message: 'Error deleting holiday', status: 500 });
        })
      ).subscribe(response => {
        if (response.data) {
          // Remove the holiday from the list
          this.holidays.splice(index, 1);
          this.holidays = [...this.holidays]; // Trigger change detection
        }
      });
    }
  }
  
  saveHolidays() {
    // In this implementation, changes are saved immediately when add/edit/delete operations are performed
    // The dialog can close without additional saving
    this.dialogRef.close(this.holidays);
  }
}