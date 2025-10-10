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
import { BusinessDetailsComponent } from './settings/components/business-setup/setup-components/business-details/business-details.component';
import { LocationComponent } from './settings/components/business-setup/setup-components/location/location.component';
import { MembershipDetailsComponent } from './settings/components/business-setup/setup-components/membership-details/membership-details.component';
import { RentalDetailsComponent } from './settings/components/business-setup/setup-components/rental-details/rental-details.component';
import { MarketingComponent } from './marketing/marketing.component';
import { SelectOrganizationComponent } from './pages/select-organization/select-organization.component';
import { ServiceDetailsComponent } from './settings/components/business-setup/setup-components/service-details/service-details.component';
import { GymCheckInComponent } from './business-specific/gym-check-in/gym-check-in.component';
import { ExercisePlanComponent } from './settings/components/business-setup/setup-components/exercise-plan/exercise-plan.component';

const routes: Routes = [
  {
    path: '',
    component: BusinessLayoutComponent,
    canActivateChild: [BusinessGuard],
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
        path: 'marketing',
        component: MarketingComponent
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
        path: 'gym-checkin',
        component: GymCheckInComponent
      },
      {
        path: 'settings',
        component: SettingsPlaceholderComponent,
        children: [
          {
            path: "",
            component: SettingsComponent
          },
          {
            path: 'business-setup',
            component: BusinessSetupComponent,
            children: [
              {
                path: "organization-details",
                component: BusinessDetailsComponent
              },
              {
                path: "details",
                component: BusinessDetailsComponent
              },
              {
                path: "locations",
                component: LocationComponent
              },
              {
                path: "service",
                component: ServiceDetailsComponent
              },
              {
                path: "membership",
                component: MembershipDetailsComponent
              },
              {
                path: "rental",
                component: RentalDetailsComponent
              },
              {
                path: "exercisePlan",
                component: ExercisePlanComponent
              }
            ]
          }
        ]
      },
    ]
  },
  {
    path: 'pick-organization',
    component: SelectOrganizationComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessRoutingModule { } 