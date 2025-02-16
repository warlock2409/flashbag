import { Component } from '@angular/core';

@Component({
  selector: 'app-business-layout',
  templateUrl: './business-layout.component.html',
  styleUrls: ['./business-layout.component.scss']
})
export class BusinessLayoutComponent {
  isExpanded = false;

  toggleSidenav() {
    this.isExpanded = !this.isExpanded;
  }
} 