import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService, AuthResponse } from '../../core/services/auth.service';

const mockSuccess: AuthResponse = { success: true, message: 'OK', userId: 1, email: 'new@test.com' };
const mockFailure: AuthResponse = { success: false, message: 'Email déjà utilisé', userId: null, email: null };

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('crée le composant', () => {
    expect(component).toBeTruthy();
  });

  it('formulaire invalide si vide', () => {
    expect(component.form.valid).toBeFalse();
  });

  it('formulaire valide avec données correctes', () => {
    component.form.setValue({ email: 'new@test.com', password: '12345678', confirmPassword: '12345678' });
    expect(component.form.valid).toBeTrue();
  });

  it('erreur mismatch si mots de passe différents', () => {
    component.form.setValue({ email: 'new@test.com', password: '12345678', confirmPassword: 'different' });
    expect(component.form.errors?.['mismatch']).toBeTrue();
  });

  it('password invalide si moins de 8 caractères', () => {
    component.form.get('password')!.setValue('123');
    expect(component.form.get('password')!.invalid).toBeTrue();
  });

  it('ne soumet pas si formulaire invalide', () => {
    component.onSubmit();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('appelle authService.register si formulaire valide', () => {
    authService.register.and.returnValue(of(mockSuccess));
    component.form.setValue({ email: 'new@test.com', password: '12345678', confirmPassword: '12345678' });
    component.onSubmit();
    expect(authService.register).toHaveBeenCalledWith({ email: 'new@test.com', password: '12345678' });
  });

  it('affiche errorMessage si success=false', () => {
    authService.register.and.returnValue(of(mockFailure));
    component.form.setValue({ email: 'new@test.com', password: '12345678', confirmPassword: '12345678' });
    component.onSubmit();
    expect(component.errorMessage).toBe('Email déjà utilisé');
  });

  it('affiche message email déjà utilisé sur erreur 409', () => {
    authService.register.and.returnValue(throwError(() => ({ status: 409 })));
    component.form.setValue({ email: 'new@test.com', password: '12345678', confirmPassword: '12345678' });
    component.onSubmit();
    expect(component.errorMessage).toBe('Un compte existe déjà avec cet email.');
  });

  it('calcStrength retourne 0 pour mot de passe vide', () => {
    expect(component.calcStrength('')).toBe(0);
  });

  it('calcStrength retourne 4 pour mot de passe fort', () => {
    expect(component.calcStrength('Abcdef1!')).toBe(4);
  });
});
