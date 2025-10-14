import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScouterDashboard } from './scouter-dashboard';

describe('ScouterDashboard', () => {
  let component: ScouterDashboard;
  let fixture: ComponentFixture<ScouterDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScouterDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScouterDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
