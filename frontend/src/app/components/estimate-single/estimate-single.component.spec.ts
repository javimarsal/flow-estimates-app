import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstimateSingleComponent } from './estimate-single.component';

describe('EstimateSingleComponent', () => {
  let component: EstimateSingleComponent;
  let fixture: ComponentFixture<EstimateSingleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstimateSingleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EstimateSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
