// public-template.component.ts
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { SignupPopupService } from './signup-popup.service';

@Component({
  selector: 'app-public-template',
  templateUrl: './public-template.html',
  // keep styles in a separate scss file if you want; Tailwind handles most styling
  styleUrls: ['./public-template.scss'],
  standalone: false,
})
export class PublicTemplate implements OnInit, OnDestroy {
  mobileMenuOpen = false;
  showSignupPopup = false;
  showLoginForm = false;
  showConfirmUserForm = false;
  private readonly destroy$ = new Subject<void>();

  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly router = inject(Router);

  configuration$ = this.oidcSecurityService.getConfiguration();
  userData$ = this.oidcSecurityService.userData$;
  constructor(
    private readonly auth: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly signupPopupService: SignupPopupService
  ) { }
  isAuthenticated = false;
showBillingPopup: boolean = false;
  userData: any;

  ngOnInit(): void {
     let  user:any = this.auth.getUser();
   
    // Not signed in -> go to public template (root)
  
    
    // If pending approval -> remain on home (public root) and show waiting popup
    
    if (user &&  user.approval && user.approval === 'pending') {
      if(user.user_type === 'business-owner'||user.user_type === 'property-owner'||user.user_type === 'yoga-studio'){
        this.showBillingPopup = true;
      }
     
    }
    // keep template mobile menu state tidy on route change
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.mobileMenuOpen = false;
    });

    this.signupPopupService.isVisible$
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.showSignupPopup = value;
      });

    // subscribe auth state
    this.oidcSecurityService.isAuthenticated$.subscribe(
      ({ isAuthenticated }: { isAuthenticated: boolean }) => {
        this.isAuthenticated = isAuthenticated;
        // console.debug('authenticated: ', isAuthenticated);
      }
    );
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  // Trigger OIDC authorize flow
  login(): void {
    this.oidcSecurityService.authorize();
  }

  // callback used by signup popup
  returnSignupData(event: any) {
    this.userData = event.input;
    console.log('Signup returned to parent:', event);
    this.signupPopupService.hide();
    this.showConfirmUserForm = true;
  }

  returnConfirmData(event: any) {
    console.log('Confirm returned to parent:', event);
    this.showConfirmUserForm = false;
    this.showLoginForm = true;
    // if(this.userData.role === 'business-owner'||this.userData.role === 'property-owner'||this.userData.role === 'yoga-studio'){
    //   this.showBillingPopup = true;
    // }
    this.cdr.detectChanges(); 
  }

  // toggles signup popup when called from header button
  handleSignup(event?: any) {
    this.signupPopupService.toggle();
    console.log('handleSignup called, payload:', event);
  }

  closeSignupPopup() {
    this.signupPopupService.hide();
  }

  openLoginFromSignup(): void {
    this.signupPopupService.hide();
    this.showLoginForm = true;
    this.cdr.detectChanges();
  }

  openSignupFromLogin(): void {
    this.showLoginForm = false;
    this.signupPopupService.show();
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // toggles login popup
  handleLogin() {
    this.showLoginForm = !this.showLoginForm;
  }

  // logout: clear client storage and redirect to homepage (adjust as needed)
  logout(): void {
    if (window.sessionStorage) {
      window.sessionStorage.clear();
      window.localStorage.clear();
    }
    // If you have a federated logout URL use that. For now redirect to home:
    window.location.href = '/';
  }
}
