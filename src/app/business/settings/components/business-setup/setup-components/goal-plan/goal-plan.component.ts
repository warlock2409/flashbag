import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GoalActionComponent } from './goal-action/goal-action.component';
import { FormsModule } from '@angular/forms';

import { OrganizationServiceService } from 'src/app/services/organization-service.service';

export interface ExerciseGoalDto {
  id?: number;
  name: string;
  description: string;
  orgCode?: string;
  active?: boolean;
  todos?: any[];
}

@Component({
  selector: 'app-goal-plan',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, FormsModule],
  templateUrl: './goal-plan.component.html',
  styleUrls: ['./goal-plan.component.scss']
})
export class GoalPlanComponent implements OnInit {
  goals: ExerciseGoalDto[] = [];
  isLoading = false;

  constructor(private dialog: MatDialog, private orgService: OrganizationServiceService) {}

  ngOnInit() {
    this.fetchGoals();
  }

  fetchGoals() {
    this.isLoading = true;
    this.orgService.getGoalPlans().subscribe({
      next: (res) => {
        // the API might return the list directly inside data
        this.goals = res.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching goals', err);
        this.isLoading = false;
      }
    });
  }

  openGoalAction(goal?: ExerciseGoalDto) {
    const dialogRef = this.dialog.open(GoalActionComponent, {
      width: '800px',
      data: { isEdit: !!goal, goal: goal || null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchGoals(); // Refresh the list if success
      }
    });
  }
}
