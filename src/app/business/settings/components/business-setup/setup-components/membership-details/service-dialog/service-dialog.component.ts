import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ResponseDate } from 'src/app/app.component';
import { OrganizationServiceModel } from 'src/app/models/organization';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';

@Component({
  selector: 'app-service-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './service-dialog.component.html',
  styleUrl: './service-dialog.component.scss'
})
export class ServiceDialogComponent {

  services: OrganizationServiceModel[] = [];

  selected: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<ServiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private orgService: OrganizationServiceService
  ) {
    this.selected = [...data.selected];
    this.getOrganizationService();
  }

  returnSelectedServices() {
    let selectedService:OrganizationServiceModel[]= [];
    this.orgServiceMap.forEach(services => {
      services.forEach(service => {
        if (service.checked) {
          selectedService.push(service);
        }
      });
    });
    this.dialogRef.close(selectedService);
  }


  selectedCount: number = 0;
  selectedTotal: number = 0;

  onSelectionChange() {
    let count = 0;
    let total = 0;

    this.orgServiceMap.forEach(services => {
      services.forEach(service => {
        if (service.checked) {
          count++;
          total += service.defaultPrice ?? 0;
        }
      });
    });

    this.selectedCount = count;
    this.selectedTotal = total;
  }

  isSelected(service: any) {
    return this.selected.some(s => s.id === service.id);
  }

  toggleSelection(service: any) {
    if (this.isSelected(service)) {
      this.selected = this.selected.filter(s => s.id !== service.id);
    } else {
      this.selected.push(service);
    }
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.selected);
  }


  orgServiceMap: Map<string, OrganizationServiceModel[]> = new Map();

  getOrganizationService() {
    this.orgService.getOrgService().subscribe({
      next: (res: ResponseDate) => {
        this.services = res.data;
        // Clear existing map before repopulating
        this.orgServiceMap.clear();

        this.services.forEach((service: OrganizationServiceModel) => {
          const key = service.industrySegment?.name ?? "Unknown"; // use name as key

          if (!this.orgServiceMap.has(key)) {
            this.orgServiceMap.set(key, []);
          }
          service.checked = false;
          this.orgServiceMap.get(key)!.push(service);
        });

        console.log(this.orgServiceMap);
      },
      error: (err: any) => {

      }
    })
  }
}
