import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryFilterDisplay } from './category-filter-display';

describe('CategoryFilterDisplay', () => {
  let component: CategoryFilterDisplay;
  let fixture: ComponentFixture<CategoryFilterDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryFilterDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryFilterDisplay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
