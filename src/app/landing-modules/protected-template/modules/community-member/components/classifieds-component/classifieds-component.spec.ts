import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassifiedsComponent } from './classifieds-component';

describe('ClassifiedsComponent', () => {
  let component: ClassifiedsComponent;
  let fixture: ComponentFixture<ClassifiedsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClassifiedsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassifiedsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
