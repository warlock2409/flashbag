import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalPlanComponent } from './goal-plan.component';

describe('GoalPlanComponent', () => {
  let component: GoalPlanComponent;
  let fixture: ComponentFixture<GoalPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoalPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoalPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
