import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Logos } from './logos';

describe('Logos', () => {
  let component: Logos;
  let fixture: ComponentFixture<Logos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Logos],
    }).compileComponents();

    fixture = TestBed.createComponent(Logos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
