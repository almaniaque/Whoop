import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService, AuthResponse } from '../../core/services/auth.service';

const mockSuccess: AuthResponse = { success: true, message: 'OK', userId: 1, email: 'test@test.com' };
const mockFailure: AuthResponse = { success: false, message: 'Identifiants incorrects', userId: null, email: null };

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('crée le composant', () => {
    expect(component).toBeTruthy();
  });

  it('formulaire invalide si vide', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('formulaire valide avec email et mot de passe corrects', () => {
    component.loginForm.setValue({ email: 'test@test.com', password: '123456' });
    expect(component.loginForm.valid).toBeTrue();
  });

  it('email invalide sans @', () => {
    component.loginForm.get('email')!.setValue('pasunemail');
    expect(component.loginForm.get('email')!.invalid).toBeTrue();
  });

  it('password invalide si moins de 6 caractères', () => {
    component.loginForm.get('password')!.setValue('123');
    expect(component.loginForm.get('password')!.invalid).toBeTrue();
  });

  it('ne soumet pas si formulaire invalide', () => {
    component.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('appelle authService.login si formulaire valide', () => {
    authService.login.and.returnValue(of(mockSuccess));
    component.loginForm.setValue({ email: 'test@test.com', password: '123456' });
    component.onSubmit();
    expect(authService.login).toHaveBeenCalledWith({ email: 'test@test.com', password: '123456' });
  });

  it('affiche errorMessage si success=false', () => {
    authService.login.and.returnValue(of(mockFailure));
    component.loginForm.setValue({ email: 'test@test.com', password: '123456' });
    component.onSubmit();
    expect(component.errorMessage).toBe('Identifiants incorrects');
  });

  it('affiche message d\'erreur 401', () => {
    authService.login.and.returnValue(throwError(() => ({ status: 401 })));
    component.loginForm.setValue({ email: 'test@test.com', password: '123456' });
    component.onSubmit();
    expect(component.errorMessage).toBe('Email ou mot de passe incorrect.');
  });

  it('toggle affiche/masque le mot de passe', () => {
    expect(component.showPassword).toBeFalse();
    component.togglePassword();
    expect(component.showPassword).toBeTrue();
  });
});
