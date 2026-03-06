import { Component, OnInit, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ShopConfigService } from '../../../services/shop-config.service';
import { CustomerProfileService } from '../../../services/customer-profile.service';
import { ShopConfiguration } from '../../../models/shop-config.model';
import { CustomerProfile } from '../../../models/customer-profile.model';
import { CustomerProfileUpdateRequest } from '../../../models/customer-profile-update.model';
import { SweatAlertService } from 'src/app/services/sweat-alert.service';
import { UploadMediaComponent } from '../../../components/upload-media/upload-media.component';
import { DocumentDto } from '../../../components/upload-media/upload-media.component';
import { OrganizationServiceService } from '../../../services/organization-service.service';

interface WeightEntry {
  date: Date;
  weight: number;
  month: string;
  change: number;
}

interface HeightEntry {
  date: Date;
  height: number;
  month: string;
  change: number;
}

@Component({
  selector: 'app-customer-general',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, UploadMediaComponent],
  templateUrl: './customer-general.component.html',
  styleUrl: './customer-general.component.scss'
})
export class CustomerGeneralComponent implements OnInit {
  organizationService = inject(OrganizationServiceService);
  
  constructor(
    private shopConfigService: ShopConfigService,
    private customerProfileService: CustomerProfileService,
    public dialogRef: MatDialogRef<CustomerGeneralComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log('CustomerGeneralComponent initialized', this.data);
  }

  ngOnInit(): void {
    // Use passed customer data if available, otherwise use defaults
    if (this.data?.customer) {
      this.customerName = this.data.customer.firstName || this.data.customer.name || 'Alex Morgan';
      this.customerId = this.data.customer.id || this.data.customer.customerId || '88392';
      // Set member since based on creation date if available
      if (this.data.customer.createdAt) {
        const date = new Date(this.data.customer.createdAt);
        this.memberSince = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      }
      
      // Check if documentId exists in the customer data
      if (this.data.customer.documentId) {
        this.loadDocumentById(this.data.customer.documentId);
      }
        
      // Load customer profiles if customer ID is available
      if (this.customerId) {
        this.loadCustomerProfiles();
      }
    }
      
    this.loadShopConfigurations();
  }

  customerName = 'Alex Morgan';
  memberSince = 'Oct 2023';
  customerId = '88392';

  // Dynamic form data
  dynamicFormData: any = {};
  shopConfigurations: ShopConfiguration[] = [];
  customerProfiles: CustomerProfile[] = [];
  loadingConfigurations = false;
  loadingProfiles = false;
  updatingProfile = false;

  // These will be mapped from configurations
  height: number = 178;
  bloodGroup: string = '';
  dateOfBirth: string = '';
  privateNotes: string = '';
  goals: string[] = ['Weight Loss', 'Cardio'];
  
  // Document upload
  sampleUploads: DocumentDto | null = null;

  newWeightEntry: number | null = null;
  newHeightEntry: number | null = null;
  newWeightDate: Date = new Date();
  selectedMeasurementType: 'weight' | 'height' = 'weight';
  activeTab: string = 'weight';
  showFilters: boolean = true;
  swallService = inject(SweatAlertService);

  // Computed properties for dynamic binding
  get currentMeasurementValue(): number | null {
    return this.selectedMeasurementType === 'weight' ? this.newWeightEntry : this.newHeightEntry;
  }

  set currentMeasurementValue(value: number | null) {
    if (this.selectedMeasurementType === 'weight') {
      this.newWeightEntry = value;
    } else {
      this.newHeightEntry = value;
    }
  }

  get currentStep(): string {
    return this.selectedMeasurementType === 'weight' ? '0.1' : '1';
  }

  get currentPlaceholder(): string {
    return this.selectedMeasurementType === 'weight' ? 'Enter weight' : 'Enter height';
  }

  get currentUnit(): string {
    return this.selectedMeasurementType === 'weight' ? 'kg' : 'cm';
  }

  weightEntries: WeightEntry[] = [];
  heightEntries: HeightEntry[] = [];

  exportData() {
    console.log('Exporting customer data');
  }

  editProfile() {
    console.log('Editing profile');
  }

  addGoal() {
    const newGoal = prompt('Enter a new goal:');
    if (newGoal) {
      this.goals.push(newGoal);
    }
  }

  removeGoal(index: number) {
    this.goals.splice(index, 1);
  }

  viewMedicalHistory() {
    console.log('Viewing medical history');
  }

  getConfigurationId(type: string): number | null {
    const config = this.shopConfigurations.find(c => c.type === type);
    return config ? config.id : null;
  }

  addMeasurementEntry() {
    // Validate inputs
    if (this.selectedMeasurementType === 'weight') {
      if (this.newWeightEntry === null || this.newWeightEntry <= 0) {
        alert('Please enter a valid weight value');
        return;
      }
      if (this.newWeightEntry > 1000) {
        alert('Weight value seems too high. Please check the value.');
        return;
      }
    } else if (this.selectedMeasurementType === 'height') {
      if (this.newHeightEntry === null || this.newHeightEntry <= 0) {
        alert('Please enter a valid height value');
        return;
      }
      if (this.newHeightEntry > 300) {
        alert('Height value seems too high. Please check the value.');
        return;
      }
    }

    if (this.selectedMeasurementType === 'weight' && this.newWeightEntry !== null && this.newWeightDate) {
      const lastWeight = this.weightEntries.length > 0 ? this.weightEntries[0].weight : null;
      const change = lastWeight ? this.newWeightEntry - lastWeight : 0;

      const newEntry: WeightEntry = {
        date: this.newWeightDate,
        weight: this.newWeightEntry,
        month: this.newWeightDate.toLocaleString('default', { month: 'short' }).toUpperCase(),
        change: parseFloat(change.toFixed(1))
      };

      this.weightEntries.unshift(newEntry);

      // Update via API
      this.updateCustomerProfile('WEIGHT', this.newWeightEntry.toString());

      // Reset inputs
      this.newWeightEntry = null;
      this.newWeightDate = new Date();
    } else if (this.selectedMeasurementType === 'height' && this.newHeightEntry !== null) {
      const lastHeight = this.heightEntries.length > 0 ? this.heightEntries[0].height : null;
      const change = lastHeight ? this.newHeightEntry - lastHeight : 0;

      const newEntry: HeightEntry = {
        date: new Date(),
        height: this.newHeightEntry,
        month: new Date().toLocaleString('default', { month: 'short' }).toUpperCase(),
        change: parseFloat(change.toFixed(1))
      };

      this.heightEntries.unshift(newEntry);
      this.height = this.newHeightEntry;

      // Update via API
      this.updateCustomerProfile('HEIGHT', this.newHeightEntry.toString());

      // Reset input
      this.newHeightEntry = null;
    }
  }

  updateCustomerProfile(type: 'WEIGHT' | 'HEIGHT', value: string) {
    const configurationId = this.getConfigurationId(type);
    const customerId = this.customerId;
    const shopCode = localStorage.getItem('shopCode') || 'BIFITF191';

    if (!configurationId) {
      console.error(`Configuration ID not found for type: ${type}`);
      return;
    }

    if (!customerId) {
      console.error('Customer ID not available');
      return;
    }

    const updateRequest: CustomerProfileUpdateRequest = [{
      configurationId: configurationId,
      value: value
    }];

    this.updatingProfile = true;
    console.log('Updating customer profile:', updateRequest);

    this.customerProfileService.updateCustomerProfiles(shopCode, Number(customerId), updateRequest).subscribe({
      next: (response) => {
        console.log('Profile updated successfully:', response);
        this.updatingProfile = false;
        // Reload profiles to get the updated data
        this.loadCustomerProfiles();
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.updatingProfile = false;
        // Show error to user
        alert('Failed to update measurement. Please try again.');
      }
    });
  }

  updateBloodGroup() {
    // Only update if blood group has changed and is valid
    if (!this.bloodGroup || this.bloodGroup.trim() === '') {
      return;
    }

    const configurationId = this.getConfigurationId('BLOOD_GROUP');
    const customerId = this.customerId;
    const shopCode = localStorage.getItem('shopCode') || 'BIFITF191';

    if (!configurationId) {
      console.error('BLOOD_GROUP configuration ID not found');
      return;
    }

    if (!customerId) {
      console.error('Customer ID not available');
      return;
    }

    const updateRequest: CustomerProfileUpdateRequest = [{
      configurationId: configurationId,
      value: this.bloodGroup
    }];

    this.updatingProfile = true;
    console.log('Updating blood group:', updateRequest);

    this.customerProfileService.updateCustomerProfiles(shopCode, Number(customerId), updateRequest).subscribe({
      next: (response) => {
        console.log('Blood group updated successfully:', response);
        this.updatingProfile = false;
        // Reload profiles to get the updated data
        this.loadCustomerProfiles();
      },
      error: (error) => {
        console.error('Error updating blood group:', error);
        this.updatingProfile = false;
        // Revert to previous value or reload
        this.loadCustomerProfiles();
        alert('Failed to update blood group. Please try again.');
      }
    });
  }

  updateDateOfBirth() {
    // Only update if date of birth has changed and is valid
    if (!this.dateOfBirth || this.dateOfBirth.trim() === '') {
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(this.dateOfBirth)) {
      console.error('Invalid date format for date of birth');
      return;
    }

    const configurationId = this.getConfigurationId('AGE');
    const customerId = this.customerId;
    const shopCode = localStorage.getItem('shopCode') || 'BIFITF191';

    if (!configurationId) {
      console.error('AGE configuration ID not found');
      return;
    }

    if (!customerId) {
      console.error('Customer ID not available');
      return;
    }

    const updateRequest: CustomerProfileUpdateRequest = [{
      configurationId: configurationId,
      value: this.dateOfBirth
    }];

    this.updatingProfile = true;
    console.log('Updating date of birth:', updateRequest);

    this.customerProfileService.updateCustomerProfiles(shopCode, Number(customerId), updateRequest).subscribe({
      next: (response) => {
        console.log('Date of birth updated successfully:', response);
        this.updatingProfile = false;
        // Reload profiles to get the updated data
        this.loadCustomerProfiles();
      },
      error: (error) => {
        console.error('Error updating date of birth:', error);
        this.updatingProfile = false;
        // Revert to previous value or reload
        this.loadCustomerProfiles();
        this.swallService.error('Failed to update date of birth. Please try again.');
      }
    });
  }

  updateHealthIssues() {
    // Update health issues/notes
    const configurationId = this.getConfigurationId('HEALTH_ISSUES');
    const customerId = this.customerId;
    const shopCode = localStorage.getItem('shopCode') || 'BIFITF191';

    if (!configurationId) {
      console.error('HEALTH_ISSUES configuration ID not found');
      alert('Health issues field is not configured for this shop.');
      return;
    }

    if (!customerId) {
      console.error('Customer ID not available');
      return;
    }

    const updateRequest: CustomerProfileUpdateRequest = [{
      configurationId: configurationId,
      value: this.privateNotes || '' // Send empty string if no notes
    }];

    this.updatingProfile = true;
    console.log('Updating health issues:', updateRequest);

    this.customerProfileService.updateCustomerProfiles(shopCode, Number(customerId), updateRequest).subscribe({
      next: (response) => {
        console.log('Health issues updated successfully:', response);
        this.updatingProfile = false;
        // Reload profiles to get the updated data
        this.loadCustomerProfiles();
        // Show success message
        this.swallService.success('Health issues updated successfully!');
      },
      error: (error) => {
        console.error('Error updating health issues:', error);
        this.updatingProfile = false;
        this.swallService.error('Failed to update health issues. Please try again.');
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  calculateBarHeight(weight: number): number {
    // Normalize the bar height based on the weight range
    const maxWeight = Math.max(...this.weightEntries.map(e => e.weight));
    const minWeight = Math.min(...this.weightEntries.map(e => e.weight));

    if (maxWeight === minWeight) return 50; // Default height if all weights are the same

    // Calculate percentage of weight relative to range
    const range = maxWeight - minWeight;
    const normalized = ((weight - minWeight) / range) * 80 + 10; // Scale between 10-90%

    return Math.min(normalized, 100); // Ensure it doesn't exceed 100%
  }

  loadMoreEntries() {
    console.log('Loading more entries');
  }

  closeDialog() {
    console.log('Closing dialog');
    this.dialogRef.close();
  }

  loadCustomerProfiles() {
    this.loadingProfiles = true;
    const customerId = this.customerId;
    
    if (!customerId) {
      console.error('Customer ID not available');
      this.loadingProfiles = false;
      return;
    }

    this.customerProfileService.getCustomerProfiles(Number(customerId)).subscribe({
      next: (response) => {
        this.customerProfiles = response.data;
        this.applyCustomerProfiles();
        this.loadingProfiles = false;
        console.log('Customer profiles loaded:', this.customerProfiles);
      },
      error: (error) => {
        console.error('Error loading customer profiles:', error);
        this.loadingProfiles = false;
      }
    });
  }

  applyCustomerProfiles() {
    // Clear existing weight entries to avoid duplicates
    this.weightEntries = [];
    this.heightEntries = [];
    
    // Apply customer profile data to component properties
    this.customerProfiles.forEach(profile => {
      // Skip invalid entries
      if (!profile.type || !profile.value) {
        console.warn('Skipping invalid profile entry:', profile);
        return;
      }
      
      switch(profile.type) {
        case 'HEIGHT':
          const heightValue = Number(profile.value);
          if (!isNaN(heightValue) && heightValue > 0) {
            this.height = heightValue;
            // Add to height history
            const newHeightEntry: HeightEntry = {
              date: new Date(profile.createdOn),
              height: heightValue,
              month: new Date(profile.createdOn).toLocaleString('default', { month: 'short' }).toUpperCase(),
              change: 0 // Will be calculated later
            };
            this.heightEntries.push(newHeightEntry);
          }
          break;
        case 'WEIGHT':
          // Add weight entries to the weight history
          const weightValue = Number(profile.value);
          if (!isNaN(weightValue) && weightValue > 0) {
            const newEntry: WeightEntry = {
              date: new Date(profile.createdOn),
              weight: weightValue,
              month: new Date(profile.createdOn).toLocaleString('default', { month: 'short' }).toUpperCase(),
              change: 0 // Will be calculated later
            };
            this.weightEntries.push(newEntry);
          }
          break;
        case 'BLOOD_GROUP':
          // Update blood group from API
          this.bloodGroup = profile.value;
          break;
        case 'AGE':
          // Update date of birth from API
          this.dateOfBirth = profile.value;
          break;
        case 'HEALTH_ISSUES':
          // Update private notes from API
          this.privateNotes = profile.value;
          break;
        default:
          // Handle other profile types in dynamic form data
          this.dynamicFormData[profile.type] = profile.value;
          break;
      }
    });

    // Sort entries by date (newest first)
    this.weightEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.heightEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Calculate changes
    this.calculateWeightChanges();
    this.calculateHeightChanges();
    
    console.log('Applied customer profiles. Weight entries:', this.weightEntries);
    console.log('Applied customer profiles. Height entries:', this.heightEntries);
  }

  calculateWeightChanges() {
    // Handle edge cases
    if (this.weightEntries.length === 0) {
      return;
    }
    
    if (this.weightEntries.length === 1) {
      this.weightEntries[0].change = 0;
      return;
    }
    
    // Calculate changes for all entries except the last one
    for (let i = 0; i < this.weightEntries.length - 1; i++) {
      const currentWeight = this.weightEntries[i].weight;
      const previousWeight = this.weightEntries[i + 1].weight;
      const change = currentWeight - previousWeight;
      this.weightEntries[i].change = parseFloat(change.toFixed(1));
    }
    
    // Last entry (chronologically) has no previous entry to compare with
    this.weightEntries[this.weightEntries.length - 1].change = 0;
  }

  calculateHeightChanges() {
    // Handle edge cases
    if (this.heightEntries.length === 0) {
      return;
    }
    
    if (this.heightEntries.length === 1) {
      this.heightEntries[0].change = 0;
      return;
    }
    
    // Calculate changes for all entries except the last one
    for (let i = 0; i < this.heightEntries.length - 1; i++) {
      const currentHeight = this.heightEntries[i].height;
      const previousHeight = this.heightEntries[i + 1].height;
      const change = currentHeight - previousHeight;
      this.heightEntries[i].change = parseFloat(change.toFixed(1));
    }
    
    // Last entry (chronologically) has no previous entry to compare with
    this.heightEntries[this.heightEntries.length - 1].change = 0;
  }

  loadShopConfigurations() {
    this.loadingConfigurations = true;
    const shopCode = localStorage.getItem('shopCode') || 'BIFITF191';

    this.shopConfigService.getShopConfigurations(shopCode).subscribe({
      next: (response) => {
        this.shopConfigurations = response.data;
        this.initializeDynamicFormData();
        this.loadingConfigurations = false;
      },
      error: (error) => {
        console.error('Error loading shop configurations:', error);
        this.loadingConfigurations = false;
      }
    });
  }

  initializeDynamicFormData() {
    // Initialize form data with default values from configurations
    this.shopConfigurations.forEach(config => {
      if (config.enable) {
        this.dynamicFormData[config.type] = config.defaultValue || '';

        // Map to existing component properties for backward compatibility
        switch (config.type) {
          case 'HEIGHT':
            this.height = config.defaultValue ? Number(config.defaultValue) : 178; // Default height
            break;
          case 'BLOOD_GROUP':
            this.bloodGroup = config.defaultValue || 'O+';
            break;
          case 'AGE':
            this.dateOfBirth = config.defaultValue || '1995-04-12'; // Default DOB
            break;
          case 'WEIGHT':
            this.dynamicFormData['WEIGHT'] = config.defaultValue || '';
            break;
          case 'HEALTH_ISSUES':
            this.dynamicFormData['HEALTH_ISSUES'] = config.defaultValue || '';
            break;
        }
      }
    });
  }

  onDynamicFieldChange(fieldType: string, value: any) {
    this.dynamicFormData[fieldType] = value;

    // Update corresponding component properties
    switch (fieldType) {
      case 'HEIGHT':
        this.height = Number(value);
        break;
      case 'BLOOD_GROUP':
        this.bloodGroup = value;
        break;
      case 'AGE':
        this.dateOfBirth = value;
        break;
      case 'WEIGHT':
        // Handle weight separately as it's not a direct component property
        break;
      case 'HEALTH_ISSUES':
        // Handle health issues in dynamic form data
        break;
    }
  }

  getFieldLabel(fieldType: string): string {
    const config = this.shopConfigurations.find(c => c.type === fieldType);
    return config ? config.description : fieldType.replace(/_/g, ' ');
  }

  getFieldType(fieldType: string): 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN' {
    const config = this.shopConfigurations.find(c => c.type === fieldType);
    return config ? config.valueType : 'STRING';
  }

  isFieldEnabled(fieldType: string): boolean {
    const config = this.shopConfigurations.find(c => c.type === fieldType);
    return config !== undefined;
  }

  setDocument($event: DocumentDto) {
    this.sampleUploads = $event;
    console.log("Document received", $event);
    
    // If we have a document ID and customer ID, update the customer with the new document
    if ($event.id && this.customerId) {
      this.updateCustomerWithDocument($event.id);
    }
  }

  loadDocumentById(documentId: number) {
    console.log('Loading document with ID:', documentId);
    this.organizationService.getDocumentById(documentId).subscribe({
      next: (res) => {
        console.log('Document loaded:', res.data);
        this.sampleUploads = res.data;
      },
      error: (error) => {
        console.error('Error loading document:', error);
      }
    });
  }

  updateCustomerWithDocument(documentId: number) {
    const customerId = Number(this.customerId);
    if (!customerId) {
      console.error('Customer ID not available');
      return;
    }

    console.log('Updating customer with document ID:', documentId);
    this.organizationService.updateCustomerDocument(customerId, documentId).subscribe({
      next: (res) => {
        console.log('Customer document updated successfully:', res.data);
        this.data.customer.documentId = documentId;
      },
      error: (error) => {
        this.swallService.error('Error updating customer document:');
        console.error('Error updating customer document:', error);
      }
    });
  }
}
