import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  form: FormGroup;
  tokenControl = new FormControl('', [Validators.required, Validators.minLength(10)]);
  isLoading = false;
  submitted = false;
  errorMessage = '';
  tokenError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() { return this.form.get('email')!; }
  get token() { return this.tokenControl; }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.forgotPassword(this.form.value).pipe(
      timeout(10_000),
      catchError((err) => of({ __error: true, isTimeout: err?.name === 'TimeoutError' } as any))
    ).subscribe((res: any) => {
      this.isLoading = false;
      if (res?.__error) {
        this.errorMessage = res.isTimeout
          ? 'Le serveur ne répond pas. Vérifiez que le backend est démarré.'
          : 'Une erreur est survenue. Réessayez.';
        return;
      }
      this.submitted = true;
    });
  }

  useToken() {
    if (this.tokenControl.invalid) {
      this.tokenControl.markAsTouched();
      this.tokenError = 'Veuillez coller le token depuis les logs du terminal.';
      return;
    }
    this.tokenError = '';
    this.router.navigate(['/auth/reset-password'], {
      queryParams: { token: this.tokenControl.value!.trim() }
    });
  }

  resend() {
    this.submitted = false;
    this.tokenControl.reset();
    this.tokenError = '';
  }
}