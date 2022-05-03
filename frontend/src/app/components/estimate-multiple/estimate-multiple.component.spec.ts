import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstimateMultipleComponent } from './estimate-multiple.component';

describe('EstimateMultipleComponent', () => {
  let component: EstimateMultipleComponent;
  let fixture: ComponentFixture<EstimateMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstimateMultipleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EstimateMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
