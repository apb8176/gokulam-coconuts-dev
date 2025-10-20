import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YsEventDetails } from './ys-event-details';

describe('YsEventDetails', () => {
  let component: YsEventDetails;
  let fixture: ComponentFixture<YsEventDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [YsEventDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YsEventDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
