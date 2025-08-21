import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoProfile } from './bo-profile';

describe('BoProfile', () => {
  let component: BoProfile;
  let fixture: ComponentFixture<BoProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
