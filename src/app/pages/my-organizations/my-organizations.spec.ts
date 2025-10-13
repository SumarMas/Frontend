import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyOrganizations } from './my-organizations';

describe('MyOrganizations', () => {
  let component: MyOrganizations;
  let fixture: ComponentFixture<MyOrganizations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyOrganizations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyOrganizations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
