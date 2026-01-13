import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidayActionsComponent } from './holiday-actions.component';

describe('HolidayActionsComponent', () => {
  let component: HolidayActionsComponent;
  let fixture: ComponentFixture<HolidayActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HolidayActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HolidayActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
