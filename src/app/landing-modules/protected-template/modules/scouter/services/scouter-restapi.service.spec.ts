import { TestBed } from '@angular/core/testing';

import { ScouterRestapiService } from './scouter-restapi.service';

describe('ScouterRestapiService', () => {
  let service: ScouterRestapiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScouterRestapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
