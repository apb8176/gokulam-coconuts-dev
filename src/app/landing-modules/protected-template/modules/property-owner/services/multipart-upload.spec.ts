import { TestBed } from '@angular/core/testing';

import { MultipartUpload } from './multipart-upload';

describe('MultipartUpload', () => {
  let service: MultipartUpload;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MultipartUpload);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
