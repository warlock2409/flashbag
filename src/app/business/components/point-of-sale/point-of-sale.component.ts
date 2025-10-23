import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { ResponseDate } from 'src/app/app.component';
import { MasterService } from 'src/app/services/master.service';
import { MatChipsModule } from '@angular/material/chips';
import { BusinessModel, Plan, PlanAddOn } from 'src/app/models/business.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { InvoiceItem } from './InvoiceItem';

export interface InvoiceData {
  id: number,
  name: string,
  price: number,
  category?: string,
  image?: string,
  quantity: number,
  canHaveMultiple: boolean,
  type: string,
  totalPrice: number
}

export interface CreateOrganizationPlanDto {
  invoiceItems: InvoiceItemDto[];
  totalAmount: string;
  businessModelType:string
}

interface InvoiceItemDto {
  id: number;
  purchaseType: string;  // e.g., "PLAN" or "ADD_ON"
  quantity: number;
  price: string;  // BigDecimal as string
  total: string;  // BigDecimal as string
}


@Component({
  selector: 'app-point-of-sale',
  standalone: true,
  imports: [
    MatDialogModule, MatButtonModule, CommonModule, MatStepperModule, FormsModule,
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatChipsModule],
  templateUrl: './point-of-sale.component.html',
  styleUrl: './point-of-sale.component.scss'
})
export class PointOfSaleComponent {
  readonly dialogRef = inject(MatDialogRef<PointOfSaleComponent>);
  private _snackBar = inject(NzMessageService);

  closeDialog() {
    this.dialogRef.close();
  }


  // Start
  modelFilters: BusinessModel[] = [];
  selectedFilter = "";
  // Plan
  businessPlans: Plan[] = [];
  // Add ons 
  addons: PlanAddOn[] = [];
  //Selected Plan 
  selectedPlan: InvoiceData | null = null;

  constructor(private masterService: MasterService) {
    this.getBusinessModels();
  }

  onFilterChange(modelName: any) {
    // Find Business Model by id
    let model = this.modelFilters.find(model => model.name == modelName);
   
  }

  getBusinessModels() {
    this.masterService.getAllBusinessModel().subscribe({
      next: (res: ResponseDate) => {
        console.log(res);
        this.modelFilters = res.data;
        this.selectedFilter = this.modelFilters[0].name;
        this.getBusinessPlan()
      },
      error: (err: any) => {

      }
    })
  }

  getBusinessPlan() {
    this.masterService.getPlansByOrganization().subscribe({
      next: (res: ResponseDate) => {
        this.businessPlans = res.data.sort((a: Plan, b: Plan) => a.basePrice - b.basePrice);
      },
      error: (err: any) => {

      }
    })
  }

  getAddonByPlanAndBusinessModel(planId: number, businessModelId: number) {
    this.masterService.getPlanAddonByPlan(planId, businessModelId).subscribe({
      next: (res: ResponseDate) => {
        this.addons = res.data;
      },
      error: (err: any) => {

      }
    })

  }

  // Configurations
  paymentMethods = [
    { label: 'Cash', color: 'green' },
    { label: 'Card', color: 'blue' },
    { label: 'Transfer', color: 'violet' }
  ];

  selectedMethod = '';

  setPaymentMethod(method: string) {
    this.selectedMethod = method;
  }

  // Invoice 

  invoiceItems: InvoiceItem[] = [

  ];



  onQuantityChange(item: InvoiceItem, operation: 'increase' | 'decrease') {
    const planChanged = item.type === 'PLAN';

    // Update the quantity on this item
    const cleared = item.updateQuantity(operation);

    // If this is the plan item, update the global selectedPlan quantity
    if (planChanged && this.selectedPlan) {
      this.selectedPlan.quantity = item.quantity;

      // Propagate the selectedPlanQuantity to all invoice items (including addons)
      this.invoiceItems.forEach(invItem => {
        invItem.selectedPlanQuantity = this.selectedPlan?.quantity ?? 1;
      });
    }

    // Optionally: if cleared (quantity <= 0), handle clearing
    if (cleared) {
      this.selectedPlan = null;
      this.clearInvoice();
    }
  }

  // Stepper 
  private _formBuilder = inject(FormBuilder);

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });

  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });

  isEditable = true;



  toggleAddon(addon: PlanAddOn) {
    console.log(addon.selected);
    addon.selected = !addon.selected;

    if (addon.selected) {
      const invoiceItem = new InvoiceItem(
        {
          id: addon.id,
          canHaveMultiple: addon.canHaveMultiple,
          name: addon.type,
          price: addon.pricePerUnit,
          quantity: 1,
          type: "ADD_ON",
          totalPrice: 0 // ignored, totalPrice is getter
        },
        this.selectedPlan?.quantity ?? 1
      );

      this.invoiceItems = this.invoiceItems.filter(item => !(item.id === addon.id && item.type === 'ADD_ON'));
      this.invoiceItems.push(invoiceItem);
    } else {
      this.invoiceItems = this.invoiceItems.filter(item => !(item.id === addon.id && item.type === 'ADD_ON'));
    }
  }

  selectPlan(plan: Plan, stepper: MatStepper) {
    this.firstFormGroup.patchValue({ firstCtrl: plan.toString() });
    let model = this.modelFilters.find(model => model.name == this.selectedFilter);
    if (model) {
      this.getAddonByPlanAndBusinessModel(plan.id, model?.id);
      stepper.next();
      const invoiceItem = new InvoiceItem(
        {
          id: plan.id,
          canHaveMultiple: true,
          name: plan.name,
          price: plan.basePrice,
          quantity: 4,
          type: "PLAN",
          totalPrice: 0 // ignored, totalPrice is getter
        },
        1
      );
      this.invoiceItems = this.invoiceItems.filter(item => item.type != "PLAN");
      this.selectedPlan = invoiceItem;
      this.updateSelectedPlanQuantity(invoiceItem.quantity);
      this.invoiceItems.push(invoiceItem);
    }
  }

  updateSelectedPlanQuantity(newQuantity: number) {
    this.invoiceItems.forEach(item => {
      item.selectedPlanQuantity = newQuantity;
    });
  }

  get subtotal(): number {
    return this.invoiceItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get tax(): number {
    return this.subtotal * 0;  // 10% tax
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  clearInvoice() {
    this.invoiceItems = [];
    this.addons.map(addon => addon.selected = false);
  }

  checkout() {
    // Calculate total amount from invoiceItems (use your InvoiceItem class getter)
    const totalAmount = this.invoiceItems
      .reduce((sum, item) => sum + item.totalPrice, 0);

    // Build the CreateOrganizationPlanDto
    const requestPurchase: CreateOrganizationPlanDto = {
      invoiceItems: this.invoiceItems.map(item => this.mapToInvoiceItemDto(item)),
      totalAmount: totalAmount.toFixed(2),
      businessModelType :this.selectedFilter.toUpperCase()
    };

    console.log('Checking out with total:', totalAmount);

    this.masterService.requestPurchase(requestPurchase).subscribe({
      next: (res: ResponseDate) => {
        this._snackBar.success('Check out completed');
        this.closeDialog();
      },
      error: (err: any) => {
        this._snackBar.error('Checkout failed. Please try again.');
        console.error(err);
      }
    });
    this._snackBar.success('Check out completed');
    // this.closeDialog();
  }

  mapToInvoiceItemDto(item: InvoiceItem): InvoiceItemDto {
    return {
      id: item.id,
      purchaseType: item.type,
      quantity: item.quantity,
      price: item.price.toFixed(2),      // send price as string
      total: item.totalPrice.toFixed(2)  // send total as string
    };
  }

  getSubscriptionDateRange(quantity: number): string {
    const startDate = new Date(); // current date

    // Calculate end date by adding 'quantity' months
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + quantity);

    // Format date as "dd MMM yyyy"
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const startStr = startDate.toLocaleDateString('en-US', options);
    const endStr = endDate.toLocaleDateString('en-US', options);

    return `${startStr} - ${endStr}`;
  }


}
