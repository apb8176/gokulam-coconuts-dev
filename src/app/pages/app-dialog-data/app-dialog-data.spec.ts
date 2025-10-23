import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDialogData } from './app-dialog-data';

describe('AppDialogData', () => {
  let component: AppDialogData;
  let fixture: ComponentFixture<AppDialogData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppDialogData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDialogData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
