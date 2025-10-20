import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YsEventList } from './ys-event-list';

describe('YsEventList', () => {
  let component: YsEventList;
  let fixture: ComponentFixture<YsEventList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [YsEventList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YsEventList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
