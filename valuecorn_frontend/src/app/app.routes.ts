import { Routes } from '@angular/router';
import { LoginComponent } from '../pages/login/login.component';
import { ProfileComponent } from '../pages/profile/profile.component';
import { AuthGuard } from './core/auth.guard';
import { RegisterComponent } from '../pages/register/register.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
        {path: 'profile',
        loadComponent: () => import('../pages/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [AuthGuard]
        },
        {
            path: 'valuation',
            loadComponent: () => import('../pages/valuation/valuation.component').then(m => m.ValuationComponent),
            canActivate: [AuthGuard]
          },
           {path: 'projection',
        loadComponent: () => import('../pages/projection/projection.component').then(m => m.ProjectionComponent),
        canActivate: [AuthGuard]
        },
          
];
