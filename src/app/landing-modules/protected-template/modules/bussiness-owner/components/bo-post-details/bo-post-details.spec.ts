import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoPostDetails } from './bo-post-details';

describe('BoPostDetails', () => {
  let component: BoPostDetails;
  let fixture: ComponentFixture<BoPostDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoPostDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoPostDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
