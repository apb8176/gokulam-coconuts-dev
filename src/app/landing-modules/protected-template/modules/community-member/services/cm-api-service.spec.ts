import { TestBed } from '@angular/core/testing';

import { CmApiService } from './cm-api-service';

describe('CmApiService', () => {
  let service: CmApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CmApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
