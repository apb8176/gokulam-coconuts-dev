import { Injectable } from '@angular/core';
import { CanActivateChild, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { NotificationService } from '../../services/notification-service';
import { AuthService } from '../../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivateChild {
  constructor(private auth: AuthService, private router: Router, private notify: NotificationService) {}

  canActivateChild(childRoute: ActivatedRouteSnapshot): boolean | UrlTree {
    const allowedRoles: string[] = childRoute.data['allowedRoles'] || [];
    const user = this.auth.getUser();
    console.log('User',user);
    
    // If no user, send to public
    if (!user) return this.router.parseUrl('/');
   if (user.approval === 'approved') {
      // safe fallback
      return true;
    }
    // If not approved, fallback to AuthGuard behavior (could be redundant if AuthGuard applied earlier)
    if (user.approval === 'pending') {
      this.notify.showInfo('Waiting for approval', 'Your account is pending admin approval.');
      return this.router.parseUrl('/');
    }
    if (user.approval === 'rejected') {
      this.notify.showInfo('Account rejected', user.rejectMessage || 'Rejected by admin.');
      return this.router.parseUrl('/');
    }
    if (user.approval !== true) return this.router.parseUrl('/');

    // If allowedRoles not specified, allow
    if (!allowedRoles || allowedRoles.length === 0) return true;

    // Check if user's role matches at least one allowed role
    if (allowedRoles.includes(user.user_type)) return true;

    // If role mismatch => redirect to user's persona root path
    this.notify.showInfo('Access denied', `Your account does not have access to this area. Redirecting you to your dashboard.`);
    return this.router.parseUrl(this.auth.getPersonaRoot(user));
  }
}
