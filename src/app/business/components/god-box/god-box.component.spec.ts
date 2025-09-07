import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GodBoxComponent } from './god-box.component';

describe('GodBoxComponent', () => {
  let component: GodBoxComponent;
  let fixture: ComponentFixture<GodBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GodBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GodBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
