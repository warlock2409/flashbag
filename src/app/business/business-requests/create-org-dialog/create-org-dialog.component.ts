import { Component, inject, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MasterService } from 'src/app/services/master.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ServiceResponse } from 'src/app/app.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-create-org-dialog',
  standalone: true,
  imports: [MatDialogModule, NzInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule, CommonModule,
    MatButtonModule, NzSpinModule, MatProgressBarModule],
  templateUrl: './create-org-dialog.component.html',
  styleUrl: './create-org-dialog.component.scss'
})

export class CreateOrgDialogComponent {
  loader = false;
  firstFormGroup!: FormGroup;
  masterService = inject(MasterService);

  constructor(
    public dialogRef: MatDialogRef<CreateOrgDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private _formBuilder: FormBuilder) {

    if (this.data.type == 'CREATE_ORGANIZATION') {
      this.firstFormGroup = this._formBuilder.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]]
      });
    } else if (this.data.type = 'CREATE_BUSINESS_MODEL') {
      this.firstFormGroup = this._formBuilder.group({
        name: ['', Validators.required],
      });
    }
  }

  onCreate() {
    if (this.firstFormGroup.valid) {
      this.loader = true;
      const formData = this.firstFormGroup.value;
      this.dialogRef.close(formData);
    }
  }


  onNoClick(): void {
    this.dialogRef.close();
  }
}
