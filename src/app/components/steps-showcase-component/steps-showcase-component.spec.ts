import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepsShowcaseComponent } from './steps-showcase-component';

describe('StepsShowcaseComponent', () => {
  let component: StepsShowcaseComponent;
  let fixture: ComponentFixture<StepsShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepsShowcaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepsShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
