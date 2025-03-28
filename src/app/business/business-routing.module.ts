import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CustomersComponent } from './customers/customers.component';
import { BusinessLayoutComponent } from './business-layout/business-layout.component';
import { ConsignmentComponent } from './consignment/consignment.component';
import { OrdersComponent } from './orders/orders.component';
import { BusinessGuard } from '../guards/business.guard';
import { BusinessRequestsComponent } from './business-requests/business-requests.component';

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
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessRoutingModule { } 