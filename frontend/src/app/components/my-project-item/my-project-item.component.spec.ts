import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyProjectItemComponent } from './my-project-item.component';

describe('MyProjectItemComponent', () => {
  let component: MyProjectItemComponent;
  let fixture: ComponentFixture<MyProjectItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyProjectItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyProjectItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
