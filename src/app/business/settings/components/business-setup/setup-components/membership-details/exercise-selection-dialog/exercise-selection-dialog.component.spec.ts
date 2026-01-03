import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseSelectionDialogComponent } from './exercise-selection-dialog.component';

describe('ExerciseSelectionDialogComponent', () => {
  let component: ExerciseSelectionDialogComponent;
  let fixture: ComponentFixture<ExerciseSelectionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseSelectionDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExerciseSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});