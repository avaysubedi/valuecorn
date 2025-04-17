import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { AuthStateService } from '../../app/core/auth-state.service'; // for global login state
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone:true,
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(
    private loginService: LoginService,
    private router: Router,
    private authState: AuthStateService
  ) {}

  onLogin() {
    this.loginService.login(this.email, this.password).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);  // Save token if needed
        this.authState.setLoginState(true);        // ✅ Set login state here  
        console.log("Login successful, navigating to profile");
        this.router.navigate(['/profile'])
      },
      error: (err) => {
        this.error = err?.error?.error || 'Login failed';
        console.error(err);
      }
    });
  }
}
