import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseActionComponent } from './exercise-action.component';

describe('ExerciseActionComponent', () => {
  let component: ExerciseActionComponent;
  let fixture: ComponentFixture<ExerciseActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseActionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExerciseActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
