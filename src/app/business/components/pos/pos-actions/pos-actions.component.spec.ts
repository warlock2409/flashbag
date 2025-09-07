import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosActionsComponent } from './pos-actions.component';

describe('PosActionsComponent', () => {
  let component: PosActionsComponent;
  let fixture: ComponentFixture<PosActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
