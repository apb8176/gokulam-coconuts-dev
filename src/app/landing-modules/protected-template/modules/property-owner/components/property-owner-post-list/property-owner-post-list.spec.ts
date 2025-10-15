import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyOwnerPostList } from './property-owner-post-list';

describe('PropertyOwnerPostList', () => {
  let component: PropertyOwnerPostList;
  let fixture: ComponentFixture<PropertyOwnerPostList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PropertyOwnerPostList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyOwnerPostList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
