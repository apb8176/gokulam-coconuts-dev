import { TestBed } from '@angular/core/testing';

import { YogaApiService } from './yoga-api-service';

describe('YogaApiService', () => {
  let service: YogaApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(YogaApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
