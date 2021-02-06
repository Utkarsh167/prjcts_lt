import { TestBed } from '@angular/core/testing';

import { DataObjectService } from './data-object.service';

describe('DataObjectService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DataObjectService = TestBed.get(DataObjectService);
    expect(service).toBeTruthy();
  });
});
