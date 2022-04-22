import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkItemDialogComponent } from './work-item-dialog.component';

describe('WorkItemDialogComponent', () => {
  let component: WorkItemDialogComponent;
  let fixture: ComponentFixture<WorkItemDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkItemDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkItemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
