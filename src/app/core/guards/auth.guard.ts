import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { NotificationService } from '../../services/notification-service';
import { AuthService } from '../../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private notify: NotificationService
  ) {}

  canActivate(): boolean | UrlTree {
    const user:any = this.auth.getUser();
   
    // Not signed in -> go to public template (root)
    if (!user) {
      return this.router.parseUrl('/');
    }
    if (user.approval === 'approved') {
      // safe fallback
      return true;
    }
    // If pending approval -> remain on home (public root) and show waiting popup
    
    if (user.approval === 'pending') {
      if(user.user_type === 'business-owner'||user.user_type === 'property-owner'||user.user_type === 'yoga-studio'){
        this.notify.confirm('Payment is pending', 'Complete payment to continue .');
        this.router.navigateByUrl('/');
      }
      else{
        this.notify.showInfo('Waiting for approval', 'Your account is pending admin approval.');
        return this.router.parseUrl('/');
      }
      // ensure user stays at public/home (you said: "stay at home page while signing in")
      
    }

    // If rejected -> show reject message and remain on public home
    if (user.approval === 'rejected') {
      const msg = user.rejectMessage || 'Your account has been rejected by admin.';
      this.notify.showInfo('Account rejected', msg);
      return this.router.parseUrl('/');
    }

    // If explicitly false or not true -> block
    if (user.approval !== true) {
      // safe fallback
      return this.router.parseUrl('/');
    }

    // Approved: allow navigation to protected template — but further role checks
    return true;
  }
}
