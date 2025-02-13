import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatchService } from './match.service';

describe('MatchService', () => {
  let service: MatchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(MatchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
