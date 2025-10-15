import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyOwnerPostDetails } from './property-owner-post-details';

describe('PropertyOwnerPostDetails', () => {
  let component: PropertyOwnerPostDetails;
  let fixture: ComponentFixture<PropertyOwnerPostDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PropertyOwnerPostDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyOwnerPostDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
