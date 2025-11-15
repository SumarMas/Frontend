import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingOrganizationList } from './pending-organization-list';

describe('PendingOrganizationList', () => {
  let component: PendingOrganizationList;
  let fixture: ComponentFixture<PendingOrganizationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingOrganizationList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingOrganizationList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
