import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const pwd = control.get('password');
  const confirm = control.get('confirmPassword');
  if (!pwd || !confirm) return null;
  return pwd.value !== confirm.value ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirm = false;

  passwordStrength = 0;
  strengthLabels = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordsMatch });

    this.form.get('password')!.valueChanges.subscribe(val => {
      this.passwordStrength = this.calcStrength(val || '');
    });
  }

  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
  get confirmPassword() { return this.form.get('confirmPassword')!; }

  get strengthClass() {
    return ['', 'weak', 'fair', 'good', 'strong'][this.passwordStrength];
  }

  calcStrength(pwd: string): number {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    return Math.min(4, score);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register({
      email: this.email.value,
      password: this.password.value
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          // Important : le backend ne renvoie PAS de token JWT lors de
          // l'inscription (voir AuthService.register() côté Spring, qui
          // construit l'AuthResponse avec token = null). Rediriger vers
          // /accueil ici enverrait un utilisateur sans token vers des
          // routes protégées → 403 sur tous les appels API.
          // On redirige donc vers la page de connexion pour qu'il obtienne
          // un vrai token via /auth/login.
          this.router.navigate(['/auth/login'], {
            queryParams: { registered: '1' }
          });
        } else {
          this.errorMessage = res.message || 'Inscription échouée.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.status === 409
            ? 'Un compte existe déjà avec cet email.'
            : 'Une erreur est survenue. Réessayez.';
      }
    });
  }
}
