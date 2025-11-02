import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentaryDisplayComponent } from './commentary-display-component';

describe('CommentaryDisplayComponent', () => {
  let component: CommentaryDisplayComponent;
  let fixture: ComponentFixture<CommentaryDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentaryDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentaryDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
