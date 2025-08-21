import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectedTemplate } from './protected-template';

describe('ProtectedTemplate', () => {
  let component: ProtectedTemplate;
  let fixture: ComponentFixture<ProtectedTemplate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProtectedTemplate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProtectedTemplate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
