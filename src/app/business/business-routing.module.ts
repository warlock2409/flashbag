import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CustomersComponent } from './customers/customers.component';
import { BusinessLayoutComponent } from './business-layout/business-layout.component';
import { ConsignmentComponent } from './consignment/consignment.component';
import { OrdersComponent } from './orders/orders.component';
import { BusinessGuard } from '../guards/business.guard';
import { BusinessRequestsComponent } from './business-requests/business-requests.component';
import { SettingsComponent } from './settings/settings.component';
import { BusinessSetupComponent } from './settings/components/business-setup/business-setup.component';
import { SettingsPlaceholderComponent } from './settings/settings-placeholder/settings-placeholder.component';

const routes: Routes = [
  {
    path: '',
    component: BusinessLayoutComponent,
    canActivate: [BusinessGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'customers',
        component: CustomersComponent
      },
      {
        path: 'consignment',
        component: ConsignmentComponent
      },
      {
        path: 'orders',
        component: OrdersComponent
      },
      {
        path: 'requests',
        component: BusinessRequestsComponent
      },
      {
        path: 'settings',
        component: SettingsPlaceholderComponent,
        children: [
          {
            path:"",
            component:SettingsComponent
          },
          {
            path: 'business-setup',
            component: BusinessSetupComponent
          }
        ]
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessRoutingModule { } 