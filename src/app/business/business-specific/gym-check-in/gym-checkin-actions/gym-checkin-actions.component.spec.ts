import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GymCheckinActionsComponent } from './gym-checkin-actions.component';

describe('GymCheckinActionsComponent', () => {
  let component: GymCheckinActionsComponent;
  let fixture: ComponentFixture<GymCheckinActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GymCheckinActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GymCheckinActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
