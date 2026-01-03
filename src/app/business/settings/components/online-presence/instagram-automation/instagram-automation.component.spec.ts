import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstagramAutomationComponent } from './instagram-automation.component';

describe('InstagramAutomationComponent', () => {
  let component: InstagramAutomationComponent;
  let fixture: ComponentFixture<InstagramAutomationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstagramAutomationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstagramAutomationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
