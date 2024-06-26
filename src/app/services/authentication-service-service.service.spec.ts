import { TestBed } from '@angular/core/testing';

import { AuthenticationServiceServiceService } from './authentication-service-service.service';

describe('AuthenticationServiceServiceService', () => {
  let service: AuthenticationServiceServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthenticationServiceServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
