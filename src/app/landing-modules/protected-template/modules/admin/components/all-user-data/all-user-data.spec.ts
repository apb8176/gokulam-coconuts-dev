import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllUserData } from './all-user-data';

describe('AllUserData', () => {
  let component: AllUserData;
  let fixture: ComponentFixture<AllUserData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AllUserData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllUserData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
