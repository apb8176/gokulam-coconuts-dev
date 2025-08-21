import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoPostList } from './bo-post-list';

describe('BoPostList', () => {
  let component: BoPostList;
  let fixture: ComponentFixture<BoPostList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoPostList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoPostList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
