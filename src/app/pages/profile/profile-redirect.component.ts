import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-profile-redirect',
  standalone: true,
  template: '',
})
export class ProfileRedirectComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const target = this.authService.isAdmin() ? '/perfil/bits' : '/perfil/datos';
    void this.router.navigateByUrl(target);
  }
}
