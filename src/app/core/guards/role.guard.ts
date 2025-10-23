import { Injectable } from '@angular/core';
import { CanActivateChild, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { NotificationService } from '../../services/notification-service';
import { AuthService } from '../../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivateChild {
  constructor(
    private auth: AuthService,
    private router: Router,
    private notify: NotificationService
  ) {}

  // make async so we can await confirm dialog and logout
  async canActivateChild(childRoute: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    const allowedRoles: string[] = childRoute.data?.['allowedRoles'] || [];
    const user = this.auth.getUser();
    console.log('RoleGuard - current user:', user);

    // Not signed in -> go to public root
    if (!user) {
      return this.router.parseUrl('/home');
    }

    // helper to normalize role strings
    const normalize = (v: any) => (v || '').toString().trim().toLowerCase();

    // Handle approval states first
    if (!(user.approval === 'approved' || user.approval === true)) {
      // Compose message text based on state
      let title = 'Account status';
      let msg = 'Your account is not approved to access this area.';
      if (user.approval === 'pending') {
        title = 'Waiting for approval';
        msg = 'Your account is pending admin approval. Click OK to logout and try again later.';
      } else if (user.approval === 'rejected') {
        title = 'Account rejected';
        msg = (user.rejectMessage && user.rejectMessage.toString().trim()) || 'Your account has been rejected by admin. Click OK to logout.';
      } else {
        // any other state
        msg = 'Your account approval status does not allow access. Click OK to logout.';
      }

      try {
        // Prefer NotificationService.confirm which should return Promise<boolean>
        let confirmed = false;
        if (typeof (this.notify as any).confirm === 'function') {
          const res = (this.notify as any).confirm(title, msg);
          if (res && typeof res.then === 'function') {
            confirmed = await res;
          } else {
            // synchronous return
            confirmed = !!res;
          }
        } else {
          // fallback to window.confirm
          confirmed = window.confirm(`${title}\n\n${msg}`);
        }

        if (confirmed) {
          // user clicked OK -> logout then redirect to home
          try {
            // logout might be sync or return a promise
            const r = this.auth.logout();
            if (r && typeof (r as Promise<any>).then === 'function') {
              await r;
            }
          } catch (e) {
            console.warn('RoleGuard: logout failed', e);
          }
        }
      } catch (ex) {
        // If something fails with notifier, fallback to alert + logout
        try { window.alert(msg); } catch {}
        try {
          const r = this.auth.logout();
          if (r && typeof (r as Promise<any>).then === 'function') {
            await r;
          }
        } catch (e) {
          console.warn('RoleGuard: logout failed in fallback', e);
        }
      }

      // After showing message & optional logout, send user to public root
      return this.router.parseUrl('/home');
    }

    // If allowedRoles not specified, allow access
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    // Build normalized list of user's roles (support multiple shapes)
    const userRolesSet = new Set<string>();

    // common user fields
    if ((user as any).user_type) userRolesSet.add(normalize((user as any).user_type));
    if ((user as any).userType) userRolesSet.add(normalize((user as any).userType));
    if ((user as any).role) userRolesSet.add(normalize((user as any).role));
    if (Array.isArray((user as any).roles)) {
      (user as any).roles.forEach((r: any) => userRolesSet.add(normalize(r)));
    }

    // custom attributes from backend / Cognito
    if ((user as any)['custom:role']) userRolesSet.add(normalize((user as any)['custom:role']));
    if ((user as any)['custom:userType']) userRolesSet.add(normalize((user as any)['custom:userType']));

    // boolean admin flag
    if ((user as any).isAdmin === true) userRolesSet.add('admin');

    // attempt to read token claims from AuthService if available
    try {
      const tokenClaims = (this.auth as any).getTokenClaims?.() || {};
      if (tokenClaims) {
        if (Array.isArray(tokenClaims['cognito:groups'])) {
          tokenClaims['cognito:groups'].forEach((g: any) => userRolesSet.add(normalize(g)));
        }
        if (tokenClaims.role) userRolesSet.add(normalize(tokenClaims.role));
        if (tokenClaims['custom:role']) userRolesSet.add(normalize(tokenClaims['custom:role']));
      }
    } catch (e) {
      // ignore if not available
    }

    // Final normalized arrays
    const normalizedUserRoles = Array.from(userRolesSet).filter(Boolean);
    const normalizedAllowed = allowedRoles.map(normalize).filter(Boolean);

    console.log('RoleGuard: allowedRoles=', normalizedAllowed, ' userRoles=', normalizedUserRoles);

    // admin bypass: allow everything for admin
    if (normalizedUserRoles.includes('admin')) {
      return true;
    }

    // Check intersection
    const hasAccess = normalizedUserRoles.some((r) => normalizedAllowed.includes(r));

    if (hasAccess) {
      return true;
    }

    // No matching role -> notify and redirect to persona root
    try {
      if (typeof (this.notify as any).showInfo === 'function') {
        (this.notify as any).showInfo('Access denied', 'You do not have permission to access this area. Redirecting you to your dashboard.');
      } else {
        window.alert('You do not have permission to access this area. Redirecting you to your dashboard.');
      }
    } catch (e) {
      // ignore notify errors
    }

    const personaRoot = this.auth.getPersonaRoot?.(user) || '/';
    return this.router.parseUrl(personaRoot);
  }
}
