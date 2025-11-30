import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingPayoutsList } from './pending-payouts-list';

describe('PendingPayoutsList', () => {
  let component: PendingPayoutsList;
  let fixture: ComponentFixture<PendingPayoutsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingPayoutsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingPayoutsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
