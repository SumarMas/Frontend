import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationRegister } from './organization-register';

describe('OrganizationRegister', () => {
  let component: OrganizationRegister;
  let fixture: ComponentFixture<OrganizationRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationRegister]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
