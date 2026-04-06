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
  key: string;
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
    { key: "abdominals", name: "Abs", icon: "self_improvement" },
    { key: "biceps", name: "Biceps", icon: "arm_flex" },
    { key: "triceps", name: "Triceps", icon: "arm_flex" },
    { key: "calves", name: "Calves", icon: "directions_walk" },
    { key: "chest", name: "Chest", icon: "sports_mma" },
    { key: "forearms", name: "Forearms", icon: "back_hand" },
    { key: "glutes", name: "Glutes", icon: "accessibility" },
    { key: "hamstrings", name: "Hamstrings", icon: "directions_run" },
    { key: "hands", name: "Hands", icon: "pan_tool" },
    { key: "lats", name: "Lats", icon: "sports_kabaddi" },
    { key: "lowerback", name: "Lower Back", icon: "airline_seat_recline_extra" },
    { key: "obliques", name: "Obliques", icon: "accessibility_new" },
    { key: "front_shoulders", name: "Front Shoulders", icon: "accessibility" },
    { key: "quads", name: "Quads", icon: "fitness_center" },
    { key: "rear_shoulders", name: "Rear Shoulders", icon: "person" },
    { key: "traps", name: "Traps", icon: "change_history" },
    { key: "traps_middle", name: "Traps Middle", icon: "height" },
    { key: "wrist", name: "Wrists", icon: "watch" },
    { key: "body", name: "Full Body", icon: "accessibility" }
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<GoalActionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private orgService: OrganizationServiceService
  ) { }

  ngOnInit() {
    this.goalForm = this.fb.group({
      name: [this.data.goal?.name || '', Validators.required],
      description: [this.data.goal?.description || '', Validators.required]
    });

    if (this.data.isEdit && this.data.goal?.todos?.length) {
      this.exerciseDays = this.data.goal.todos.map((todo: any) => ({
        id: todo.id,
        order: todo.order,
        taskDtoList: todo.taskDtoList ? todo.taskDtoList.map((task: any) => {
          const filter = this.modelFilters.find(f => f.name === task.title || f.key === task.title);
          return {
            id: task.id,
            title: filter ? filter.name : task.title,
            key: filter ? filter.key : task.title,
            selectedExercises: task.selectedExercises || []
          };
        }) : []
      }));
    } else {
      this.addDay();
    }
  }

  addDay() {
    const newDay: Todo = {
      order: this.exerciseDays.length + 1,
      taskDtoList: [{ title: 'Select Body Part', key: '', selectedExercises: [] }]
    };
    this.exerciseDays.push(newDay);
  }

  addBodyPartToDay(dayIndex: number) {
    this.exerciseDays[dayIndex].taskDtoList.push({ title: 'Select Body Part', key: '', selectedExercises: [] });
  }

  removeDay(index: number) {
    this.exerciseDays.splice(index, 1);
    this.exerciseDays.forEach((day, i) => day.order = i + 1);
  }

  removeBodyPart(dayIndex: number, bodyPartIndex: number) {
    this.exerciseDays[dayIndex].taskDtoList.splice(bodyPartIndex, 1);
  }

  onBodyPartChange(dayIndex: number, bodyPartIndex: number, event: any) {
    const selectedKey = event.target ? event.target.value : event.value;
    const filter = this.modelFilters.find(f => f.key === selectedKey);
    this.exerciseDays[dayIndex].taskDtoList[bodyPartIndex] = {
      title: filter ? filter.name : 'Select Body Part',
      key: selectedKey,
      selectedExercises: [] // Clear existing exercises when body part changes
    };
  }

  openExerciseSelectionDialog(dayIndex: number, bodyPartIndex: number) {
    const bodyPart = this.exerciseDays[dayIndex].taskDtoList[bodyPartIndex];

    if (!bodyPart.title || bodyPart.title === 'Select Body Part') return;

    const dialogRef = this.dialog.open(ExerciseSelectionDialogComponent, {
      width: '600px',
      data: {
        category: bodyPart.key,
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
        clientKey: day.id ? undefined : this.generateUUID(),
        order: day.order,
        taskDtoList: day.taskDtoList.map(task => ({
          id: task.id ?? undefined,
          title: task.title,
          clientKey: task.id ? undefined : this.generateUUID(),
          selectedExercises: task.selectedExercises ? task.selectedExercises.map(ex => ({
            id: ex.exerciseId ? ex.id : undefined,
            clientKey: ex.exerciseId ? undefined : this.generateUUID(),
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
