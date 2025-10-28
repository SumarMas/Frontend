import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignRegister } from './campaign-register';

describe('CampaignRegister', () => {
  let component: CampaignRegister;
  let fixture: ComponentFixture<CampaignRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignRegister]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
