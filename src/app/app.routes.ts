import { Routes } from '@angular/router';

import { adminGuard } from './core/admin/admin.guard';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { AdminAuctionsPageComponent } from './pages/admin/admin-auctions-page.component';
import { AdminDashboardPageComponent } from './pages/admin/admin-dashboard-page.component';
import { AdminLayoutComponent } from './pages/admin/admin-layout.component';
import { AdminWinnersPageComponent } from './pages/admin/admin-winners-page.component';
import { AdminProductsPageComponent } from './pages/admin/admin-products-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';

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
