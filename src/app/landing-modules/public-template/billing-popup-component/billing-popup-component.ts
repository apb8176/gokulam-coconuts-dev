import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../services/payment.service';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../services/notification-service';
import { Cognito } from '../../../services/cognito.service';
import { firstValueFrom } from 'rxjs';
import { TokenManagerService } from '../../../services/token-manager';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

declare const Razorpay: any;
@Component({
  selector: 'app-billing-popup',
  standalone: false,
  templateUrl: './billing-popup-component.html',
})
export class BillingPopupComponent {
  @Input() isVisible = false;
  @Input() data: any = null;
  loading = false;
  razorpayLoaded = false;
  user: any;
  // Put your frontend/public key in environment and/or pass from backend to avoid hardcoding. Example uses window var.
  RAZORPAY_KEY_ID = environment.razorpayKeyId || 'rzp_test_xxx';
  billingForm: ReturnType<FormBuilder['group']>;
  errorMessage: string = '';
  constructor(
    private cognitoService: Cognito,
    private notify: NotificationService,
    private paymentService: PaymentService,
    private fb: FormBuilder,
    private tokenManager: TokenManagerService,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private router: Router
  ) {
    this.billingForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      gstin: [''],
      cin: [''],
    });
  }
  ngOnInit() {
    this.user = this.auth.getUser();
    this.data = this.user;
    if (this.data && this.user) {
      this.billingForm.patchValue({
        name: this.data?.first_name + ' ' + this.data?.second_name || '',
        email: this.data?.email || '',
        phone: this.data?.phone.replace(/^\+91/, '') || '',
      });
    }
  }

  close() {
    this.isVisible = false;
  }

  async onSubmit() {
    if (this.billingForm.invalid) return;
    this.loading = true;

    const billingData = this.billingForm.value;

    try {
      // Mock payment gateway call
      await new Promise((resolve) => setTimeout(resolve, 1200));
      alert('Redirecting to payment gateway...');
      console.log('Billing Data:', billingData);
      billingData.role = this.data?.role || '';
      let createOrderReq = {
        userId: 'Test',
        amountPaise: 0, // amount in paise (Razorpay uses smallest currency unit)
      };
      const orderResp: any = await firstValueFrom(this.paymentService.createOrder(createOrderReq));
      console.log('Order created:', orderResp);
      await this.loadRazorpayScript();

      const options: any = {
        key: this.RAZORPAY_KEY_ID,
        amount: orderResp.razorpay_order.amount, // paise
        currency: orderResp.razorpay_order.currency || 'INR',
        name: orderResp.razorpay_order.name || 'Gokulam Community',
        description: 'Registration fee',
        order_id: orderResp.razorpay_order.order_id,
        prefill: {
          name: orderResp.razorpay_order.first_name || '',
          email: orderResp.razorpay_order.email || '',
          contact: orderResp.razorpay_order.contact || '',
        },
        notes: {
          userId: '',
          role: '',
        },
        theme: {
          color: '#F2D479',
        },
        handler: async (response: any) => {
          console.log(response);

          // Successful payment — verify with backend
          try {
            this.loading = true;
            const verifyPayload: any = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id ? response.razorpay_order_id : 'id-23',
              razorpay_signature: response.razorpay_signature
                ? response.razorpay_signature
                : 'id-24',
              address: billingData.address,
              gstin: billingData.gstin,
              cin: billingData.cin,
              amount: 50000,
              currency: 'INR',
              receipt: 'rcpt_1698520983',
            };
            const verifyResp: any = await firstValueFrom(
              this.paymentService.verifyPayment(verifyPayload)
            );
            console.log('Payment verified (backend):', verifyResp);

            if (verifyResp?.ok) {
              this.close();
              // optionally call your backend to mark user as paid/active
              try {
                // await firstValueFrom(this.http.post('/api/users/post-signup', { userId, role, paid: true }));
              } catch (postSignupErr) {
                console.warn('post-signup backend call failed', postSignupErr);
              }
              setTimeout(() => {
                this.navigateToDashboard();
              }, 1000);

              this.notify?.showInfo('Success !', 'Payment successful');
              //this.closePopup();
            } else {
              this.errorMessage = 'Payment verification failed. Please contact support.';
            }
          } catch (verifyErr: any) {
            console.error('Payment verification failed:', verifyErr);
            this.errorMessage = 'Payment succeeded but verification failed. Contact support.';
          } finally {
            this.loading = false;
            this.close();
            this.isVisible = false;
            this.cdr.detectChanges();
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Razorpay modal dismissed');
          },
        },
      };

      const rzp = new Razorpay(options);

      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response);
        this.errorMessage = response?.error?.description || 'Payment failed. Try again.';
        this.notify?.showInfo('Success !', 'Payment failed. Please retry.');
      });

      rzp.open();
    } catch (error) {
      console.error('Payment initiation failed:', error);
      this.isVisible = false;
      this.cdr.detectChanges();
    } finally {
      this.loading = false;
      this.close();
    }
  }
  loadRazorpayScript(): Promise<void> {
    if (this.razorpayLoaded) return Promise.resolve();

    return new Promise((resolve, reject) => {
      // avoid adding script twice
      const existing = document.getElementById('razorpay-checkout-js');
      if (existing) {
        this.razorpayLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.razorpayLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  }

  async navigateToDashboard() {
    const idToken = this.tokenManager.getIdToken();
    let apiResult: any;
    if (idToken && this.user) {
      try {
        apiResult = await this.cognitoService.callGetUserTypeApi(this.user.email, idToken);
      } catch (apiError) {
        console.error('API call failed after login:', apiError);
      }
    }

    this.auth.saveUser(apiResult?.item);
    const currentUser = this.auth.getUser() || apiResult.item || {};
    const role = currentUser.user_type || currentUser.role || currentUser.userRole || '';

    // Map roles -> route segments (adjust keys as your backend returns them)
    const roleToRoute: Record<string, string> = {
      admin: 'admin',
      'property-owner': 'property-owner',
      property_owner: 'property-owner',
      propertyOwner: 'property-owner',
      'busines-owner': 'busines-owner',
      'business-owner': 'busines-owner',
      business_owner: 'busines-owner',
      'community-member': 'community-member',
      community_member: 'community-member',
      communityMember: 'community-member',
      'yoga-studio': 'yoga-studio',
      yoga_studio: 'yoga-studio',
      yogaStudio: 'yoga-studio',
      scout: 'scout',
      scouter: 'scout',
    };

    // Normalize role key (lowercase, trim)
    const normalizedRole = (role || '').toString().trim().toLowerCase();
    let targetSegment = roleToRoute[normalizedRole];
    console.log('Rote', targetSegment);

    // If not found, try to infer from user.roles array (if you have multi-roles)
    if (!targetSegment && Array.isArray(currentUser.roles)) {
      for (const r of currentUser.roles) {
        const key = (r || '').toString().trim().toLowerCase();
        if (roleToRoute[key]) {
          targetSegment = roleToRoute[key];
          break;
        }
      }
    }

    // fallback default
    if (!targetSegment) targetSegment = 'property-owner';

    // Navigate to protected area. Adjust '/protected' if your parent route differs
    await this.router.navigate(['/landing', targetSegment]);
  }
}
