import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalDetailsComponent } from './rental-details.component';

describe('RentalDetailsComponent', () => {
  let component: RentalDetailsComponent;
  let fixture: ComponentFixture<RentalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RentalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
