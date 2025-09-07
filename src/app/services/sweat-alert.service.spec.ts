import { TestBed } from '@angular/core/testing';

import { SweatAlertService } from './sweat-alert.service';

describe('SweatAlertService', () => {
  let service: SweatAlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SweatAlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
