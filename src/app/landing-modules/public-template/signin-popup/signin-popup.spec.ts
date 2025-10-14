import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SigninPopup } from './signin-popup';

describe('SigninPopup', () => {
  let component: SigninPopup;
  let fixture: ComponentFixture<SigninPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SigninPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SigninPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
