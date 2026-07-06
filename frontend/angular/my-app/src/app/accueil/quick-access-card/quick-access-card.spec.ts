import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickAccessCard } from './quick-access-card';

describe('QuickAccessCard', () => {
  let component: QuickAccessCard;
  let fixture: ComponentFixture<QuickAccessCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickAccessCard],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickAccessCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
