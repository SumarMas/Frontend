import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationThanks } from './donation-thanks';

describe('DonationThanks', () => {
  let component: DonationThanks;
  let fixture: ComponentFixture<DonationThanks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonationThanks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonationThanks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
