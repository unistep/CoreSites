import { TestBed } from '@angular/core/testing';

import { AngularToolkitService } from './angular-toolkit.service';

describe('AngularToolkitService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AngularToolkitService = TestBed.get(AngularToolkitService);
    expect(service).toBeTruthy();
  });
});
