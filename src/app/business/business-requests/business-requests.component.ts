import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ApprovalDialogComponent } from './approval-dialog/approval-dialog.component';
import { RequestDetailsDialogComponent } from './request-details-dialog/request-details-dialog.component';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzCardModule } from 'ng-zorro-antd/card';
import { CreateOrgDialogComponent } from './create-org-dialog/create-org-dialog.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ResponseDate, ServiceResponse } from 'src/app/app.component';
import { MasterService } from 'src/app/services/master.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SidePanelComponent } from 'src/app/components/shared/side-panel/side-panel.component';
import { MatChipsModule } from '@angular/material/chips';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
function alphabet(): string[] {
  const children: string[] = [];
  for (let i = 10; i < 36; i++) {
    children.push(i.toString(36) + i);
  }
  return children;
}
@Component({
  selector: 'app-business-requests',
  templateUrl: './business-requests.component.html',
  styleUrls: ['./business-requests.component.scss'],
  standalone: true,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    NzSegmentedModule,
    NzCardModule, MatIconModule, MatProgressBarModule, SidePanelComponent,
    MatChipsModule, NzButtonModule, NzSelectModule
  ]
})
export class BusinessRequestsComponent {

  bizOptions = ['Business Model']
  options = ['Active', 'Pending', 'Inactive', 'Blocked'];
  activeSegment: string | number = 'Active'
  buffer = false;
  isPanelOpen = false;

  displayedColumns: string[] = ['id', 'organizationName', 'ownerName', 'email', 'phone', 'businessType', 'status', 'submittedDate', 'actions'];

  requests: BusinessRequest[] = [
    {
      id: 1,
      businessName: 'Tech Store',
      ownerName: 'John Doe',
      email: 'john@techstore.com',
      phone: '123-456-7890',
      businessType: 'Retail Store',
      description: 'Electronics and gadgets store',
      status: 'pending',
      submittedDate: new Date('2024-03-15')
    },
    // Add more mock data as needed
  ];

  constructor(private dialog: MatDialog, private message: NzMessageService, private masterService: MasterService) {
    this.getAllOrganization();
    this.getBusinessModel();
    // this.openPanel();
  }


  getAllOrganization() {
    this.buffer = true;
    let segment = null;
    if (this.activeSegment) {
      segment = this.activeSegment.toString().toUpperCase();
    }
    this.masterService.getOrganizations(segment).subscribe({
      next: (res: any) => {
        console.log(res);
        this.buffer = false;
        this.organizationSource = res.data.content;
        this.organizationSource.map((org:any) =>{
          if(org.businessModelDTOS)
            org.selectedBusinessModelIds = org.businessModelDTOS.map((model:any) => model.id);
        })
        console.log(this.organizationSource,"Organization Source");
        
      },
      error: (error: any) => {
        this.buffer = false;

      }
    })
  }

  createOrganization() {
    const createOrg = this.dialog.open(CreateOrgDialogComponent,
      { minWidth: "500px", data: { action: 'create', title: "Create New Organization", type: 'CREATE_ORGANIZATION' } });

    createOrg.afterClosed().subscribe((result: ResponseDate) => {
      if (result)
        this.masterService.createOrganization(result).subscribe({
          next: (response) => {
            console.log('Organization created:', response);
            this.buffer = false;
            let data = { message: response.message, status: true, data: response.data };
            this.organizationSource = [...this.organizationSource, data.data];
            this.message.success(data.message);
          },
          error: (error) => {
            this.buffer = false;
            console.error('Error creating organization:', error);
            let data = { message: error.error.message, status: false };
            this.message.error(data.message);
          }
        });

    });
  }

  action(action: string, element: OrganizationDTO) {
    let body = { status: action };
    let addNewUser = false;
    if (element.status == 'PENDING' && action == 'ACTIVE') {
      addNewUser = true;
    }
    this.masterService.updateOrganization(body, element.code, addNewUser).subscribe({
      next: (res: ServiceResponse<any>) => {
        this.message.success(res.message);
        this.getAllOrganization();
      },
      error: (error: any) => {

      }
    })
  }

  approveRequest(request: BusinessRequest) {

    this.dialog.open(ApprovalDialogComponent, {
      width: '400px',
      data: request
    });
  }

  viewDetails(request: BusinessRequest) {
    this.dialog.open(RequestDetailsDialogComponent, {
      width: '600px',
      data: request
    });
  }

  rejectRequest(request: BusinessRequest) {
    // Implement rejection logic
    request.status = 'rejected';
  }

  handleValueChange(e: string | number): void {
    console.log(e);
    this.activeSegment = e;
    this.getAllOrganization();
  }


  //  Business Configuration 
  businessModels: any[] = [];
  selectedModel = "";

  closePanel(): void {
    this.isPanelOpen = false;
  }
  openPanel() {
    this.isPanelOpen = true;
    this.getBusinessModel();
  }

  getBusinessModel() {
    this.masterService.getAllBusinessModel().subscribe({
      next: (res: any) => {
        console.log(res, "model");
        this.businessModels = res.data;
        this.selectedModel = this.businessModels[0].name;
      },
      error: (err: any) => {

      }
    })

  }

  createNewBusinessModel() {
    const createBuzModel = this.dialog.open(CreateOrgDialogComponent,
      {
        minWidth: "500px",
        data: { action: 'create', title: "Create BusinessModel", type: 'CREATE_BUSINESS_MODEL' }
      });

    createBuzModel.afterClosed().subscribe((result: ResponseDate) => {
      if (result)
        console.log(result);
      this.masterService.createBusinessModel(result).subscribe({
        next: (res: any) => {
          console.log(res);
          this.businessModels = [...this.businessModels, res.data];
        },
        error: (err: any) => {

        }
      })

    });
  }

  onOrgModelChange($event: any, element: any) {
    this.masterService.addOrRemoveModel($event,element.code).subscribe({
      next:(res:any)=>{
        this.message.success(res.message);
      },
      error:(err:any)=>{

      }
    })
    
  }

  onModelChange(arg0: any) {
    throw new Error('Method not implemented.');
  }

  bizOptionsChange($event: string | number) {
    throw new Error('Method not implemented.');
  }



  organizationSource: OrganizationDTO[] = [];
  columnsToDisplay = ['name', 'email', 'status', 'code'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand', 'action'];
  expandedElement!: null;

}

interface OrganizationDTO {
  code: string,
  name: string,
  email: string,
  status: string
}

interface BusinessRequest {
  id: number;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: Date;
}