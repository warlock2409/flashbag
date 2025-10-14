import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OrganizationDTO, UserDto } from 'src/app/services/auth.service';

@Component({
  selector: 'app-select-organization',
  standalone: true,
  imports: [],
  templateUrl: './select-organization.component.html',
  styleUrl: './select-organization.component.scss'
})
export class SelectOrganizationComponent {
  user!: UserDto;

  constructor(private router: Router,) {
    const storageCurrentUser = localStorage.getItem('currentUser');
    if (storageCurrentUser) {
      this.user = JSON.parse(storageCurrentUser);
      if(this.user.organizationDto ?.length == 1){
        this.organizationSelected(this.user.organizationDto[0]);
      }
    }
  }

  organizationSelected(org: OrganizationDTO) {
    localStorage.setItem('orgCode', org.code!);
    this.router.navigate(['/business/home']);
  }

}
