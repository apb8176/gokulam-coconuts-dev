import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyOwnerDashboard } from './property-owner-dashboard';

describe('BoDashboard', () => {
  let component: PropertyOwnerDashboard;
  let fixture: ComponentFixture<PropertyOwnerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PropertyOwnerDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyOwnerDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
