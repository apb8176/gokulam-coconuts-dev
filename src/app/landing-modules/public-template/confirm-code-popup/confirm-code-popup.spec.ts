import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmCodePopup } from './confirm-code-popup';

describe('ConfirmCodePopup', () => {
  let component: ConfirmCodePopup;
  let fixture: ComponentFixture<ConfirmCodePopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfirmCodePopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmCodePopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
