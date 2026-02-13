import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersActionsComponent } from './customers-actions.component';

describe('CustomersActionsComponent', () => {
  let component: CustomersActionsComponent;
  let fixture: ComponentFixture<CustomersActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomersActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
