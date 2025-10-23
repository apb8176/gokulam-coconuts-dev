import { TestBed } from '@angular/core/testing';

import { BoApiService } from './bo-api-service';

describe('BoApiService', () => {
  let service: BoApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
