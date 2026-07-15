import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class ClientProfileGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): boolean {
    if (this.authService.isAdmin()) {
      void this.router.navigate(['/perfil/bits']);
      return false;
    }

    return true;
  }
}
