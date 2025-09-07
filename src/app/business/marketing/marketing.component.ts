import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { AddCustomerComponent } from '../components/add-customer/add-customer.component';
import { MatDialog } from '@angular/material/dialog';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { ResponseDate } from 'src/app/app.component';
import * as XLSX from 'xlsx';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CampaignDialogComponent } from './components/campaign-dialog/campaign-dialog.component';

@Component({
  selector: 'app-marketing',
  standalone: false,
  templateUrl: './marketing.component.html',
  styleUrl: './marketing.component.scss'
})
export class MarketingComponent {

  private _snackBar = inject(NzMessageService);
  orgService = inject(OrganizationServiceService);

  constructor(public dialog: MatDialog) { }

  ngAfterViewInit() {
    this.handleValueChange("import");
    this.getCustomerCountByOrg();
  }

  options = ["Campaigns", "Import", "Usage", "Templates"];
  activeSegment = "";
  totalCustomer = 0;

  addCustomerMannually(): void {
    const dialogRef = this.dialog.open(AddCustomerComponent, {
      data: {}, minWidth: "360px"
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  getCustomerCountByOrg() {
    this.orgService.getCustomerCountByOrg().subscribe({
      next: (res: ResponseDate) => {
        this.totalCustomer = res.data
      },
      error: (err: any) => {

      }
    })
  }


  createCampaign() {
    const dialogRef = this.dialog.open(CampaignDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  marketingCount = 100;
  utilityCount = 200;

  get totalMessages(): number {
    return this.marketingCount + this.utilityCount;
  }

  get marketingPercentage(): number {
    return this.totalMessages > 0 ? (this.marketingCount / this.totalMessages) * 100 : 0;
  }

  get utilityPercentage(): number {
    return this.totalMessages > 0 ? (this.utilityCount / this.totalMessages) * 100 : 0;
  }

  handleValueChange($event: any) {
    console.log($event);
    if ($event != this.activeSegment) {
      this.activeSegment = $event;
    }
  }

  // Spread sheet parsing

  parsedData: any[] = [];
  @ViewChild('fileInput') fileInput!: ElementRef;

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const binaryStr: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName: string = workbook.SheetNames[0];
      const sheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

      const rawData = XLSX.utils.sheet_to_json(sheet);
      this.parsedData = this.cleanData(rawData);
    };

    reader.readAsArrayBuffer(file);
  }

  isUploading = false;
  fileName = "";
  currentIndex = 0;

  clearFile(): void {
    this.parsedData = [];
    this.fileInput.nativeElement.value = ''; // reset input
  }

  uploadCustomers() {
    let data = this.parsedData;
    const batchSize = 10;
    this.currentIndex = 0;
    this.isUploading = true;

    const sendNext = () => {
      if (this.currentIndex >= data.length) {
        console.log('✅ All data sent in batches.');
        this.currentIndex = 0;
        this.fileName = "";
        this.isUploading = false;
        this._snackBar.success("Customer Export Completed");
        this.clearFile();
        this.getCustomerCountByOrg();
        return;
      }

      const currentBatch = data.slice(this.currentIndex, this.currentIndex + batchSize);
      this.orgService.uploadCustomes(currentBatch).subscribe({
        next: (res: ResponseDate) => {
          this.currentIndex += batchSize;
          sendNext(); // send next batch only after this one finishes
        },
        error: (err: any) => {
          this.currentIndex += batchSize;
          sendNext(); // optionally continue even on error
        }
      });
    };

    sendNext();
  }

  cleanData(data: any[]): any[] {
    return data
      .filter(row => row.name || row.email || row.phone) // remove blank rows
      .map(row => ({
        firstName: (row.first_name || '').trim(),
        email: (row.email || '').trim().toLowerCase(),
        contactNumber: (row.phone || '').toString().trim(),
      }));
  }

}
