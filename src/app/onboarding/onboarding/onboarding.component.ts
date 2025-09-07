import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { AuthService, StaffDTO, StaffType } from 'src/app/services/auth.service';
import { ResponseDate } from 'src/app/app.component';
import { MasterService } from 'src/app/services/master.service';
import { SweatAlertService } from 'src/app/services/sweat-alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatStepperModule, FormsModule, CommonModule, MatCheckboxModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss'
})
export class OnboardingComponent {

  registrationForm !: FormGroup;

  isBusinessAccountCreated = true;
  isBusinessActivityUpdated = false;
  businessModels: any = [];

  organization: any = null;

  constructor(private router: Router, private fb: FormBuilder, private authService: AuthService, private orgService: MasterService, private sweatAlert: SweatAlertService) { }

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      businessDetails: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        company: ['', Validators.required],
        phone: ['', Validators.required],
        visitors: [0, [Validators.required, Validators.min(0)]],
        termsAccepted: [false, Validators.requiredTrue]
      }),
      accountDetails: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required]
      }, { validators: this.passwordMatchValidator })
    });
  }

  passwordMatchValidator(group: FormGroup): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  submitRegistration() {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched(); // This will trigger all validation messages
      return;
    }

    let staffDto = this.getOrganizationNewUser();

    this.authService.registerOrganization(staffDto).subscribe({
      next: (res: ResponseDate) => {
        if (res.status == 200) {
          this.organization = res.data.organizationDto;
          this.getAllBusinessModels();
          this.isBusinessAccountCreated = false;
          this.isBusinessActivityUpdated = true;
        }
      }, error: (err: any) => {
        console.log(err);
      }
    })
  }

  submitBusinessActivities() {
    let selectedModelIds = this.businessModels
      .filter((model: any) => model.checked)
      .map((model: any) => model.id);

    this.orgService.addOrRemoveModel(selectedModelIds, this.organization.code).subscribe({
      next: (res: ResponseDate) => {
        this.authService.isAuthenticated.next(true);

        if (this.authService.isBusiness()) {
          this.router.navigate(['/business/home']);
        }
      }, error: (err: any) => {
      }
    })
  }

  getAllBusinessModels() {
    this.orgService.getAllBusinessModel().subscribe({
      next: (res: ResponseDate) => {
        if (res.data != null) {
          this.businessModels = res.data.filter((model: any) => model.active)
            .map((model: any) => ({
              ...model,
              checked: false
            }))
        }
      }, error: (err: any) => {
        console.log(err);
      }
    })
  }

  getOrganizationNewUser(): any {
    const formValue = this.registrationForm.value;

    const staffDto: StaffDTO = {
      staffType: StaffType.OWNER,
      userDto: {
        firstName: formValue.businessDetails.firstName,
        lastName: formValue.businessDetails.lastName,
        email: formValue.accountDetails.email,
        phone: formValue.businessDetails.phone,
        password: formValue.accountDetails.password,
      },
      organizationDto: {
        name: formValue.businessDetails.company,
        visitors: formValue.businessDetails.visitors,
        email: formValue.accountDetails.email,
        termAccepted: formValue.businessDetails.termsAccepted,
        status: 'PENDING',
      }
    };

    return staffDto;

  }

}
