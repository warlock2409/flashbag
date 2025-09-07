import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateDealDialogComponent } from './create-deal-dialog/create-deal-dialog.component';

@Component({
  selector: 'app-consignment',
  templateUrl: './consignment.component.html',
  styleUrls: ['./consignment.component.scss'],
  standalone:false
})
export class ConsignmentComponent {
  deals = [
    { id: 1, productName: 'iPhone 13', units: 5, date: new Date('2024-03-15'), status: 'Active' },
    { id: 2, productName: 'Samsung TV', units: 2, date: new Date('2024-03-14'), status: 'Pending' },
    { id: 3, productName: 'Nike Shoes', units: 10, date: new Date('2024-03-13'), status: 'Active' }
  ];

  displayedColumns: string[] = ['id', 'productName', 'units', 'date', 'status', 'actions'];

  constructor(private dialog: MatDialog) {}

  openCreateDealDialog(): void {
    const dialogRef = this.dialog.open(CreateDealDialogComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle the new deal
        console.log('New deal:', result);
      }
    });
  }
} 