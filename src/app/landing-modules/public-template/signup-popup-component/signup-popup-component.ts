import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cognito } from '../../../services/cognito.service';
import { PaymentService } from '../../../services/payment.service';
import { HttpClient } from '@angular/common/http';

declare const Razorpay: any; // loader will put this on window

@Component({
  selector: 'app-signup-popup',
  standalone: false,
  templateUrl: './signup-popup-component.html',
  styleUrls: ['./signup-popup-component.scss']
})
export class SignupPopupComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() signup = new EventEmitter<any>();

  signupForm!: FormGroup;
  roles: any = [
    { key: 'property-owner', value: 'Property Owner' },
    { key: 'business-owner', value: 'Business Owner' },
    { key: 'yoga-studio', value: 'Yoga Studio Owner' },
    { key: 'community-member', value: 'Community Member' },
    { key: 'scouter', value: 'Scouter' }
  ];

  errorMessage: string = '';
  loading: boolean = false; // disables submit during processing
  razorpayLoaded = false;

  // Put your frontend/public key in environment and/or pass from backend to avoid hardcoding. Example uses window var.
  RAZORPAY_KEY_ID = (window as any)['RAZORPAY_KEY_ID'] || 'rzp_test_xxx';

  constructor(
    private fb: FormBuilder,
    private cognitoService: Cognito,
    private paymentService: PaymentService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.minLength(2)],
      lastName: ['', Validators.minLength(2)],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^\+?\d{10,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/)]],
      role: ['', Validators.required]
    });
  }

  get f() { return this.signupForm.controls; }

  closePopup(): void {
    this.isVisible = false;
    this.close.emit();
    this.signupForm.reset();
    this.errorMessage = '';
    Object.keys(this.signupForm.controls).forEach(key => {
      this.signupForm.controls[key].setErrors(null);
    });
  }

  private amountForRole(role: string): number /* paise */ {
    // Return amount in paise. ₹1 = 100 paise
    const paidRoles = ['property-owner', 'business-owner', 'yoga-studio'];
    if (paidRoles.includes(role)) return 100; // ₹1 -> 100 paise
    return 0; // free for others
  }

  private loadRazorpayScript(): Promise<void> {
    if (this.razorpayLoaded) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.razorpayLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.signupForm.markAllAsTouched();
    if (!this.signupForm.valid) {
      const invalidFields: string[] = [];
      if (this.f['email'].invalid) invalidFields.push('Email');
      if (this.f['password'].invalid) invalidFields.push('Password');
      if (this.f['role'].invalid) invalidFields.push('Role');
      this.errorMessage = `Please provide valid: ${invalidFields.join(', ')}.`;
      return;
    }

    this.loading = true;
    try {
      // 1) Signup with Cognito (existing flow)
      const signupResult: any = await this.cognitoService.signUpUser(this.signupForm.value);
      console.log('Cognito signup success:', signupResult);

      // Optionally: call backend to create user record now (if your backend needs it)
      // const createUserResp = await this.http.post('/api/users/create', { ... }).toPromise();

      // Emit signup if other components need it
      this.signup.emit(signupResult);

      // 2) Determine amount (in paise)
      const role = this.signupForm.value.role;
      const amountPaise = this.amountForRole(role);

      if (amountPaise > 0) {
        // create order via backend
        // backend should create order using Razorpay secret and return { orderId, amount, currency }
        const userId = signupResult?.userSub || signupResult?.Username || signupResult?.user?.sub || null;
        const createOrderReq = {
          userId,
          amountPaise,
          currency: 'INR',
          receipt: `signup_${Date.now()}`,
          metadata: { role }
        };

        const orderResp: any = await this.paymentService.createOrder(createOrderReq).toPromise();
        // expected orderResp: { orderId: 'order_XXXX', amount: 100, currency: 'INR' }
        console.log('Order created:', orderResp);

        await this.loadRazorpayScript();

        const options: any = {
          key: this.RAZORPAY_KEY_ID, // YOUR RAZORPAY KEY ID (public)
          amount: orderResp.amount, // amount in paise
          currency: orderResp.currency || 'INR',
          name: 'Your App / Company Name',
          description: 'Registration fee',
          order_id: orderResp.orderId,
          prefill: {
            name: `${this.signupForm.value.firstName || ''} ${this.signupForm.value.lastName || ''}`.trim(),
            email: this.signupForm.value.email,
            contact: this.signupForm.value.phoneNumber || ''
          },
          notes: {
            userId: userId || '',
            role
          },
          theme: {
            color: '#F2D479'
          },
          handler: async (response: any) => {
            // Called on successful payment
            try {
              this.loading = true;
              const verifyPayload = {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                userId,
                role,
                amountPaise
              };
              const verifyResp: any = await this.paymentService.verifyPayment(verifyPayload).toPromise();
              console.log('Payment verified (backend):', verifyResp);
              // Close popup or show success
              this.closePopup();
            } catch (verifyErr: any) {
              console.error('Payment verification failed:', verifyErr);
              this.errorMessage = 'Payment succeeded but verification failed. Contact support.';
            } finally {
              this.loading = false;
            }
          },
          modal: {
            ondismiss: () => {
              // user closed the checkout
              console.log('Razorpay modal dismissed');
            }
          }
        };

        const rzp = new Razorpay(options);
        rzp.open();
      } else {
        // Free registration — just close and maybe call backend to mark paid=false
        // Optionally notify backend about signup (free)
        try {
          const userId = signupResult?.userSub || signupResult?.Username || signupResult?.user?.sub || null;
          await this.http.post('/api/users/post-signup', { userId, role, paid: false }).toPromise();
        } catch (e) {
          // non-critical
          console.warn('post-signup backend call failed', e);
        }
        this.closePopup();
      }
    } catch (error: any) {
      console.error('Signup or payment flow error:', error);
      this.errorMessage = error?.message || 'Signup failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
