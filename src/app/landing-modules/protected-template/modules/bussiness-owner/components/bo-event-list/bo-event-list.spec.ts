import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoEventList } from './bo-event-list';

describe('BoEventList', () => {
  let component: BoEventList;
  let fixture: ComponentFixture<BoEventList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoEventList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoEventList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
