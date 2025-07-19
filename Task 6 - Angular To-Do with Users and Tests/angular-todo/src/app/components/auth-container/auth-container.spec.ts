import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterContainer } from './auth-container';

describe('RouterContainer', () => {
  let component: RouterContainer;
  let fixture: ComponentFixture<RouterContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterContainer],
    }).compileComponents();

    fixture = TestBed.createComponent(RouterContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
