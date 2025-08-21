import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoDashboard } from './bo-dashboard';

describe('BoDashboard', () => {
  let component: BoDashboard;
  let fixture: ComponentFixture<BoDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
