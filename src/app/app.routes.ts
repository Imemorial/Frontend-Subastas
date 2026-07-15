import { Routes } from '@angular/router';

import { adminGuard } from './core/admin/admin.guard';
import { ClientProfileGuard } from './core/profile/client-profile.guard';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { AdminAuctionsPageComponent } from './pages/admin/admin-auctions-page.component';
import { AdminDashboardPageComponent } from './pages/admin/admin-dashboard-page.component';
import { AdminLayoutComponent } from './pages/admin/admin-layout.component';
import { AdminWinnersPageComponent } from './pages/admin/admin-winners-page.component';
import { AdminProductsPageComponent } from './pages/admin/admin-products-page.component';
import { ForgotPasswordPageComponent } from './pages/forgot-password-page/forgot-password-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ProfileBitsPageComponent } from './pages/profile/profile-bits-page.component';
import { ProfileLayoutComponent } from './pages/profile/profile-layout.component';
import { ProfileRedirectComponent } from './pages/profile/profile-redirect.component';
import { ProfilePersonalPageComponent } from './pages/profile/profile-personal-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { ResetPasswordPageComponent } from './pages/reset-password-page/reset-password-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    component: RegisterPageComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'olvide-contrasena',
    component: ForgotPasswordPageComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'restablecer-contrasena',
    component: ResetPasswordPageComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'perfil',
    component: ProfileLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: ProfileRedirectComponent },
      { path: 'datos', component: ProfilePersonalPageComponent, canActivate: [ClientProfileGuard] },
      { path: 'bits', component: ProfileBitsPageComponent },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', component: AdminDashboardPageComponent },
      { path: 'products', component: AdminProductsPageComponent },
      { path: 'auctions', component: AdminAuctionsPageComponent },
      { path: 'winners', component: AdminWinnersPageComponent },
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
