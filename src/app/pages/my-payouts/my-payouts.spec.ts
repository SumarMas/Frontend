import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPayouts } from './my-payouts';

describe('MyPayouts', () => {
  let component: MyPayouts;
  let fixture: ComponentFixture<MyPayouts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPayouts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPayouts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
