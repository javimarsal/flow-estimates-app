import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWorkItemComponent } from './create-work-item.component';

describe('CreateWorkItemComponent', () => {
  let component: CreateWorkItemComponent;
  let fixture: ComponentFixture<CreateWorkItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateWorkItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateWorkItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
