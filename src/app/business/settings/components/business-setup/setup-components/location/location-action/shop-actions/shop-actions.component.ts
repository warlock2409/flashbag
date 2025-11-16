import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { Component, Inject, inject, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import moment from 'moment';

import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { en_US, NzI18nService } from 'ng-zorro-antd/i18n';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { ResponseDate } from 'src/app/app.component';
import { BusinessModel, Industry, OperationType } from 'src/app/models/business.model';
import { AddressModel, ShopHoursModel, ShopModel } from 'src/app/models/shop.model';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { DocumentDto, UploadFile, UploadMediaComponent } from "src/app/components/upload-media/upload-media.component";
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SweatAlertService } from 'src/app/services/sweat-alert.service';
import { UppyUploadComponent } from "src/app/components/uppy-upload/uppy-upload.component";
import { c } from "../../../../../../../../../../node_modules/@angular/cdk/a11y-module.d-DBHGyKoh";
import { MatCardTitle } from "@angular/material/card";
import { MasterService } from 'src/app/services/master.service';
declare const lottie: any;

export interface SessionForm {
  id: FormControl<number | null>;
  start: FormControl<string | null>;
  end: FormControl<string | null>;
  operation: FormControl<OperationType>;
}

@Component({
  selector: 'app-shop-actions',
  standalone: true,
  imports: [
    FormsModule, NzCardModule, NzImageModule,
    NzButtonModule, NzPopoverModule, CommonModule,
    MatButtonModule, NzAvatarModule,
    NzRateModule, NzSegmentedModule, MatCheckboxModule, NzTimePickerModule, MatIcon, NzInputModule, NzSelectModule, MatStepperModule,
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule, MatSelectModule, MatTooltipModule,
    UploadMediaComponent,
    UppyUploadComponent,
    MatCardTitle
  ],
  templateUrl: './shop-actions.component.html',
  styleUrl: './shop-actions.component.scss'
})
export class ShopActionsComponent {

  updateShopStatus(shopCode: string) {

    this.orgApiService.getOrganizationDetails().subscribe({
      next: (res: ResponseDate) => {
        if (res.data && res.data.organizationPlan && res.data.organizationPlan.bucketDtos) {
          const buckets = res.data.organizationPlan.bucketDtos;

          // Find the LOCATION bucket
          const locationBucket = buckets.find(
            (b: any) => b.type === 'LOCATION'
          );

          if (locationBucket && !this.currentShop.active) {
            const available = locationBucket.allocated - locationBucket.used;

            if (available > 0) {
              console.log('✅ You have free locations available:', available);
            } else {
              console.warn('❌ No free location slots left.');
              this.sweatAlert.error("Upgrade Plan Make this shop online");
              return;
            }
          }

          this.orgApiService.toggleVisibility(shopCode).subscribe({
            next: (res: ResponseDate) => {
              this.currentShop = res.data;
              this.changeLoader();
              this.dialogRef.close();
              if (this.currentShop.active) {
                this.sweatAlert.success("Hurray! Your shop is now ready to receive online orders.", 2500);
              } else {
                this.sweatAlert.success("Your Shop is offline", 2500);
              }
            },
            error: (err: any) => {
              this.changeLoader();
              this.dialogRef.close();
              this.sweatAlert.error("Failed to complete the action. We’ve informed our team. Please try again later.");
              this.sweatAlert.alertTeam("Location", "updateShopStatus", "Error", JSON.stringify(err));
            }
          })
        }
      },
      error: (err: any) => {
        console.error('Error fetching organization details', err);
      }
    });
  }


  closeDialog() {
    this.dialogRef.close();
  }

  buffer = false;
  isLinear = false;
  loading = false;
  @ViewChild('stepper') stepper!: MatStepper;
  private _formBuilder = inject(FormBuilder);
  newDocument: DocumentDto | null = null;

  fallback = 'data:image/png;base64,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';

  constructor(private i18n: NzI18nService, private orgApiService: OrganizationServiceService,
    private dialogRef: MatDialogRef<ShopActionsComponent>, private sweatAlert: SweatAlertService, private masterService: MasterService,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.i18n.setLocale(en_US);
    const daysOfWeek: string[] = [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY'
    ];
    daysOfWeek.forEach(day => this.days.push(this.newDay(day)));
    this.getOrgBusinessModel();
  }

  ngOnInit(): void {
    // Subscriptions
    this.shopBasic.get('primaryModel')?.valueChanges.subscribe(selectedModel => {
      this.onBusinessModelChange(selectedModel!);
      if (selectedModel) {
        console.log(selectedModel.name.toUpperCase());

        this.taxModels.push(this.createTaxConfig(selectedModel.name.toUpperCase()));
        console.log(this.taxDefaults.get('model'));
      }
    });
  }

  getOrgBusinessModel() {
    this.loading = true;
    this.orgApiService.getActiveBusinessModels().subscribe({
      next: (res: ResponseDate) => {
        this.businessModels = res.data;
        if (this.businessModels.length == 0) {
          this.getAllBusinessModels();
        }
        if (this.data.shop != null) {
          this.loadShopBasic(this.data.shop);
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
      }
    })
  }

  submitBusinessActivities() {
    let selectedModelIds = this.allBusinessModels
      .filter((model: any) => model.checked)
      .map((model: any) => model.id);

    let orgCode = localStorage.getItem("orgCode");

    this.masterService.addOrRemoveModel(selectedModelIds, orgCode).subscribe({
      next: (res: ResponseDate) => {
        this.sweatAlert.success("Updated");
        this.getOrgBusinessModel();
      }, error: (err: any) => {
        this.sweatAlert.success("Updated");
      }
    })
  }

  getAllBusinessModels() {
    this.masterService.getAllBusinessModel().subscribe({
      next: (res: ResponseDate) => {
        if (res.data != null) {
          this.allBusinessModels = res.data.filter((model: any) => model.active)
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

  sampleUploads: DocumentDto | null = null;


  businessModels: BusinessModel[] = [];
  allBusinessModels: any[] = [];
  industries: Industry[] = [];
  currentShop!: ShopModel;
  currentShopAddress!: AddressModel;

  shopBasic = this._formBuilder.group({
    shopName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    primaryModel: [null as BusinessModel | null, Validators.required],
    businessIndustry: [null as Industry | null, Validators.required],
    secondaryModels: this._formBuilder.array([])
  });


  loadShopBasic(data: any) {
    console.log(data);
    this.currentShop = data;
    let modelObj = this.businessModels.find(m => m.id === data.primaryModel.id)!;
    this.industries = modelObj.industryDtoList!;
    const industryObj = this.industries.find(i => i.id === data.primaryIndustry.id);

    this.shopBasic.patchValue({
      shopName: data.name,
      email: data.email,
      phone: data.contactNumber,
      primaryModel: modelObj,
      businessIndustry: industryObj
    });

    this.sampleUploads = data.documentDto ? { ...data.documentDto } : null;


    let addressDto = data.addressDto;

    this.addressGroup.patchValue({
      address1: addressDto.addressLine1,
      address2: addressDto.addressLine2,
      city: addressDto.city,
      state: addressDto.state,
      postalCode: addressDto.postalCode,
      country: addressDto.country,
      latitude: addressDto.latitude,
      longitude: addressDto.longitude
    });

    this.currentShopAddress = addressDto;

    const secondaryModelsArray = this.shopBasic.get('secondaryModels') as FormArray;
    secondaryModelsArray.clear();

    (data.secondaryModels || []).forEach((sec: any) => {
      secondaryModelsArray.push(
        this._formBuilder.group({
          model: [sec.model, Validators.required],
          type: [sec.type, Validators.required]
        })
      );
    });

    this.patchBusinessHours(data.shopHoursDtos);
  }

  onBusinessModelChange(selectedModel: BusinessModel): void {
    this.industries = selectedModel?.industryDtoList || [];
  }

  get secondaryModels(): FormArray {
    return this.shopBasic.get('secondaryModels') as FormArray;
  }

  addSecondaryModel(): void {
    const group = this._formBuilder.group({
      model: [null, Validators.required],
      type: [null, Validators.required]
    });
    this.secondaryModels.push(group);
  }

  removeSecondaryModel(index: number): void {
    this.secondaryModels.removeAt(index);
  }

  setDocument($event: DocumentDto) {
    this.newDocument = $event;
    console.log("Document received");
    this.createNewShop();
  }

  createNewShop() {
    console.log("Create/Update Shop");

    if (this.shopBasic.invalid) {
      this.shopBasic.markAllAsTouched();
      return;
    }
    // Extract values from form
    const formValues = this.shopBasic.value;
    // Build ShopModel object
    const shop: ShopModel = {
      name: formValues.shopName!,
      email: formValues.email!,
      contactNumber: formValues.phone!,
      primaryModel: {
        ...formValues.primaryModel!, // full BusinessModel from dropdown
        industryDtoList: [formValues.businessIndustry!] // single industry in an array
      },
      active: null
    };

    if (this.newDocument != null) {
      shop.documentDto = { id: this.newDocument.id, type: this.newDocument.type, attachments: [] };
    }

    if (this.currentShop?.code) {
      console.log("Old Shop");
      shop.code = this.currentShop.code;
      this.buffer = true;
      this.orgApiService.updateShop(shop, this.currentShop.code)
        .subscribe({
          next: (res: ResponseDate) => {
            this.buffer = false;
            console.log("Shop Updated successfully", res);
            this.currentShop = res.data;
            this.goNext();
          },
          error: (err: any) => {
            this.buffer = false;
            console.error("Failed to create shop", err);
            this.sweatAlert.error("Failed to create shop");
          }
        });
      return;
    }

    // Call API
    this.changeLoader(true);
    this.orgApiService.addNewShop(shop).subscribe({
      next: (res: ResponseDate) => {
        this.currentShop = res.data;
        this.goNext();
        this.changeLoader();
        this.buffer = false;

      },
      error: (err: any) => {
        this.changeLoader();
        this.buffer = false;
        this.dialogRef.close();
        this.sweatAlert.error("Failed to complete the action. We’ve informed our team. Please try again later.");
        this.sweatAlert.alertTeam("Location", "Create Shop", "Error", JSON.stringify(err));
      }
    });
  }

  changeLoader(state: boolean = false) {
    this.loading = state;
  }

  addressGroup = this._formBuilder.group({
    address1: ['', Validators.required],
    address2: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
    postalCode: ['', [Validators.required, Validators.pattern('^[0-9]{5,6}$')]],
    country: ['', Validators.required],
    latitude: [''],
    longitude: ['']
  });

  addAddress() {
    // Mark all fields as touched to trigger validation messages
    this.addressGroup.markAllAsTouched();

    if (this.addressGroup.invalid) {
      console.warn('Address form is invalid:', this.addressGroup.errors);
      return;
    }

    const addressDto: AddressModel = {
      id: this.currentShopAddress?.id,
      addressLine1: this.addressGroup.value.address1 || '',
      addressLine2: this.addressGroup.value.address2 || '',
      city: this.addressGroup.value.city || '',
      state: this.addressGroup.value.state || '',
      postalCode: this.addressGroup.value.postalCode || '',
      country: this.addressGroup.value.country || '',
      latitude: this.addressGroup.value.latitude ? Number(this.addressGroup.value.latitude) : undefined,
      longitude: this.addressGroup.value.longitude ? Number(this.addressGroup.value.longitude) : undefined
    };

    console.log(addressDto);


    if (this.currentShop.code) {
      this.changeLoader(true);
      this.orgApiService.addShopAddress(addressDto, this.currentShop.code).subscribe({
        next: (res: ResponseDate) => {
          this.currentShopAddress = res.data;
          this.goNext();
          this.changeLoader();
        },
        error: (err: any) => {
          this.changeLoader();
          this.dialogRef.close();
          this.sweatAlert.error("Failed to complete the action. We’ve informed our team. Please try again later.");
          this.sweatAlert.alertTeam("Location", "addAddress", "Error", JSON.stringify(err));
        }
      });
    }
  }



  businessHoursGroup = this._formBuilder.group({
    days: this._formBuilder.array<FormGroup>([]) // explicitly say FormGroup[]
  });

  addShopHours() {
    const daysArray = this.businessHoursGroup.get('days')?.value ?? [];
    console.log(daysArray);

    const requestBody: ShopHoursModel[] = daysArray.map((day: any) => ({
      id: day.id || null,
      day: day.day,
      enabled: day.enabled,
      sessions: day.sessions.map((s: any) => ({
        id: s.id || null,
        start: moment(s.start, "HH:mm").utc().format("YYYY-MM-DDTHH:mm:ss[Z]"),
        end: moment(s.end, "HH:mm").utc().format("YYYY-MM-DDTHH:mm:ss[Z]"),
        operationType: s.operation
      }))
    }));

    console.log(requestBody);

    this.orgApiService.addBusinessHours(requestBody, this.currentShop.code).subscribe({
      next: (res: ResponseDate) => {
        console.log(res, "business hours");
        this.sweatAlert.success("Business Hours Updated");
        this.changeLoader();
      },
      error: (err: any) => {
        this.changeLoader();
        this.dialogRef.close();
        this.sweatAlert.error("Failed to complete the action. We’ve informed our team. Please try again later.");
        this.sweatAlert.alertTeam("Location", "addAddress", "Error", JSON.stringify(err));
      }
    })

  }

  patchBusinessHours(data: any[]): void {
    if (!data || data.length === 0) {
      // do nothing — keep default 7 days
      return;
    }
    // Explicitly create FormArray<FormGroup>
    const daysFormArray = new FormArray<FormGroup>([]);

    data.forEach(d => {
      daysFormArray.push(this.createDay(d));
    });

    this.businessHoursGroup.setControl('days', daysFormArray);
  }

  getSessions(dayIndex: number): FormArray<FormGroup> {
    return this.days.at(dayIndex).get('sessions') as FormArray<FormGroup>;
  }

  createSession(sessionOrStart?: any, end?: string | null): FormGroup<SessionForm> {
    if (typeof sessionOrStart === 'object' && sessionOrStart !== null) {
      // Existing session from backend
      const form = this._formBuilder.group<SessionForm>({
        id: this._formBuilder.control(sessionOrStart.id || null),
        start: this._formBuilder.control(sessionOrStart.start ? this.toTime(sessionOrStart.start) : null),
        end: this._formBuilder.control(sessionOrStart.end ? this.toTime(sessionOrStart.end) : null),
        operation: this._formBuilder.control(OperationType.NONE, { nonNullable: true }) // Existing session starts as NONE
      });

      // Auto-set operation to UPDATE if any field changes
      form.valueChanges.subscribe(() => {
        if (form.get('id')?.value && form.get('operation')?.value === OperationType.NONE) {
          form.patchValue({ operation: OperationType.UPDATE }, { emitEvent: false });
        }
      });

      return form;
    } else {
      // New session created in UI
      return this._formBuilder.group<SessionForm>({
        id: this._formBuilder.control(null),
        start: this._formBuilder.control(sessionOrStart || null, { nonNullable: false }),
        end: this._formBuilder.control(end || null, { nonNullable: false }),
        operation: this._formBuilder.control(OperationType.CREATE, { nonNullable: true }) // NEW session marked as CREATE
      });
    }
  }

  createDay(day?: any): FormGroup {
    return this._formBuilder.group({
      id: [day?.id || null],
      day: [day?.day || ''],
      enabled: [day?.enabled || false],
      sessions: this._formBuilder.array(
        day?.sessions?.length
          ? day.sessions.map((s: any) => this.createSession(s))
          : []
      )
    });
  }

  toTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().substring(11, 16); // "HH:mm"
  }

  copyHoursToAll(sourceIndex: number) {
    const sourceDay = this.days.at(sourceIndex) as FormGroup;
    const sourceSessions = sourceDay.get('sessions') as FormArray;

    if (!sourceDay.get('enabled')?.value || sourceSessions.length === 0) {
      alert("Please enable this day and set hours before copying.");
      return;
    }

    for (let i = 0; i < this.days.length; i++) {
      if (i === sourceIndex) continue;

      const targetDay = this.days.at(i) as FormGroup;
      const targetSessions = targetDay.get('sessions') as FormArray;

      targetDay.get('enabled')?.setValue(true);

      while (targetSessions.length) {
        targetSessions.removeAt(0);
      }

      sourceSessions.controls.forEach(sessionCtrl => {
        targetSessions.push(this.createSession(
          sessionCtrl.get('start')?.value,
          sessionCtrl.get('end')?.value
        ));
      });
    }
  }

  get days(): FormArray {
    return this.businessHoursGroup.get('days') as FormArray;
  }

  onDayToggle(index: number, event: any) {
    const dayGroup = this.days.at(index) as FormGroup;
    const sessions = dayGroup.get('sessions') as FormArray;

    if (event.checked) {
      // If enabling and no sessions exist, create one default session
      if (sessions.length === 0) {
        sessions.push(this.createSession());
      }
    } else {
      // If disabling, clear all sessions
      sessions.clear();
    }
  }

  newDay(dayName: string): FormGroup {
    return this._formBuilder.group({
      day: [dayName],
      enabled: [false],
      sessions: this._formBuilder.array([])
    });
  }

  newSession(): FormGroup {
    return this._formBuilder.group({
      start: [null, Validators.required],
      end: [null, Validators.required]
    });
  }

  addSession(dayIndex: number) {
    const sessions = this.getSessions(dayIndex);
    // Use createSession without params → marks operation as CREATE
    sessions.push(this.createSession());
  }

  removeSession(dayIndex: number, sessionIndex: number) {
    const sessions = this.getSessions(dayIndex);
    const session = sessions.at(sessionIndex) as FormGroup;

    if (session.get('id')?.value) {
      // Existing session → soft delete
      session.patchValue({ operation: OperationType.DELETE });
    } else {
      // New session → hard remove
      sessions.removeAt(sessionIndex);
    }
  }

  // Validation to check overlapping times
  isOverlapping(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 < end2 && start2 < end1;
  }

  validateNoOverlap(dayIndex: number): boolean {
    const sessionsArray = this.getSessions(dayIndex); // FormArray of sessions
    const sessions = sessionsArray.value as { start: Date; end: Date }[];

    // Ignore if less than 2 sessions
    if (!sessions || sessions.length < 2) {
      return false;
    }

    // Sort sessions by start time
    const sorted = [...sessions].sort((a, b) => {
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });

    // Check for overlap
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].end && sorted[i + 1].start) {
        if (new Date(sorted[i].end).getTime() > new Date(sorted[i + 1].start).getTime()) {
          return true; // overlap detected
        }
      }
    }
    return false;
  }

  taxDefaults = this._formBuilder.group({
    models: this._formBuilder.array([]) // dynamic tax configs for each model
  });

  createTaxConfig(modelType: string): FormGroup {
    return this._formBuilder.group({
      id: [null],
      businessModelType: [modelType],
      country: ['india'], // default to India, or bind dynamically
      taxRate: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      taxCode: ['GST'] // default GST, can change if needed
    });
  }

  get taxModels(): FormArray {
    return this.taxDefaults.get('models') as FormArray;
  }

  addTaxInformation() {
    console.log(this.taxDefaults.get('models')?.value);
    this.orgApiService.addShopTax(this.taxDefaults.get('models')?.value, this.currentShop.code).subscribe({
      next: (res: any) => {
        console.log(res, "addTaxInformation");
      },
      error: (err: any) => {

      }
    })
  }


  goNext() {
    this.stepper.next();
  }

  goPrevious() {
    this.stepper.previous();
  }

  goToStep(index: number) {
    this.stepper.selectedIndex = index;
  }

  onStepChange(event: StepperSelectionEvent) {
    console.log(event.selectedIndex);

    if (event.selectedIndex === 4) { // e.g., Tax step index
      lottie.loadAnimation({
        container: document.getElementById('tax-lottie')!,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'assets/animations/sales sky rocket.json' // Your Lottie JSON

      });
    }
  }
}
