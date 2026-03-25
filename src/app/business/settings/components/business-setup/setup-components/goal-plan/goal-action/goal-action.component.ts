import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { ExerciseSelectionDialogComponent } from '../../membership-details/exercise-selection-dialog/exercise-selection-dialog.component';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';

export interface Todo {
  id?: number;
  order: number;
  taskDtoList: BodyPart[];
}

interface BodyPart {
  id?: number;
  title: string;
  selectedExercises?: any[];
}

interface BodyFilter {
  key: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-goal-action',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './goal-action.component.html',
  styleUrls: ['./goal-action.component.scss']
})
export class GoalActionComponent implements OnInit {
  goalForm!: FormGroup;
  exerciseDays: Todo[] = [];
  
  // Reused body filters
  modelFilters: BodyFilter[] = [
    { key: "", name: "All", icon: "directions_walk" },
    { key: "traps", name: "Traps", icon: "change_history" },
    { key: "traps_middle", name: "Middle Traps", icon: "height" },
    { key: "front_shoulders", name: "Front Shoulders", icon: "accessibility" },
    { key: "rear_shoulders", name: "Rear Shoulders", icon: "person" },
    { key: "chest", name: "Chest", icon: "sports_mma" },
    { key: "lats", name: "Lats", icon: "sports_kabaddi" },
    { key: "biceps", name: "Biceps", icon: "arm_flex" },
    { key: "forearms", name: "Forearms", icon: "back_hand" },
    { key: "hands", name: "Hands", icon: "pan_tool" },
    { key: "abdominals", name: "Abs", icon: "self_improvement" },
    { key: "obliques", name: "Obliques", icon: "accessibility_new" },
    { key: "lowerback", name: "Lower Back", icon: "airline_seat_recline_extra" },
    { key: "quads", name: "Quads", icon: "fitness_center" },
    { key: "hamstrings", name: "Hamstrings", icon: "directions_run" },
    { key: "calves", name: "Calves", icon: "directions_walk" },
    { key: "body", name: "Full Body", icon: "accessibility" },
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<GoalActionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private orgService: OrganizationServiceService
  ) {}

  ngOnInit() {
    this.goalForm = this.fb.group({
      name: [this.data.goal?.name || '', Validators.required],
      description: [this.data.goal?.description || '', Validators.required]
    });

    if (this.data.isEdit && this.data.goal?.todos?.length) {
      this.exerciseDays = this.data.goal.todos.map((todo: any) => ({
        id: todo.id,
        order: todo.order,
        taskDtoList: todo.taskDtoList ? todo.taskDtoList.map((task: any) => ({
          id: task.id,
          title: task.title,
          selectedExercises: task.selectedExercises || []
        })) : []
      }));
    } else {
      this.addDay();
    }
  }

  addDay() {
    const newDay: Todo = {
      order: this.exerciseDays.length + 1,
      taskDtoList: [{ title: 'Select Body Part', selectedExercises: [] }]
    };
    this.exerciseDays.push(newDay);
  }

  addBodyPartToDay(dayIndex: number) {
    this.exerciseDays[dayIndex].taskDtoList.push({ title: 'Select Body Part', selectedExercises: [] });
  }

  removeDay(index: number) {
    this.exerciseDays.splice(index, 1);
    this.exerciseDays.forEach((day, i) => day.order = i + 1);
  }

  removeBodyPart(dayIndex: number, bodyPartIndex: number) {
    this.exerciseDays[dayIndex].taskDtoList.splice(bodyPartIndex, 1);
  }

  onBodyPartChange(dayIndex: number, bodyPartIndex: number, event: any) {
    const selectedTitle = event.target ? event.target.value : event.value;
    const existingExercises = this.exerciseDays[dayIndex].taskDtoList[bodyPartIndex].selectedExercises || [];
    this.exerciseDays[dayIndex].taskDtoList[bodyPartIndex] = {
      title: selectedTitle,
      selectedExercises: existingExercises
    };
  }

  openExerciseSelectionDialog(dayIndex: number, bodyPartIndex: number) {
    const bodyPart = this.exerciseDays[dayIndex].taskDtoList[bodyPartIndex];

    if (!bodyPart.title || bodyPart.title === 'Select Body Part') return;

    const dialogRef = this.dialog.open(ExerciseSelectionDialogComponent, {
      width: '600px',
      data: {
        category: bodyPart.title,
        selectedExercises: bodyPart.selectedExercises || []
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.exerciseDays[dayIndex].taskDtoList[bodyPartIndex].selectedExercises = result;
      }
    });
  }

  trackByIndex(index: number, item: any): any {
    return index;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  saveGoal() {
    if (this.goalForm.invalid) {
      this.goalForm.markAllAsTouched();
      return;
    }

    const val = this.goalForm.value;
    const orgCode = localStorage.getItem("orgCode");

    const payload = {
      id: this.data.goal?.id,
      name: val.name,
      description: val.description,
      orgCode: orgCode,
      active: true,
      todos: this.exerciseDays.map(day => ({
        id: day.id ?? undefined,
        order: day.order,
        taskDtoList: day.taskDtoList.map(task => ({
          id: task.id ?? undefined,
          title: task.title,
          clientKey: task.id ? undefined : this.generateUUID(),
          selectedExercises: task.selectedExercises ? task.selectedExercises.map(ex => ({
            exerciseId: ex.exerciseId || ex.id,
            name: ex.name,
            order: ex.order
          })) : []
        }))
      }))
    };

    this.orgService.createGoalPlan(payload).subscribe({
      next: (res) => {
        console.log('Goal created successfully', res);
        this.dialogRef.close(true); // Signal success
      },
      error: (err) => {
        console.error('Error creating goal', err);
        this.dialogRef.close(true); // Close anyway for now
      }
    });
  }
}
