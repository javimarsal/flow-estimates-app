import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyProjectItemDialogComponent } from './my-project-item-dialog.component';

describe('MyProjectItemDialogComponent', () => {
  let component: MyProjectItemDialogComponent;
  let fixture: ComponentFixture<MyProjectItemDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyProjectItemDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyProjectItemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
