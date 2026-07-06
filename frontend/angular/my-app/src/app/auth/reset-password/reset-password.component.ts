import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AuthService, ResetPasswordRequest } from '../core/services/auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const pwd = control.get('newPassword');
  const confirm = control.get('confirmPassword');
  if (!pwd || !confirm) return null;
  return pwd.value !== confirm.value ? { mismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  success = false;
  errorMessage = '';
  showNew = false;
  showConfirm = false;

  /** Token extrait de l'URL (?token=...) — généré par le backend (visible dans les logs) */
  token: string | null = null;
  tokenMissing = false;

  passwordStrength = 0;
  strengthLabels = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordsMatch });
  }

  ngOnInit(): void {
    // Récupère le token depuis le query param ?token=...
    // Ce token est généré par le backend et affiché dans les logs du terminal
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      this.tokenMissing = true;
      this.errorMessage = 'Lien invalide ou expiré. Veuillez faire une nouvelle demande.';
    }

    this.form.get('newPassword')!.valueChanges.subscribe(val => {
      this.passwordStrength = this.calcStrength(val || '');
    });
  }

  get newPassword() { return this.form.get('newPassword')!; }
  get confirmPassword() { return this.form.get('confirmPassword')!; }

  calcStrength(pwd: string): number {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    return Math.min(4, score);
  }

  get strengthClass() {
    return ['', 'weak', 'fair', 'good', 'strong'][this.passwordStrength];
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload: ResetPasswordRequest = {
      token: this.token,
      newPassword: this.newPassword.value
    };

    // POST /api/auth/reset-password → { token, newPassword }
    this.authService.resetPassword(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.success = true;
          setTimeout(() => this.router.navigate(['/auth/login']), 3000);
        } else {
          this.errorMessage = res.message || 'Une erreur est survenue.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.status === 400
            ? 'Le lien a expiré ou est invalide. Veuillez faire une nouvelle demande.'
            : 'Une erreur est survenue. Réessayez.';
      }
    });
  }
}
