import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YsDashboard } from './ys-dashboard';

describe('YsDashboard', () => {
  let component: YsDashboard;
  let fixture: ComponentFixture<YsDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [YsDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YsDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
