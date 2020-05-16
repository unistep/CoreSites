import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PosPopupComponent } from './pos-popup.component';

describe('PosPopupComponent', () => {
  let component: PosPopupComponent;
  let fixture: ComponentFixture<PosPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PosPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PosPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
