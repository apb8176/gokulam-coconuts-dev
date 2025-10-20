import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YsProfile } from './ys-profile';

describe('YsProfile', () => {
  let component: YsProfile;
  let fixture: ComponentFixture<YsProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [YsProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YsProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
