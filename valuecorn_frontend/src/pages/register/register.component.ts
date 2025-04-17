// src/pages/register/register.component.ts
import { Component } from '@angular/core';
import { RegisterService } from '../../services/register.service';
import { UserRegisterPayload } from '../../app/models/register-payload';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],  // ✅ Add this line
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class RegisterComponent {
  user: UserRegisterPayload = {
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  };

  error = '';
  success = '';

  constructor(private registerService: RegisterService, private router: Router) {}

  onRegister(form: NgForm) {
    if (form.invalid) return;

    this.registerService.register(this.user).subscribe({
      next: () => {
        this.success = 'Registration successful!';
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err?.error?.error || 'Registration failed';
        console.error(err);
      }
    });
  }
}
