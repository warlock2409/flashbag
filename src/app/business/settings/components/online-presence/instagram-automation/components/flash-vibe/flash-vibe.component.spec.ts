import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashVibeComponent } from './flash-vibe.component';

describe('FlashVibeComponent', () => {
  let component: FlashVibeComponent;
  let fixture: ComponentFixture<FlashVibeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlashVibeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlashVibeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
