import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadDeleteWorkItemComponent } from './read-delete-work-item.component';

describe('ReadDeleteWorkItemComponent', () => {
  let component: ReadDeleteWorkItemComponent;
  let fixture: ComponentFixture<ReadDeleteWorkItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReadDeleteWorkItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadDeleteWorkItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
