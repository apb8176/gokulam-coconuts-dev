import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityDetails } from './entity-details';

describe('EntityDetails', () => {
  let component: EntityDetails;
  let fixture: ComponentFixture<EntityDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EntityDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
