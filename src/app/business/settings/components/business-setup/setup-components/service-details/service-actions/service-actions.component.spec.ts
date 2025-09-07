import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceActionsComponent } from './service-actions.component';

describe('ServiceActionsComponent', () => {
  let component: ServiceActionsComponent;
  let fixture: ComponentFixture<ServiceActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
