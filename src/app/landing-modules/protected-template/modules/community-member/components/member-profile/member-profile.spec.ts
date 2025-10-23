import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemeberProfile } from './member-profile';

describe('BoProfile', () => {
  let component: MemeberProfile;
  let fixture: ComponentFixture<MemeberProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MemeberProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemeberProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
