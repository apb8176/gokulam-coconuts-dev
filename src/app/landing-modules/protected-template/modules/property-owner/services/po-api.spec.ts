import { TestBed } from '@angular/core/testing';

import { PoApi } from './po-api';

describe('PoApi', () => {
  let service: PoApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PoApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
