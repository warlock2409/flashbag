import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageHolderComponent } from './page-holder.component';

describe('PageHolderComponent', () => {
  let component: PageHolderComponent;
  let fixture: ComponentFixture<PageHolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHolderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageHolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
