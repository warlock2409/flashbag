import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalActionComponent } from './goal-action.component';

describe('GoalActionComponent', () => {
  let component: GoalActionComponent;
  let fixture: ComponentFixture<GoalActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoalActionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoalActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
