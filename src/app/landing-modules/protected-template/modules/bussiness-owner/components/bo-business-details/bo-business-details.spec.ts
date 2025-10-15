import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoBusinessDetails } from './bo-business-details';

describe('BoBusinessDetails', () => {
  let component: BoBusinessDetails;
  let fixture: ComponentFixture<BoBusinessDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoBusinessDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoBusinessDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
