import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuDevis } from './menu-devis';

describe('MenuDevis', () => {
  let component: MenuDevis;
  let fixture: ComponentFixture<MenuDevis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuDevis],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuDevis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
