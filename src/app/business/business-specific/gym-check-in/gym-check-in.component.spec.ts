import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GymCheckInComponent } from './gym-check-in.component';

describe('GymCheckInComponent', () => {
  let component: GymCheckInComponent;
  let fixture: ComponentFixture<GymCheckInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GymCheckInComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GymCheckInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
