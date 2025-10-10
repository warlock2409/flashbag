import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UppyUploadComponent } from './uppy-upload.component';

describe('UppyUploadComponent', () => {
  let component: UppyUploadComponent;
  let fixture: ComponentFixture<UppyUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UppyUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UppyUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
