import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatSidenavContainer } from '@angular/material/sidenav';

@Component({
  selector: 'app-business-layout',
  templateUrl: './business-layout.component.html',
  styleUrls: ['./business-layout.component.scss'],
  standalone:false
})
export class BusinessLayoutComponent {
  isExpanded = false;

  constructor(private cdr: ChangeDetectorRef) {}

  @ViewChild(MatSidenavContainer) sidenavContainer!: MatSidenavContainer;

  toggleSidenav() {
    this.isExpanded = !this.isExpanded;

    // Adjust layout margins after toggle
    setTimeout(() => {
      this.sidenavContainer.updateContentMargins();
    }, 0);
  }
  
} 