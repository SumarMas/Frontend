import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationRegister } from './donation-register';

describe('DonationRegister', () => {
  let component: DonationRegister;
  let fixture: ComponentFixture<DonationRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonationRegister]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonationRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
