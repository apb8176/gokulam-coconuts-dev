import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminAuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.auth.getUser();
    if (!user || user.user_type !== 'admin' || user.approval !== true) {
      // go to persona root or public
      const redirect = user ? this.auth.getPersonaRoot(user) : '/';
      this.router.navigateByUrl(redirect);
      return false;
    }
    return true;
  }
}
