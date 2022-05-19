import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstimateMultipleHowManyComponent } from './estimate-multiple-how-many.component';

describe('EstimateMultipleHowManyComponent', () => {
  let component: EstimateMultipleHowManyComponent;
  let fixture: ComponentFixture<EstimateMultipleHowManyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstimateMultipleHowManyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EstimateMultipleHowManyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
