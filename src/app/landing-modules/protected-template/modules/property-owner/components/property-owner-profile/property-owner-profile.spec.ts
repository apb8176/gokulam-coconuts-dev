import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyOwnerProfile } from './property-owner-profile';

describe('BoProfile', () => {
  let component: PropertyOwnerProfile;
  let fixture: ComponentFixture<PropertyOwnerProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PropertyOwnerProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyOwnerProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
