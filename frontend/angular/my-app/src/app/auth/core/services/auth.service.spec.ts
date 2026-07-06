import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { Router } from '@angular/router';
import { AuthService, AuthResponse } from './auth.service';

const mockSuccess: AuthResponse = {
  success: true,
  message: 'OK',
  userId: 1,
  email: 'test@test.com',
  token: 'fake-jwt-token',
  photoUrl: null
};

const mockFailure: AuthResponse = {
  success: false,
  message: 'Erreur',
  userId: null,
  email: null,
  token: null,
  photoUrl: null
};

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: []
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  // ── isAuthenticated ──────────────────────────────────────────────────────────

  it('isAuthenticated() retourne false si localStorage vide', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('isAuthenticated() retourne false si userId présent mais pas de token', () => {
    localStorage.setItem('userId', '1');
    expect(service.isAuthenticated()).toBe(false);
  });

  it('isAuthenticated() retourne true si userId ET token présents', () => {
    localStorage.setItem('userId', '1');
    localStorage.setItem('token', 'fake-jwt-token');
    expect(service.isAuthenticated()).toBe(true);
  });
  // ── login ────────────────────────────────────────────────────────────────────

  it('login() stocke userId, user et token si success', () => {
    service.login({ email: 'test@test.com', password: '12345678' }).subscribe();
    const req = http.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockSuccess);

    expect(localStorage.getItem('userId')).toBe('1');
    expect(localStorage.getItem('user')).toBeTruthy();
    expect(localStorage.getItem('token')).toBe('fake-jwt-token');
  });

  it('login() ne stocke rien si success=false', () => {
    service.login({ email: 'test@test.com', password: 'wrong' }).subscribe();
    http.expectOne('http://localhost:8080/api/auth/login').flush(mockFailure);

    expect(localStorage.getItem('userId')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  // ── register ─────────────────────────────────────────────────────────────────

  it('register() stocke userId si success', () => {
    service.register({ email: 'new@test.com', password: '12345678' }).subscribe();
    http.expectOne('http://localhost:8080/api/auth/register').flush(mockSuccess);

    expect(localStorage.getItem('userId')).toBe('1');
  });

  it('register() ne stocke pas de token (le backend n\'en génère pas à l\'inscription)', () => {
    service.register({ email: 'new@test.com', password: '12345678' }).subscribe();
    http.expectOne('http://localhost:8080/api/auth/register').flush(mockSuccess);

    expect(localStorage.getItem('token')).toBeNull();
  });

  // ── logout ───────────────────────────────────────────────────────────────────

  it('logout() vide le localStorage et redirige vers /auth/login', () => {
    localStorage.setItem('userId', '1');
    localStorage.setItem('user', '{}');
    localStorage.setItem('token', 'fake-jwt-token');
    spyOn(router, 'navigate');

    service.logout();

    expect(localStorage.getItem('userId')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  // ── getUserId ────────────────────────────────────────────────────────────────

  it('getUserId() retourne null si non connecté', () => {
    expect(service.getUserId()).toBeNull();
  });

  it('getUserId() retourne la valeur stockée', () => {
    localStorage.setItem('userId', '42');
    expect(service.getUserId()).toBe('42');
  });

  // ── getToken ─────────────────────────────────────────────────────────────────

  it('getToken() retourne null si non connecté', () => {
    expect(service.getToken()).toBeNull();
  });

  it('getToken() retourne la valeur stockée', () => {
    localStorage.setItem('token', 'fake-jwt-token');
    expect(service.getToken()).toBe('fake-jwt-token');
  });

  // ── changePassword ───────────────────────────────────────────────────────────

  it('changePassword() lève une erreur si non connecté', () => {
    expect(() => service.changePassword({ oldMdp: 'a', newMdp: 'b' })).toThrowError('Utilisateur non connecté');
  });

  it('changePassword() appelle PUT /api/auth/user/{id}/password', () => {
    localStorage.setItem('userId', '5');
    service.changePassword({ oldMdp: 'ancien', newMdp: 'nouveau' }).subscribe();
    const req = http.expectOne('http://localhost:8080/api/auth/user/5/password');
    expect(req.request.method).toBe('PUT');
    req.flush(mockSuccess);
  });

  // ── forgotPassword ───────────────────────────────────────────────────────────

  it('forgotPassword() appelle POST /api/auth/forgot-password', () => {
    service.forgotPassword({ email: 'test@test.com' }).subscribe();
    const req = http.expectOne('http://localhost:8080/api/auth/forgot-password');
    expect(req.request.method).toBe('POST');
    req.flush(mockSuccess);
  });

  // ── resetPassword ─────────────────────────────────────────────────────────────

  it('resetPassword() appelle POST /api/auth/reset-password', () => {
    service.resetPassword({ token: 'abc123', newPassword: 'newpwd123' }).subscribe();
    const req = http.expectOne('http://localhost:8080/api/auth/reset-password');
    expect(req.request.method).toBe('POST');
    req.flush(mockSuccess);
  });
});