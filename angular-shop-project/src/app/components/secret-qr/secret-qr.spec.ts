import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretQr } from './secret-qr';

describe('SecretQr', () => {
  let component: SecretQr;
  let fixture: ComponentFixture<SecretQr>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecretQr],
    }).compileComponents();

    fixture = TestBed.createComponent(SecretQr);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
