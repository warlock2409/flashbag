import { Component, inject, model, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ServiceDialogComponent } from '../service-dialog/service-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { Industry } from 'src/app/models/business.model';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { ShopModel } from 'src/app/models/shop.model';
import { ResponseDate } from 'src/app/app.component';
import { MembershipBenefit, OrganizationMembershipPlan, OrganizationServiceModel } from 'src/app/models/organization';

// Interface for exercise day
export interface Todo {
  id?: number;
  order: number;
  taskDtoList: BodyPart[];
}

// Interface for body part object
interface BodyPart {
  id?: number;
  title: string;
}

// Interface for body filter (copied from exercise-plan.component.ts)
interface BodyFilter {
  key: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-membership-actions',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatDialogModule, CommonModule, FormsModule, MatStepperModule],
  templateUrl: './membership-actions.component.html',
  styleUrl: './membership-actions.component.scss'
})
export class MembershipActionsComponent {

  readonly dialogRef = inject(MatDialogRef<MembershipActionsComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  industries: Industry[] = [];
  shops: ShopModel[] = [];
  membershipPlan!: OrganizationMembershipPlan;
  @ViewChild('stepper') stepper!: MatStepper;

  // Body filters copied from exercise-plan.component.ts
  modelFilters: BodyFilter[] = [
    { key: "", name: "All", icon: "directions_walk" },
    { key: "calves", name: "Calves", icon: "directions_walk" },
    { key: "quads", name: "Quads", icon: "fitness_center" },
    { key: "abdominals", name: "Abs", icon: "self_improvement" },
    { key: "obliques", name: "Obliques", icon: "accessibility_new" },
    { key: "hands", name: "Hands", icon: "pan_tool" },
    { key: "forearms", name: "Forearms", icon: "back_hand" },
    { key: "biceps", name: "Biceps", icon: "arm_flex" },
    { key: "front_shoulders", name: "Front Shoulders", icon: "accessibility" },
    { key: "chest", name: "Chest", icon: "sports_mma" },
    { key: "traps", name: "Traps", icon: "change_history" },
    { key: "body", name: "Full Body", icon: "accessibility" },
    { key: "hamstrings", name: "Hamstrings", icon: "directions_run" },
    { key: "lats", name: "Lats", icon: "sports_kabaddi" },
    { key: "traps_middle", name: "Traps", icon: "height" },
    { key: "lowerback", name: "Lower Back", icon: "airline_seat_recline_extra" },
    { key: "rear_shoulders", name: "Rear Shoulders", icon: "person" }
  ];

  // temp 
  benefitType = 'DURATION_ACCESS';
  days = '0';

  // Exercise mapping data
  exerciseDays: Todo[] = [];

  initializePlan(existingPlan: OrganizationMembershipPlan): void {
    this.membershipPlan = {
      name: '',
      basePrice: 0,
      description: '',
      challengeBased: false,
      industryId: 0,
      benefits: [],
      shopIds: []
    };
    if (existingPlan) {
      console.log(existingPlan);

      this.membershipPlan = {
        id: existingPlan.id,
        name: existingPlan.name ?? '',
        basePrice: existingPlan.basePrice ?? 0,
        description: existingPlan.description ?? '',
        challengeBased: existingPlan.challengeBased ?? false,
        industryId: existingPlan.industryId ?? 0,
        benefits: existingPlan.benefits ? [...existingPlan.benefits] : [],
        shopIds: existingPlan.shopIds ? [...existingPlan.shopIds] : []
      };

      let durationBenefit = existingPlan.benefits
        .filter(benefit => benefit.benefitType === 'DURATION_ACCESS')
        .reduce((max, current) =>
          current.accessDurationInDays! > (max?.accessDurationInDays ?? 0) ? current : max,
          null as any
        );

      if (durationBenefit) {
        this.days = durationBenefit.accessDurationInDays ? durationBenefit.accessDurationInDays?.toString() : "0";
      }

      this.selectedServices = existingPlan.benefits;
    }
  }

  constructor(private dialog: MatDialog, private orgService: OrganizationServiceService) {

  }

  closeDialog() {
    this.dialogRef.close();
  }

  isLastButOneStep(): boolean {
    let result = false;
    setTimeout(() => {
      result = this.stepper.selectedIndex === (this.stepper.steps.length - 2);
    });
    return result;
  }


  validateMembershipDetails() {
    if (this.selectedServices.length < 1) {
      return;
    }
    this.loadShopsByActiveService();

    const currentIndex = this.stepper.selectedIndex;
    this.stepper.next();

    // Check if we're moving to the 3rd step (Exercise Mapping)
    if (currentIndex === 1 && this.stepper.selectedIndex === 2) {
      // Only call API if we're editing an existing membership
      if (this.data.isUpdate && this.membershipPlan.id) {
        this.onMoveToExerciseMappingStep(this.membershipPlan.id);
      }
    }
  }

  stepperPrev() {
    this.stepper.previous();
  }

  stepperNext() {
    const currentIndex = this.stepper.selectedIndex;
    this.stepper.next();

    // Check if we're moving to the 3rd step (Exercise Mapping)
    if (currentIndex === 1 && this.stepper.selectedIndex === 2) {
      // Only call API if we're editing an existing membership
      if (this.data.isUpdate && this.membershipPlan.id) {
        this.onMoveToExerciseMappingStep(this.membershipPlan.id);
      }
    }
  }

  // Method to call API when moving to the 3rd stepper (Exercise Mapping)
  onMoveToExerciseMappingStep(id: number) {
    this.orgService.getTodos(id, 'MEMBERSHIP').subscribe({
      next: (response: ResponseDate) => {
        console.log('API response:', response);
        
        // Map the response data to exerciseDays format using only title and including IDs when they exist
        this.exerciseDays = response.data.map((day: any) => {
          return {
            id: day.id ?? undefined, // Include day ID if it exists
            order: day.order,
            taskDtoList: day.taskDtoList.map((task: any) => {
              return {
                id: task.id ?? undefined, // Include task ID if it exists
                title: task.title || 'Select Body Part'
              };
            })
          };
        });
        
        console.log('Mapped exerciseDays:', this.exerciseDays);
      },
      error: (error: any) => {
        console.error('API error:', error);
        // Initialize with default empty days if API fails
        this.exerciseDays = [];
        this.addDay();
      }
    });
  }

  ngOnInit() {
    this.getOrgIndustry();
    this.initializePlan(this.data.existingPlan);
    this.addDay();
  }

  loadShopsByActiveService() {
    let serviceKey = this.selectedServices.map(service => service.serviceKey);

    this.orgService.getOrgShopsByActiveService(serviceKey).subscribe({
      next: (res: ResponseDate) => {
        this.shops = res.data.map((shop: ShopModel) => ({
          ...shop,
          checked: this.membershipPlan?.shopIds?.includes(shop.id!) ?? false
        }));
      },
      error: (err: any) => {

      }
    })

  }

  getOrgIndustry() {
    this.orgService.getOrgIndustryByShop().subscribe({
      next: (res: any) => {
        this.industries = res.data;
      },
      error: (err: any) => {

      }
    })
  }

  selectedServices: OrganizationServiceModel[] | MembershipBenefit[] = [];

  openServiceDialog() {
    console.log(this.membershipPlan);
    if (!this.membershipPlan.industryId) {
      return;
    }

    const dialogRef = this.dialog.open(ServiceDialogComponent, {
      width: '600px',
      data: { selected: this.selectedServices, isUpdate: this.data.isUpdate, industryId: this.membershipPlan.industryId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result, "openServiceDialog");

        this.selectedServices = result;
      }
    });
  }

  // Exercise mapping methods
  addDay() {
    const newDay: Todo = {
      order: this.exerciseDays.length + 1,
      taskDtoList: [{ title: 'Select Body Part' }] // Start with one empty body part selection
    };
    this.exerciseDays.push(newDay);
  }

  addBodyPartToDay(dayIndex: number) {
    // Add a unique empty body part object for each new body part to avoid binding issues
    this.exerciseDays[dayIndex].taskDtoList.push({ title: 'Select Body Part' });
  }

  removeDay(index: number) {
    this.exerciseDays.splice(index, 1);
    // Re-number the days
    this.exerciseDays.forEach((day, i) => day.order = i + 1);
  }

  removeBodyPart(dayIndex: number, bodyPartIndex: number) {
    this.exerciseDays[dayIndex].taskDtoList.splice(bodyPartIndex, 1);
  }

  // Handle body part selection change
  onBodyPartChange(dayIndex: number, bodyPartIndex: number, event: any) {
    const selectedTitle = event.target.value;
    // Update the body part object
    this.exerciseDays[dayIndex].taskDtoList[bodyPartIndex] = { title: selectedTitle };
  }

  // TrackBy function to help Angular track items properly
  trackByIndex(index: number, item: any): any {
    return index;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  // 
  createMembership() {
    this.membershipPlan.benefits = this.selectedServices.map(service => ({
      benefitType: this.benefitType,     // from variable
      days: Number(this.days),                 // from variable
      serviceKey: service.serviceKey!     // from selected service
    }));

    this.membershipPlan.shopIds = this.shops.filter(shop => shop.checked).map(shop => shop.id!);

    console.log(this.membershipPlan);

    this.orgService.createOrgMembership(this.membershipPlan).subscribe({
      next: async (res: ResponseDate) => {
        console.log(res.data);
        try {
          await this.createExerciseTodo(this.exerciseDays, res.data.id);
        } catch (error) {
          console.error('Failed to create exercise todos', error);
        }
        this.dialogRef.close(res.data);
      },
      error: (err: any) => {
      }
    })
  }

  createExerciseTodo(exerciseDays: Todo[], membershipId: number): Promise<void> {
    // Transform exerciseDays to include IDs when they exist
    const transformedDays = exerciseDays.map(day => {
      return {
        ...day,
        id: day.id ?? undefined, // Include day ID if it exists
        taskDtoList: day.taskDtoList.map(task => {
          return {
            ...task,
            id: task.id ?? undefined, // Include task ID if it exists
            title: task.title
          };
        })
      };
    });

    return new Promise((resolve, reject) => {
      this.orgService.createTodos(transformedDays, membershipId, 'MEMBERSHIP').subscribe({
        next: (res: ResponseDate) => {
          console.log(res.data);
          resolve();
        },
        error: (err: any) => {
          console.error('Error creating exercise todos', err);
          reject(err);
        }
      });
    });
  }

  updateMembership() {
    this.membershipPlan.benefits = this.selectedServices.map(service => ({
      benefitType: this.benefitType,     // from variable
      days: Number(this.days),                 // from variable
      serviceKey: service.serviceKey!     // from selected service
    }));

    this.membershipPlan.shopIds = this.shops.filter(shop => shop.checked).map(shop => shop.id!);

    console.log(this.membershipPlan);

    this.orgService.updateOrgMembership(this.membershipPlan, this.membershipPlan.id).subscribe({
      next: async (res: ResponseDate) => {
        try {
          await this.createExerciseTodo(this.exerciseDays, res.data.id);
        } catch (error) {
          console.error('Failed to create exercise todos', error);
        }
        this.dialogRef.close(res.data);
      },
      error: (err: any) => {
      }
    })
  }
}