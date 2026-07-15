import { Routes } from '@angular/router';

import { adminGuard } from './core/admin/admin.guard';
import { ClientProfileGuard } from './core/profile/client-profile.guard';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { HomePageComponent } from './pages/home-page/home-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login-page/login-page.component').then((m) => m.LoginPageComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register-page/register-page.component').then((m) => m.RegisterPageComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'olvide-contrasena',
    loadComponent: () =>
      import('./pages/forgot-password-page/forgot-password-page.component').then(
        (m) => m.ForgotPasswordPageComponent,
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'restablecer-contrasena',
    loadComponent: () =>
      import('./pages/reset-password-page/reset-password-page.component').then(
        (m) => m.ResetPasswordPageComponent,
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./pages/profile/profile-layout.component').then((m) => m.ProfileLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/profile/profile-redirect.component').then((m) => m.ProfileRedirectComponent),
      },
      {
        path: 'datos',
        loadComponent: () =>
          import('./pages/profile/profile-personal-page.component').then(
            (m) => m.ProfilePersonalPageComponent,
          ),
        canActivate: [ClientProfileGuard],
      },
      {
        path: 'bits',
        loadComponent: () =>
          import('./pages/profile/profile-bits-page.component').then((m) => m.ProfileBitsPageComponent),
      },
    ],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/admin/admin-dashboard-page.component').then(
            (m) => m.AdminDashboardPageComponent,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/admin/admin-products-page.component').then(
            (m) => m.AdminProductsPageComponent,
          ),
      },
      {
        path: 'auctions',
        loadComponent: () =>
          import('./pages/admin/admin-auctions-page.component').then(
            (m) => m.AdminAuctionsPageComponent,
          ),
      },
      {
        path: 'winners',
        loadComponent: () =>
          import('./pages/admin/admin-winners-page.component').then(
            (m) => m.AdminWinnersPageComponent,
          ),
      },
    ],
  },
  {
    path: 'dashboard',
    redirectTo: '',
    pathMatch: 'full',
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
