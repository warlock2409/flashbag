import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ResponseDate } from 'src/app/app.component';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { SweatAlertService } from 'src/app/services/sweat-alert.service';
import { DocumentDto, UploadMediaComponent } from "src/app/components/upload-media/upload-media.component";
import { MatProgressBarModule } from '@angular/material/progress-bar';
@Component({
  selector: 'app-exercise-action',
  imports: [MatButtonModule, MatChipsModule, FormsModule, CommonModule, ReactiveFormsModule, UploadMediaComponent, MatProgressBarModule],
  templateUrl: './exercise-action.component.html',
  styleUrl: './exercise-action.component.scss'
})
export class ExerciseActionComponent {

  exerciseForm!: FormGroup;
  modes = ['Beginner', 'Intermediate', 'Advanced'];
  existingUploads: DocumentDto | null = null;
  selectedFilter = "";
  buffer = false;

  constructor(
    public dialogRef: MatDialogRef<ExerciseActionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, private swalService: SweatAlertService, private organizationService: OrganizationServiceService
  ) {
    console.log(this.data);

    this.exerciseForm = this.fb.group({
      name: ['', Validators.required],
      equipment: ['None'],
      description: [''],
      category: ['', Validators.required],
      mode: ['Beginner', Validators.required],
      tag: 'Strength',
      orgId: [1],
      industryId: [101],
      documentId: null,
      sets: this.fb.array([this.createSet()])
    });

    if (this.data.existingExercise) {
      console.log(this.data, "Existing Exercise");

      this.patchExerciseForm(this.data.existingExercise);
    }
  }


  generateAiContent() {
    let exercise = this.exerciseForm.value;
    let prompt = `You are a fitness assistant that helps generate notes and tags for exercises.\n\nUser provides: \n - Body part: ${exercise.category}\n- Exercise Name: ${exercise.name}\n- Equipment: ${exercise.equipment}\n- Difficulty: ${exercise.mode}\n\nTask:\n1. Write a short note (2–3 sentences) describing the exercise and its benefits.\n2. Suggest exactly 1 descriptive tag that best represents this exercise (e.g., Strength”, “Mobility”, “Endurance”, “Power”, “Flexibility”, “Balance”, “Cardio”).\n\nOutput format (in JSON):\n{\n  \"note\": \"Your descriptive note here\",\n  \"tag\": \"one descriptive tag here\"\n}`

    this.buffer = true;
    this.organizationService.generateContent(prompt, 150).subscribe({
      next: (res: ResponseDate) => {
        this.buffer = false;
        let responseText = res.data.generatedText;
        responseText = responseText.replace(/```json|```/g, '').trim();
        // Parse to JSON
        const parsed = JSON.parse(responseText);
        this.exerciseForm.patchValue({
          description: parsed.note,
          tag: parsed.tag
        })
        console.log(parsed.note); // "The bench press is a fundamental compound exercise..."
        console.log(parsed.tag);
      },
      error: (err: any) => {
        this.buffer = false;
      }
    })
  }

  patchExerciseForm(response: any) {
    this.exerciseForm.patchValue({
      name: response.name,
      equipment: response.equipment,
      difficulty: response.difficulty,
      description: response.notes,
      category: response.category,
      mode: response.mode,
      duration: response.duration,
      tag: response.tags,
      orgId: response.orgId,
      industryId: response.industryId,
      documentId: response.documentId
    });

    this.selectedFilter = response.category;

    // Handle sets (FormArray)
    // Patch sets (FormArray)
    const setsArray = this.exerciseForm.get('sets') as FormArray;
    setsArray.clear();

    if (response.sets && response.sets.length > 0) {
      response.sets.forEach((set: any) => {
        setsArray.push(
          this.fb.group({
            reps: [set.reps ?? 10, [Validators.required, Validators.min(1)]],
            weight: [set.weight ?? 15, [Validators.required, Validators.min(0)]],
            duration: [set.duration ?? 60, [Validators.required, Validators.min(0)]],
            rest: [set.rest ?? 90, [Validators.required, Validators.min(0)]],
          })
        );
      });
    } else {
      // If no sets in response, create one default
      setsArray.push(this.createSet());
    }

    // Handle document/video attachments
    this.existingUploads = response.documentDto;
  }

  createSet(): FormGroup {
    return this.fb.group({
      reps: [10, [Validators.required, Validators.min(1)]],
      weight: [15, [Validators.required, Validators.min(0)]],
      duration: [60, [Validators.required, Validators.min(0)]],
      rest: [90, [Validators.required, Validators.min(0)]],
    });
  }

  get sets(): FormArray {
    return this.exerciseForm.get('sets') as FormArray;
  }

  addSet() {
    this.sets.push(this.createSet());
  }

  removeSet(index: number) {
    this.sets.removeAt(index);
  }

  setDocument($event: DocumentDto) {
    console.log($event);
    this.exerciseForm.patchValue({
      documentId: $event.id
    });

    if (this.existingUploads == null && this.data.existingExercise.id != null) {
      this.buffer = true;

      this.organizationService.updateExercise(this.exerciseForm.value, this.data.existingExercise.id).subscribe({
        next: (res: ResponseDate) => {
          this.swalService.success("Media Updated")
          this.buffer = false;

        },
        error: (err: any) => {
          this.buffer = false;

        }
      })
    }
  }

  submit() {
    if (this.exerciseForm.invalid) {
      console.log("InValid");

      // Mark all as touched to trigger errors
      this.exerciseForm.markAllAsTouched();

      // Gather all errors
      const errors: string[] = [];

      if (this.exerciseForm.get('category')?.invalid) {
        errors.push('Exercise body part is required.');
      }

      if (this.exerciseForm.get('name')?.invalid) {
        errors.push('Exercise name is required.');
      }
      if (this.exerciseForm.get('description')?.invalid) {
        errors.push('Description is required.');
      }
      if (this.sets.invalid) {
        this.sets.controls.forEach((set, i) => {
          if (set.get('weight')?.invalid) errors.push(`Set ${i + 1}: Weight is required and must be >=1`);
          if (set.get('reps')?.invalid) errors.push(`Set ${i + 1}: Reps are required and must be >=1`);
          if (set.get('rest')?.invalid) errors.push(`Set ${i + 1}: Rest is required and cannot be negative`);
        });
      }

      // Show SweetAlert

      this.swalService.errorHtml(errors.join('<br'));


      return;
    }
    if (this.exerciseForm.valid) {

      this.buffer = true;

      if (this.data.isEdit) {
        this.organizationService.updateExercise(this.exerciseForm.value, this.data.existingExercise.id).subscribe({
          next: (res: ResponseDate) => {
            this.swalService.success("Exercise Updated Successfully")
            this.dialogRef.close(res.data);
            this.buffer = false;

          },
          error: (err: any) => {
            this.buffer = false;

          }
        })
      } else {
        // send to API
        this.organizationService.createExercise(this.exerciseForm.value).subscribe({
          next: (res: ResponseDate) => {

            this.dialogRef.close(res.data);
            this.buffer = false;

          },
          error: (err: any) => {
            this.buffer = false;

          }
        })
      }

    }
    console.log(this.exerciseForm.value);
  }

  onFilterChange(selected: string) {
    this.selectedFilter = selected; // for UI highlight
    this.exerciseForm.patchValue({ category: selected }); // update the form control
  }

  closeDialog() {
    this.dialogRef.close();
  }




}
