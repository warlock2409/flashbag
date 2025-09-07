import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembershipActionsComponent } from './membership-actions.component';

describe('MembershipActionsComponent', () => {
  let component: MembershipActionsComponent;
  let fixture: ComponentFixture<MembershipActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembershipActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MembershipActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
