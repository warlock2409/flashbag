import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { log } from 'console';
import { ResponseDate } from 'src/app/app.component';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';

@Component({
  selector: 'app-exercise-selection-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './exercise-selection-dialog.component.html',
  styleUrl: './exercise-selection-dialog.component.scss'
})
export class ExerciseSelectionDialogComponent {
  
  selectedExercises: any[] = [];
  availableExercises: any[] = [];
  category: string = '';
  mode: string = '';
  isLoading: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<ExerciseSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private orgService: OrganizationServiceService
  ) {
    this.category = data.category;
    this.mode = data.mode;
    this.selectedExercises = [...(data.selectedExercises || [])];
    
    // Ensure order property is set for existing selected exercises
    this.updateExerciseOrder();
    
    this.loadExercises();
  }

  loadExercises() {
    this.isLoading = true;
    this.orgService.getExercise(this.category, '',this.mode).subscribe({
      next: (response: ResponseDate) => {
        this.availableExercises = response.data.content || response.data || [];
        console.log('Available exercises:', this.availableExercises);
        console.log('Selected exercises:', this.selectedExercises);

        // Sort selected exercises by their order if they have one
        this.selectedExercises.sort((a, b) => (a.order || 0) - (b.order || 0));
        this.updateExerciseOrder();
        
        // Mark selected exercises AFTER sorting and updating order
        this.availableExercises.forEach(exercise => {
          exercise.checked = this.selectedExercises.some(selected => {
            // Compare by exerciseId if it exists (actual exercise ID), otherwise by id
            const selectedExerciseId = selected.exerciseId;
            return selectedExerciseId === exercise.id || 
                   String(selectedExerciseId) === String(exercise.id);
          });
        });
        
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading exercises:', error);
        this.availableExercises = [];
        this.isLoading = false;
      }
    });
  }

  onExerciseSelectionChange() {
    this.selectedExercises = this.availableExercises.filter(exercise => exercise.checked);
    // Reorder selected exercises
    this.updateExerciseOrder();
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    // Ensure exercises have order numbers set before saving
    this.updateExerciseOrder();
    this.dialogRef.close(this.selectedExercises);
  }

  // Check if an exercise is already selected
  isExerciseSelected(exercise: any): boolean {
    return this.selectedExercises.some(selected => {
      // Compare by exerciseId if it exists (actual exercise ID), otherwise by id
      const selectedExerciseId = selected.exerciseId || selected.id;
      return selectedExerciseId === exercise.id || 
             String(selectedExerciseId) === String(exercise.id);
    });
  }
  
  // Get the order number of an exercise
  getExerciseOrder(exercise: any): number {
    const index = this.selectedExercises.findIndex(e => {
      // Compare by exerciseId if it exists (actual exercise ID), otherwise by id
      const selectedExerciseId = e.id;
      return selectedExerciseId === exercise.id || 
             String(selectedExerciseId) === String(exercise.id);
    });
    return index >= 0 ? index + 1 : 0;
  }
  
  // Update exercise order numbers
  updateExerciseOrder() {
    // Sort selected exercises based on their current order in the array
    this.selectedExercises.forEach((exercise, index) => {
      exercise.order = index + 1;
    });
  }
  
  // Move exercise up in the order
  moveExerciseUp(index: number) {
    const exercise = this.availableExercises[index];
    if (!exercise.checked) return;
    
    // Find the exercise in selectedExercises array
    const selectedIndex = this.selectedExercises.findIndex(e => {
      // Compare by exerciseId if it exists (actual exercise ID), otherwise by id
      const selectedExerciseId = e.id;
      return selectedExerciseId === exercise.id || 
             String(selectedExerciseId) === String(exercise.id);
    });
    if (selectedIndex > 0) {
      // Swap with previous exercise
      const temp = this.selectedExercises[selectedIndex - 1];
      this.selectedExercises[selectedIndex - 1] = this.selectedExercises[selectedIndex];
      this.selectedExercises[selectedIndex] = temp;
      
      // Update order numbers
      this.updateExerciseOrder();
    }
  }
  
  // Move exercise down in the order
  moveExerciseDown(index: number) {
    const exercise = this.availableExercises[index];
    if (!exercise.checked) return;
    
    // Find the exercise in selectedExercises array
    const selectedIndex = this.selectedExercises.findIndex(e => {
      // Compare by exerciseId if it exists (actual exercise ID), otherwise by id
      const selectedExerciseId = e.id;
      return selectedExerciseId === exercise.id || 
             String(selectedExerciseId) === String(exercise.id);
    });
    if (selectedIndex < this.selectedExercises.length - 1 && selectedIndex >= 0) {
      // Swap with next exercise
      const temp = this.selectedExercises[selectedIndex + 1];
      this.selectedExercises[selectedIndex + 1] = this.selectedExercises[selectedIndex];
      this.selectedExercises[selectedIndex] = temp;
      
      // Update order numbers
      this.updateExerciseOrder();
    }
  }
}