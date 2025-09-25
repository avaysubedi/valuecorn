import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { AuthStateService } from '../../app/core/auth-state.service';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { MATERIAL_IMPORTS } from '../../app/material.imports';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl:'./login.component.css',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MATERIAL_IMPORTS,
    NgIf
  ]
})
export class LoginComponent {
  error = '';

 loginForm: FormGroup;
 
  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private authState: AuthStateService
  ) {

 this.loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });


  }

  onLogin() {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.loginService.login(email!, password!).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.authState.setLoginState(true);
        console.log("Login successful, navigating to profile");
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.error = err?.error?.error || 'Login failed';
        console.error(err);
      }
    });
  }
}
