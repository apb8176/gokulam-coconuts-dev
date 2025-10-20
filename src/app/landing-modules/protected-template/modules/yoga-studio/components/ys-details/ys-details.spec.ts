import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YsDetails } from './ys-details';

describe('YsDetails', () => {
  let component: YsDetails;
  let fixture: ComponentFixture<YsDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [YsDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YsDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
