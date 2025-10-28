import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingPopupComponent } from './billing-popup-component';

describe('BillingPopupComponent', () => {
  let component: BillingPopupComponent;
  let fixture: ComponentFixture<BillingPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillingPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillingPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
