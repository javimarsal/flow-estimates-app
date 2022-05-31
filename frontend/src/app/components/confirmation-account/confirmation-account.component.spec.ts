import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationAccountComponent } from './confirmation-account.component';

describe('ConfirmationAccountComponent', () => {
  let component: ConfirmationAccountComponent;
  let fixture: ComponentFixture<ConfirmationAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmationAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
