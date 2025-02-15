import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ClickOutsideDirective
  ],
  template: `
    <div class="search-container" [class.navbar-search]="isNavbar">
      <div class="search-bar">
        <div class="search-input location">
          <i class="icon-location"></i>
          <input type="text"
                 [formControl]="locationControl"
                 [matAutocomplete]="auto"
                 placeholder="Enter location">
          <mat-autocomplete #auto="matAutocomplete">
            <mat-option *ngFor="let option of filteredLocations | async" [value]="option.name">
              {{option.name}}
            </mat-option>
          </mat-autocomplete>
        </div>
        
        <ng-container *ngIf="category === 'deals' || category === 'products'">
          <div class="search-input">
            <i class="icon-search"></i>
            <input type="text" placeholder="Product name">
          </div>
        </ng-container>

        <ng-container *ngIf="category !== 'deals' && category !== 'products'">
          <div class="search-input">
            <i class="icon-calendar"></i>
            <input [matDatepicker]="picker" 
                   [formControl]="dateControl"
                   placeholder="Select date"
                   (click)="picker.open()">
            <mat-datepicker #picker></mat-datepicker>
          </div>
          <div class="search-input time-input" clickOutside (clickOutside)="closeTimePopup()">
            <i class="icon-time"></i>
            <input type="text" 
                   [value]="displayTime"
                   readonly
                   (click)="toggleTimePopup($event)">
            
            <div class="time-popup" *ngIf="showTimePopup">
              <div class="time-options">
                <button class="time-option" 
                        [class.active]="selectedTimeOption === 'Any time'"
                        (click)="selectTimeOption('Any time')">
                  Any time
                </button>
                <button class="time-option"
                        [class.active]="selectedTimeOption === 'Morning'"
                        (click)="selectTimeOption('Morning')">
                  Morning
                </button>
                <button class="time-option"
                        [class.active]="selectedTimeOption === 'Afternoon'"
                        (click)="selectTimeOption('Afternoon')">
                  Afternoon
                </button>
                <button class="time-option"
                        [class.active]="selectedTimeOption === 'Evening'"
                        (click)="selectTimeOption('Evening')">
                  Evening
                </button>
              </div>
              
              <div class="time-range">
                <div class="range-input">
                  <label>From</label>
                  <select [(ngModel)]="fromTime" 
                          [disabled]="isTimeRangeDisabled()">
                    <option *ngFor="let time of timeOptions" [value]="time">{{time}}</option>
                  </select>
                </div>
                <div class="range-input">
                  <label>To</label>
                  <select [(ngModel)]="toTime" 
                          [disabled]="isTimeRangeDisabled()">
                    <option *ngFor="let time of timeOptions" [value]="time">{{time}}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </ng-container>

        <button class="search-button" (click)="onSearch()">Search</button>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 0 16px;

      &.navbar-search {
        max-width: none;
        padding: 0;
        
        .search-bar {
          background: #f5f5f5;
        }
      }
    }

    .search-bar {
      display: flex;
      gap: 16px;
      padding: 8px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);

      .search-input {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-right: 1px solid #dee2e6;
        background: white;
        border-radius: 4px;

        &.location {
          position: relative;

          input {
            width: 100%;
            padding: 8px 12px;
            border: none;
            outline: none;
            font-size: 14px;
            background: transparent;

            &::placeholder {
              color: #adb5bd;
            }
          }
        }

        &:last-of-type {
          border-right: none;
        }

        i {
          color: #6c757d;
          font-size: 18px;
          flex-shrink: 0;
        }

        input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 14px;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          background: transparent;

          &::placeholder {
            color: #adb5bd;
          }
        }

        select {
          border: none;
          outline: none;
          width: 100%;
          font-size: 14px;
          min-width: 0;
          background: transparent;
          cursor: pointer;
          color: #333;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 8px center;
          background-size: 16px;
          padding-right: 32px;
          transition: all 0.2s ease;

          &:hover {
            background-color: #f8f9fa;
          }

          &:focus {
            background-color: #f8f9fa;
            box-shadow: 0 0 0 2px rgba(136, 132, 216, 0.2);
          }

          &::-ms-expand {
            display: none;
          }

          option {
            color: #333;
            background: white;
            padding: 12px;
            font-size: 14px;
          }
        }
      }

      .search-button {
        padding: 12px 32px;
        background: #000;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;

        &:hover {
          background: #333;
        }
      }
    }

    @media (max-width: 768px) {
      .search-bar {
        flex-direction: column;
        gap: 8px;

        .search-input {
          border-right: none;
          border-bottom: 1px solid #eee;

          &:last-of-type {
            border-bottom: none;
          }
        }
      }
    }

    ::ng-deep {
      .mat-mdc-autocomplete-panel {
        background: white !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        margin-top: 8px !important;
        max-height: 240px !important;
        
        &::-webkit-scrollbar {
          width: 8px;
          background: transparent;
        }

        &::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 4px;
          
          &:hover {
            background: #ccc;
          }
        }

        &::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .mat-mdc-option {
          font-size: 14px;
          height: 40px;
          color: #333 !important;
          
          &:hover {
            background: rgba(136, 132, 216, 0.1) !important;
          }
          
          &.mat-mdc-option-active {
            background: rgba(136, 132, 216, 0.2) !important;
          }

          .mdc-list-item__primary-text {
            color: #333 !important;
          }
        }
      }

      .mat-mdc-form-field-infix {
        display: none;
      }

      .mat-datepicker-content {
        background: white !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;

        .mat-calendar {
          background: white !important;
        }

        .mat-calendar-body-cell-content {
          color: #333 !important;
        }

        .mat-calendar-body-label {
          color: #333 !important;
        }

        .mat-calendar-table-header {
          color: #333 !important;
        }

        .mat-calendar-table-header-divider {
          color: #333 !important;
        }

        .mat-calendar-period-button {
          color: #333 !important;
        }

        .mat-calendar-previous-button,
        .mat-calendar-next-button {
          color: #333 !important;
        }

        .mat-calendar-body-selected {
          background-color: #8884d8 !important;
          color: white !important;
        }

        .mat-calendar-body-today:not(.mat-calendar-body-selected) {
          border-color: #8884d8 !important;
        }

        .mat-calendar-arrow {
          fill: #333 !important;
        }

        .mat-calendar-body-cell:not(.mat-calendar-body-disabled):hover > .mat-calendar-body-cell-content:not(.mat-calendar-body-selected) {
          background-color: rgba(136, 132, 216, 0.1) !important;
        }

        .mat-calendar-controls {
          .mat-button-wrapper {
            color: #333 !important;
          }
        }
      }
    }

    .time-input {
      position: relative;
      
      input {
        cursor: pointer;
      }
    }

    .time-popup {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      width: 300px;
      margin-top: 8px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      padding: 16px;
      z-index: 1000;

      .time-options {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        margin-bottom: 16px;

        .time-option {
          padding: 6px 12px;
          min-width: 80px;
          border: none;
          border-radius: 20px;
          background: transparent;
          color: #666;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: rgba(136, 132, 216, 0.1);
          }

          &.active {
            background: #8884d8;
            color: white;
          }
        }
      }

      .time-range {
        display: flex;
        gap: 12px;

        .range-input {
          flex: 1;
          
          label {
            display: block;
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
          }

          select {
            width: 100%;
            padding: 6px 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            outline: none;
            cursor: pointer;
            font-size: 13px;

            &:focus {
              border-color: #8884d8;
            }

            &:disabled {
              background-color: #f5f5f5;
              cursor: not-allowed;
              opacity: 0.7;
            }
          }
        }
      }
    }

    .range-input {
      select {
        &:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
          opacity: 0.7;
        }
      }
    }
  `]
})
export class SearchBarComponent {
  @Input() isNavbar = false;
  @Input() category: string = 'services';

  locationControl = new FormControl('');
  dateControl = new FormControl('');
  filteredLocations: Observable<any[]>;

  showTimePopup = false;
  selectedTimeOption = 'Any time';
  selectedTime = '';
  fromTime = '9:00 AM';
  toTime = '5:00 PM';

  timeOptions = [
    '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM',
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
  ];

  locations = [
    { id: 'ny', name: 'New York, NY' },
    { id: 'la', name: 'Los Angeles, CA' },
    { id: 'ch', name: 'Chicago, IL' },
    { id: 'hs', name: 'Houston, TX' },
    { id: 'ph', name: 'Phoenix, AZ' },
    { id: 'pa', name: 'Philadelphia, PA' },
    { id: 'sa', name: 'San Antonio, TX' },
    { id: 'sd', name: 'San Diego, CA' },
    { id: 'dl', name: 'Dallas, TX' },
    { id: 'sj', name: 'San Jose, CA' }
  ];

  constructor() {
    this.filteredLocations = this.locationControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
  }

  private _filter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.locations.filter(location => 
      location.name.toLowerCase().includes(filterValue)
    );
  }

  toggleTimePopup(event: MouseEvent) {
    event.stopPropagation();
    this.showTimePopup = !this.showTimePopup;
  }

  closeTimePopup() {
    this.showTimePopup = false;
  }

  selectTimeOption(option: string) {
    this.selectedTimeOption = option;
    switch (option) {
      case 'Any time':
        this.selectedTime = '';
        this.fromTime = '';
        this.toTime = '';
        break;
      case 'Morning':
        this.fromTime = '6:00 AM';
        this.toTime = '12:00 PM';
        this.selectedTime = 'Morning';
        break;
      case 'Afternoon':
        this.fromTime = '12:00 PM';
        this.toTime = '6:00 PM';
        this.selectedTime = 'Afternoon';
        break;
      case 'Evening':
        this.fromTime = '6:00 PM';
        this.toTime = '12:00 AM';
        this.selectedTime = 'Evening';
        break;
    }
  }

  isTimeRangeDisabled(): boolean {
    return this.selectedTimeOption !== 'Any time' && this.selectedTimeOption !== 'Custom';
  }

  get displayTime() {
    if (!this.selectedTime) return 'Any time';
    if (this.selectedTimeOption === 'Any time') return 'Any time';
    if (this.selectedTimeOption !== 'Custom') {
      return `${this.fromTime} - ${this.toTime}`;
    }
    return `${this.fromTime} - ${this.toTime}`;
  }

  onSearch() {
    console.log('Searching...', {
      category: this.category,
      location: this.locationControl.value,
      date: this.dateControl.value
    });
  }
} 