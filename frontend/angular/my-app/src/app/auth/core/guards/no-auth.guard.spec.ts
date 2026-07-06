import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { NoAuthGuard } from './no-auth.guard';
import { AuthService } from '../services/auth.service';

describe('NoAuthGuard', () => {
  let guard: NoAuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [NoAuthGuard, { provide: AuthService, useValue: spy }]
    });

    guard = TestBed.inject(NoAuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
  });

  it('laisse passer si non connecté', () => {
    authService.isAuthenticated.and.returnValue(false);
    expect(guard.canActivate()).toBeTrue();
  });

  it('redirige vers /accueil si déjà connecté', () => {
    authService.isAuthenticated.and.returnValue(true);
    spyOn(router, 'navigate');
    expect(guard.canActivate()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/accueil']);
  });
});
