import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../../app/core/auth-state.service';
import { RouterModule } from '@angular/router'; // 🛠️ import this!

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  constructor(public authState: AuthStateService, private router: Router) {}

  logout() {
    this.authState.setLoginState(false);
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}