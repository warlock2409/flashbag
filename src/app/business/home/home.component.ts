import { Component, inject } from '@angular/core';
import { PosComponent } from '../components/pos/pos.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false
})
export class HomeComponent {
  dialog = inject(MatDialog);
  constructor() {
  }

  openPos() {
    const dialogRef = this.dialog.open(PosComponent, {
      width: '100%',
      maxWidth: '100vw', // override default 80vw
      height: '100%',
      panelClass: 'full-screen-dialog',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
} 