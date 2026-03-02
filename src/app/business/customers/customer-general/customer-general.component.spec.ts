import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerGeneralComponent } from './customer-general.component';

describe('CustomerGeneralComponent', () => {
  let component: CustomerGeneralComponent;
  let fixture: ComponentFixture<CustomerGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerGeneralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
