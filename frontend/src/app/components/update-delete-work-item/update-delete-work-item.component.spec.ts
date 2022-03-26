import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateDeleteWorkItemComponent } from './update-delete-work-item.component';

describe('ReadDeleteWorkItemComponent', () => {
  let component: UpdateDeleteWorkItemComponent;
  let fixture: ComponentFixture<UpdateDeleteWorkItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateDeleteWorkItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateDeleteWorkItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
