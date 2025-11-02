import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryFilterChip } from './category-filter-chip';

describe('CategoryFilterChip', () => {
  let component: CategoryFilterChip;
  let fixture: ComponentFixture<CategoryFilterChip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryFilterChip]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryFilterChip);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
