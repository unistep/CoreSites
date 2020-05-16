import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularToolkitComponent } from './angular-toolkit.component';

describe('AngularToolkitComponent', () => {
  let component: AngularToolkitComponent;
  let fixture: ComponentFixture<AngularToolkitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AngularToolkitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AngularToolkitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
