import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopActionsComponent } from './shop-actions.component';

describe('ShopActionsComponent', () => {
  let component: ShopActionsComponent;
  let fixture: ComponentFixture<ShopActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
