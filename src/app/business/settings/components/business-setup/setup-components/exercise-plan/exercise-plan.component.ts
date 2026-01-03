import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { ExerciseActionComponent } from './exercise-action/exercise-action.component';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { ResponseDate } from 'src/app/app.component';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { SweatAlertService } from 'src/app/services/sweat-alert.service';

export interface BodyFilter {
  key: string;
  name: string;
  icon: string; // use Material icons or custom SVG
}

@Component({
  selector: 'app-exercise-plan',
  imports: [MatButtonModule, MatChipsModule, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './exercise-plan.component.html',
  styleUrl: './exercise-plan.component.scss'
})
export class ExercisePlanComponent {


  searchControl = new FormControl('');
  totalExercise = 0;

  modelFilters: BodyFilter[] = [
    { key: "", name: "All", icon: "directions_walk" },
    { key: "rear_shoulders", name: "Rear Shoulders", icon: "person" },
    { key: "front_shoulders", name: "Front Shoulders", icon: "accessibility" },
    { key: "chest", name: "Chest", icon: "sports_mma" },
    { key: "biceps", name: "Biceps", icon: "arm_flex" }, 
    { key: "lowerback", name: "Lower Back", icon: "airline_seat_recline_extra" },
    { key: "abdominals", name: "Abs", icon: "self_improvement" },
    { key: "obliques", name: "Obliques", icon: "accessibility_new" },
    { key: "hands", name: "Hands", icon: "pan_tool" },
    { key: "forearms", name: "Forearms", icon: "back_hand" },
    { key: "traps", name: "Traps", icon: "change_history" },
    { key: "wrist", name: "Wrists", icon: "watch" },
    { key: "quads", name: "Quads", icon: "fitness_center" },
    { key: "hamstrings", name: "Hamstrings", icon: "directions_run" },
    { key: "lats", name: "Lats", icon: "sports_kabaddi" },
    { key: "calves", name: "Calves", icon: "directions_walk" },
    { key: "traps_middle", name: "Traps", icon: "height" },
    { key: "body", name: "Full Body", icon: "accessibility" },
  ];

  constructor(public dialog: MatDialog, private organizationService: OrganizationServiceService, private swalService: SweatAlertService) {
    this.getExercise();
  }

  ngOnInit() {

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      // Filter only non-null strings with length >= 2 OR empty string
      filter((val: string | null): val is string => !!val && val.length >= 2 || val === '')
    ).subscribe(searchTerm => {
      this.getExercise("",searchTerm);
    });
  }

  openExerciseAction(): void {
    const dialogRef = this.dialog.open(ExerciseActionComponent, {
      data: { bodyFilter: this.modelFilters },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.pushExerciseToByPart(result);
      }
    });
  }

  editExercise(exercise: any) {
    const dialogRef = this.dialog.open(ExerciseActionComponent, {
      data: { bodyFilter: this.modelFilters, isEdit: true, existingExercise: exercise },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.pushExerciseToByPart(result);
      }
    });
  }

  deleteExercise(exercise: any) {
    console.log(exercise,this.byPart);
    
    const category = exercise.category?.toLowerCase();
    if (!category || !this.byPart[category]) return;

    this.organizationService.deleteExercise(exercise.id).subscribe({
      next: (res: any) => {
        this.byPart[category] = this.byPart[category].filter(exe => exe.id !== exercise.id);

        // Optional: If no exercises left in that category, remove the key
        if (this.byPart[category].length === 0) {
          delete this.byPart[category];
        }
      },
      error: (err: any) => {
        console.error('Delete exercise failed:', err);
        this.swalService.error(err.error);
      }
    });
  }


  selectedFilter = "";

  onFilterChange(arg0: any) {
    this.selectedFilter = arg0;
    this.getExercise(this.selectedFilter);
  }

  // component.ts
  bodyParts = [
    "calves",
    "quads",
    "abdominals",
    "obliques",
    "biceps",
    "forearms",
    "chest",
    "back"
  ];

  byPart: { [key: string]: any[] } = {};

  isValidPart(bp: string): boolean {
    return !!this.byPart[bp] && this.byPart[bp].length > 0;
  }

  // << - API - >>

  getExercise(filter = "", name = "") {
    this.organizationService.getExercise(filter, name).subscribe({
      next: (response: ResponseDate) => {
        this.byPart = {};
        this.totalExercise = response.data.totalElements;
        response.data.content.forEach((ex: any) => {
          this.pushExerciseToByPart(ex);
        });
      },
      error: (err: any) => {

      }
    })
  }

  pushExerciseToByPart(ex: any) {
    const bodyPart = ex.category?.toLowerCase() || 'unknown';
    if (!this.byPart[bodyPart]) this.byPart[bodyPart] = [];

    this.byPart[bodyPart] = this.byPart[bodyPart].filter((e: any) => e.id !== ex.id);

    // Convert each set clearly
    const sets = ex.sets?.map((s: any, i: number) => ({
      setNo: i + 1,
      reps: s.reps,
      weight: s.weight,
      rest: s.rest,
      duration: s.duration
    })) || [];

    // Push the formatted exercise with detailed set info
    this.byPart[bodyPart].push({
      id: ex.id,
      name: ex.name,
      totalSets: sets.length,
      sets: sets,
      equipment: ex.equipment || ex.tag || 'Bodyweight',
      mode: ex.mode,
      tags: [ex.tag],
      notes: ex.description || '',
      documentDto: ex.documentDto,
      category: ex.category
    });
  }
}
