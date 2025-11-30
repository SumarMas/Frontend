import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardOrganization } from './dashboard-organization';

describe('DashboardOrganization', () => {
  let component: DashboardOrganization;
  let fixture: ComponentFixture<DashboardOrganization>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardOrganization]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardOrganization);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
