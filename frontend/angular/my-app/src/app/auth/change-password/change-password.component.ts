import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, AbstractControl, ValidationErrors
} from '@angular/forms';

import { AuthService, UpdatePasswordRequest } from '../core/services/auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const pwd = control.get('newPassword');
  const confirm = control.get('confirmPassword');
  if (!pwd || !confirm) return null;
  return pwd.value !== confirm.value ? { mismatch: true } : null;
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  form: FormGroup;
  isLoading = false;
  success = false;
  errorMessage = '';
  showCurrent = false;
  showNew = false;
  showConfirm = false;

  passwordStrength = 0;
  strengthLabels = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,

  ) {
    this.form = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordsMatch });

    this.form.get('newPassword')!.valueChanges.subscribe(val => {
      this.passwordStrength = this.calcStrength(val || '');
    });
  }

  get currentPassword() { return this.form.get('currentPassword')!; }
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // PUT /api/auth/user/{id}/password → { oldMdp, newMdp }
    const payload: UpdatePasswordRequest = {
      oldMdp: this.currentPassword.value,
      newMdp: this.newPassword.value
    };

    this.authService.changePassword(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.success = true;
        } else {
          this.errorMessage = res.message || 'Une erreur est survenue.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.status === 400
            ? 'Ancien mot de passe incorrect.'
            : 'Une erreur est survenue. Réessayez.';
      }
    });
  }
}
