import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrgDialogComponent } from './create-org-dialog.component';

describe('CreateOrgDialogComponent', () => {
  let component: CreateOrgDialogComponent;
  let fixture: ComponentFixture<CreateOrgDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrgDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOrgDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
