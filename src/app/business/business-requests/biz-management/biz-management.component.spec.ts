import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BizManagementComponent } from './biz-management.component';

describe('BizManagementComponent', () => {
  let component: BizManagementComponent;
  let fixture: ComponentFixture<BizManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BizManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BizManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
