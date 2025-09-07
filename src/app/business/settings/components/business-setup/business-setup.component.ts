import { AsyncPipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Observable, startWith, map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
@Component({
  selector: 'app-business-setup',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe, MatButtonModule, MatSidenavModule,
    NzButtonModule,
    NzMenuModule,
    RouterOutlet, MatChipsModule, CommonModule

  ],
  templateUrl: './business-setup.component.html',
  styleUrl: './business-setup.component.scss'
})
export class BusinessSetupComponent {
  constructor(private router: Router, private route: ActivatedRoute, private organizationService: OrganizationServiceService) {
  }

  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }

  buffer = false;
  selectedFilter = '';
  filters: any[] = [];

  ngOnInit() {

    // GET ORG BUSINESS MODEL 
    this.getOrganizationBusinessModel();
  }

  getOrganizationBusinessModel() {

    // let key = localStorage.getItem("orgCode")

    // this.organizationService.getBusinessModel(key == null ? " " : key).subscribe({
    //   next: (res: any) => {
    //     console.log(res);
    //     this.filters = res.data.businessModels;
    //     if (this.filters.length > 0) {
    //       this.onFilterChange(this.filters[0].name)
    //     }
    //   },
    //   error: () => {

    //   }
    // })
  }

  showFiller = true;



  navigateTo(path: string, ...params: [string, any][]): void {
    const queryParams = params.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as any);

    this.router.navigate([path], {
      relativeTo: this.route,
      queryParams
    });
  }

  onFilterChange(filter: string) {
    this.buffer = true;
    this.selectedFilter = filter;
    if (filter) {
      this.router.navigate(['./locations'], { relativeTo: this.route, queryParams: { model: filter } });
    }
  }

}
