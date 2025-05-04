import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessRoutingModule } from './business-routing.module';
import { HomeComponent } from './home/home.component';
import { CustomersComponent } from './customers/customers.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BusinessLayoutComponent } from './business-layout/business-layout.component';
import { ConsignmentComponent } from './consignment/consignment.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { CreateDealDialogComponent } from './consignment/create-deal-dialog/create-deal-dialog.component';
import { OrdersComponent } from './orders/orders.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { BusinessRequestsComponent } from './business-requests/business-requests.component';
import { ApprovalDialogComponent } from './business-requests/approval-dialog/approval-dialog.component';
import { RequestDetailsDialogComponent } from './business-requests/request-details-dialog/request-details-dialog.component';
import { SettingsComponent } from './settings/settings.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { SidePanelComponent } from '../components/shared/side-panel/side-panel.component';
@NgModule({
  declarations: [
    HomeComponent,
    BusinessLayoutComponent,
    CustomersComponent,
    ConsignmentComponent,
    CreateDealDialogComponent,
    OrdersComponent,
    SettingsComponent,
  ],
  imports: [
    CommonModule,
    BusinessRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatExpansionModule,
    BusinessRequestsComponent,
    ApprovalDialogComponent,
    RequestDetailsDialogComponent,
    MatProgressBarModule,
    SidePanelComponent
  ],
})
export class BusinessModule { } 