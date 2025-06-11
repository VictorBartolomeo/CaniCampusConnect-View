import { TestBed } from '@angular/core/testing';

import { CoachDataService } from './coach-data.service';

describe('CoachDataService', () => {
  let service: CoachDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoachDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
