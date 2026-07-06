import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevisFormComponent } from './devis-form';

describe('DevisPanelComponent', () => {
  let component: DevisFormComponent;
  let fixture: ComponentFixture<DevisFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevisFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DevisFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
