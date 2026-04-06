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
      this.getExercise("", searchTerm);
    });
  }

  openExerciseAction(): void {
    const dialogRef = this.dialog.open(ExerciseActionComponent, {
      data: { bodyFilter: this.modelFilters },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getExercise(this.selectedFilter, this.searchControl.value || "");
      }
    });
  }

  editExercise(exercise: any) {
    if (!exercise.documentDto && exercise.documentId) {
      this.organizationService.getDocumentById(exercise.documentId).subscribe({
        next: (res: any) => {
          exercise.documentDto = res.data;
          this.openEditDialog(exercise);
        },
        error: () => {
          this.openEditDialog(exercise);
        }
      });
    } else {
      this.openEditDialog(exercise);
    }
  }

  openEditDialog(exercise: any) {
    const dialogRef = this.dialog.open(ExerciseActionComponent, {
      data: { bodyFilter: this.modelFilters, isEdit: true, existingExercise: exercise },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getExercise(this.selectedFilter, this.searchControl.value || "");
      }
    });
  }

  deleteExercise(exercise: any) {
    console.log(exercise, this.byPart);

    const category = exercise.category?.toLowerCase();
    if (!category || !this.byPart[category]) return;

    this.organizationService.deleteExercise(exercise.id).subscribe({
      next: (res: any) => {
        this.byPart[category] = this.byPart[category].filter(exe => exe.id !== exercise.id);

        // Optional: If no exercises left in that category, remove the key
        if (this.byPart[category].length === 0) {
          delete this.byPart[category];
        }
        this.updateBodyParts();
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
  byPart: { [key: string]: any[] } = {};
  bodyParts: string[] = [];

  updateBodyParts() {
    const keys = Object.keys(this.byPart);
    // Sort these keys based on their order in modelFilters if possible
    const filterOrder = this.modelFilters.map(f => f.key).filter(k => k !== "");

    this.bodyParts = keys.sort((a, b) => {
      const idxA = filterOrder.indexOf(a);
      const idxB = filterOrder.indexOf(b);
      if (idxA === -1 && idxB === -1) return a.localeCompare(b);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }

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
        this.updateBodyParts();
      },
      error: (err: any) => {

      }
    })
  }

  pushExerciseToByPart(ex: any) {
    const bodyPart = ex.category?.toLowerCase() || 'unknown';
    if (!this.byPart[bodyPart]) this.byPart[bodyPart] = [];

    this.byPart[bodyPart] = this.byPart[bodyPart].filter((e: any) => e.id !== ex.id);

    let totalSets = 0;
    if (ex.modeConfigs) {
      ex.modeConfigs.forEach((m: any) => {
        totalSets += m.sets ? m.sets.length : 0;
      });
    }

    // Create the exercise item
    const formattedEx: any = {
      id: ex.id,
      name: ex.name,
      totalSets: totalSets,
      modeConfigs: ex.modeConfigs || [],
      equipment: ex.equipment || ex.tag || 'Bodyweight',
      tag: ex.tag,
      notes: ex.description || ex.notes || '',
      documentId: ex.documentId,
      documentDto: ex.documentDto,
      category: ex.category
    };

    // Push the formatted exercise with detailed set info
    this.byPart[bodyPart].push(formattedEx);
  }
}
