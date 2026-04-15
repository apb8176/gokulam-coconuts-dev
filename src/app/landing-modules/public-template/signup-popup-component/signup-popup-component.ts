import { Component, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cognito } from '../../../services/cognito.service';
import { PaymentService } from '../../../services/payment.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../services/notification-service';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { SignupPopupService } from '../signup-popup.service';

declare const Razorpay: any; // loader will put this on window

@Component({
  selector: 'app-signup-popup',
  standalone: false,
  templateUrl: './signup-popup-component.html',
  styleUrls: ['./signup-popup-component.scss']
})
export class SignupPopupComponent implements OnInit, OnDestroy {
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() signup = new EventEmitter<any>();
  @Output() navigateToLogin = new EventEmitter<void>();

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
  showTermsPopup = false;
  hasReachedTermsBottom = false;
  termsAccepted = false;

  readonly termsContentByRole: Record<string, { title: string; sections: Array<{ heading?: string; paragraphs?: string[]; bullets?: string[] }> }> = {
    'community-member': {
      title: 'MOU of Community Member',
      sections: [
        {
          heading: 'Gokulam Coconuts - Terms & Conditions',
          paragraphs: [
            'GSTIN: @request',
            'Our soul mission at Gokulam Coconuts is to serve this amazing international community to the best of our abilities.'
          ]
        },
        {
          heading: 'Community Values',
          paragraphs: [
            'If you need something from within the community -> ASK',
            'If you know something that the community can benefit from -> SAY something'
          ]
        },
        {
          heading: 'Main Goals',
          bullets: [
            'Community Service',
            'Educating the poor on self-love.',
            'We give back to the community as a community.',
            'Property Rentals (Main Focus)',
            'This group mainly consists of landlords, local renters, and international renters.',
            'International Gokulam Coconuts Discount Flyers'
          ]
        },
        {
          heading: 'Shared Spirit',
          paragraphs: [
            'If everyone shares a little, we have a community potluck.',
            'Giving back is joy.'
          ]
        }
      ]
    },
    'property-owner': {
      title: 'MOU of Property Owner',
      sections: [
        {
          heading: 'Gokulam Coconuts - Terms & Conditions',
          paragraphs: [
            'GSTIN: @request',
            'Property / Land / House Purchasing'
          ]
        },
        {
          heading: 'Commission Split (4 ways)',
          bullets: [
            'GCIBN (Marketing via website) -> 40%',
            'Real Estate Agent -> 50%',
            'Charity -> 10%'
          ]
        },
        {
          heading: 'Property Rentals Only',
          paragraphs: [
            'GCIBN takes 10% fee on any rental transaction done through the network.'
          ]
        },
        {
          heading: 'Rules',
          bullets: [
            'Brokers must only market properties NOT already on GCIBN network.',
            'If GCIBN is excluded from a deal, parties will be removed from the network.',
            'Removed parties cannot market on the platform.'
          ]
        },
        {
          heading: 'General Guidelines',
          bullets: [
            'Business must be done in good faith.',
            'Opportunity for landlords and agents to network and grow.'
          ]
        },
        {
          heading: 'Referral Benefits',
          paragraphs: [
            'Case 1: If you add a landlord and that landlord makes a sale via the GCIBN website, you get 2.5% from GCIBN\'s 40% share.',
            'Case 2: If a landlord you added finds a renter via GCIBN, you get 1% commission.'
          ]
        },
        {
          heading: 'Website Note',
          bullets: [
            'Registration required.',
            'Referral tracking will ensure payouts.'
          ]
        },
        {
          paragraphs: [
            'Goal: Grow together.'
          ]
        }
      ]
    },
    'business-owner': {
      title: 'MOU of Business Owner',
      sections: [
        {
          heading: 'Business Owner Participation',
          bullets: [
            'Business owners join the network to offer trusted products and services to the community.',
            'All business interactions on the platform must be transparent, respectful, and community-minded.'
          ]
        },
        {
          heading: 'Role',
          bullets: [
            'Register your business with accurate details.',
            'Share offers, services, and updates that genuinely benefit the GCIBN network.',
            'Maintain honest communication with customers and community members.'
          ]
        },
        {
          heading: 'How You Grow',
          paragraphs: [
            'GCIBN helps business owners reach a wider local and international audience.',
            'Businesses that serve well, communicate clearly, and stay active in the network will grow through trust and referrals.'
          ]
        },
        {
          heading: 'Platform Rules',
          bullets: [
            'Do not post misleading claims, fake offers, or incomplete business information.',
            'Treat every referral and customer connection in good faith.',
            'Businesses that misuse the platform or harm community trust may be removed from the network.'
          ]
        },
        {
          heading: 'Community Contribution',
          bullets: [
            'Support the community through fair service, useful knowledge, and ethical business practice.',
            'Share opportunities that create value for both the business and the wider network.'
          ]
        },
        {
          heading: 'Website Note',
          bullets: [
            'Registration is required to list and promote your business.',
            'Referral tracking and network participation will be used to support future business growth and payouts where applicable.'
          ]
        },
        {
          heading: 'Closing Note',
          paragraphs: [
            'Grow your business by serving the community with consistency and integrity.'
          ]
        }
      ]
    },
    'scouter': {
      title: 'MOU of Scouter',
      sections: [
        {
          heading: 'Who is a Real Estate Scouter?',
          bullets: [
            'Any gender.',
            'Age: 18+.'
          ]
        },
        {
          heading: 'Role',
          bullets: [
            'Find properties for rent or sale.',
            'Approach the landlord.',
            'Add them to the GCIBN group.'
          ]
        },
        {
          heading: 'How You Earn',
          paragraphs: [
            'Your added landlord is tracked.',
            'When they complete transactions via GCIBN, you get paid.'
          ]
        },
        {
          heading: 'Earnings',
          paragraphs: [
            '11% GMP (Gross Margin Profit) on every transaction done by that landlord.'
          ]
        },
        {
          heading: 'Examples',
          bullets: [
            'Add 10 landlords -> 10 income streams.',
            'Add 100 landlords -> 100 income streams.',
            'Your results depend on your effort and consistency.'
          ]
        },
        {
          heading: 'Additional Role (Selling Property)',
          paragraphs: [
            'If GCIBN gets a property for sale and a scouter sells it, the profit is split 50% with the scouter.'
          ]
        },
        {
          heading: 'Platform Info',
          bullets: [
            'Website launching soon.',
            'Must register as a scouter.',
            'Must upload landlord details.'
          ]
        },
        {
          heading: 'Closing Note',
          paragraphs: [
            'Grow through consistency and network building.'
          ]
        }
      ]
    },
    'yoga-studio': {
      title: 'MOU of Yoga Studio Owner',
      sections: [
        {
          heading: 'Yoga Studio Participation',
          bullets: [
            'Yoga studio owners join GCIBN to serve the wellness needs of the community.',
            'The studio should reflect values of self-love, healing, respect, and good-faith service.'
          ]
        },
        {
          heading: 'Role',
          bullets: [
            'Register the studio with correct details and offerings.',
            'Share classes, workshops, retreats, and wellness opportunities relevant to the community.',
            'Maintain a safe, respectful, and welcoming environment for participants.'
          ]
        },
        {
          heading: 'How You Grow',
          paragraphs: [
            'GCIBN helps yoga studios connect with local members, travelers, and international seekers.',
            'Studios that stay active, trustworthy, and aligned with community values can grow through visibility and referrals.'
          ]
        },
        {
          heading: 'Platform Rules',
          bullets: [
            'Do not publish false promises, misleading wellness claims, or inaccurate studio information.',
            'Treat all referrals, collaborations, and participants in good faith.',
            'Studios that damage community trust or misuse the platform may lose network access.'
          ]
        },
        {
          heading: 'Community Contribution',
          bullets: [
            'Support the community through authentic teaching, conscious business, and wellness education.',
            'Encourage collective growth through collaboration, care, and meaningful offerings.'
          ]
        },
        {
          heading: 'Website Note',
          bullets: [
            'Registration is required to be listed as a yoga studio owner.',
            'Referral tracking and participation history will support future visibility and payouts where applicable.'
          ]
        },
        {
          heading: 'Closing Note',
          paragraphs: [
            'Grow your studio by helping people reconnect with wellness, balance, and community.'
          ]
        }
      ]
    }
  };

  // Put your frontend/public key in environment and/or pass from backend to avoid hardcoding. Example uses window var.
  RAZORPAY_KEY_ID = (window as any)['RAZORPAY_KEY_ID'] || 'rzp_test_xxx';

  constructor(
    private fb: FormBuilder,
    private cognitoService: Cognito,
    private paymentService: PaymentService,
    private http: HttpClient,
    private notify: NotificationService,
    private readonly signupPopupService: SignupPopupService
  ) {}

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.minLength(2)],
      lastName: ['', Validators.minLength(2)],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^\+?\d{10,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/)]],
      role: ['', Validators.required]
    });

    this.signupPopupService.selectedRole$
      .pipe(takeUntil(this.destroy$))
      .subscribe((role) => {
        if (!this.signupForm) {
          return;
        }

        if (this.signupForm.value.role !== role) {
          this.resetTermsAcceptance();
        }

        this.signupForm.patchValue(
          { role: role ?? '' },
          { emitEvent: false }
        );
      });

    this.signupForm.get('role')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.resetTermsAcceptance();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get f() { return this.signupForm.controls; }

  get selectedRoleKey(): string {
    return this.signupForm?.value?.role ?? '';
  }

  get activeTermsTitle(): string {
    return this.termsContentByRole[this.selectedRoleKey]?.title ?? 'Terms & Conditions';
  }

  get activeTermsSections(): Array<{ heading?: string; paragraphs?: string[]; bullets?: string[] }> {
    return this.termsContentByRole[this.selectedRoleKey]?.sections
      ?? this.termsContentByRole['community-member'].sections;
  }

  closePopup(): void {
    this.isVisible = false;
    this.showTermsPopup = false;
    this.close.emit();
    this.signupForm.reset();
    this.errorMessage = '';
    this.resetTermsAcceptance();
    Object.keys(this.signupForm.controls).forEach(key => {
      this.signupForm.controls[key].setErrors(null);
    });
  }

  switchToLogin(): void {
    this.closePopup();
    this.navigateToLogin.emit();
  }

  private amountForRole(role: string): number /* paise */ {
    // Return amount in paise. ₹1 = 100 paise
    const paidRoles = ['property-owner', 'business-owner', 'yoga-studio'];
    if (paidRoles.includes(role)) return 100; // ₹1 -> 100 paise
    return 0; // free for others
  }

  openTermsPopup(): void {
    if (!this.selectedRoleKey) {
      this.errorMessage = 'Please select a role before reading the Terms & Conditions.';
      this.signupForm.get('role')?.markAsTouched();
      return;
    }

    this.showTermsPopup = true;
  }

  closeTermsPopup(): void {
    this.showTermsPopup = false;
  }

  onTermsScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 8;

    if (isAtBottom) {
      this.hasReachedTermsBottom = true;
    }
  }

  confirmTermsAcceptance(checked: boolean): void {
    this.termsAccepted = checked && this.hasReachedTermsBottom;
    if (this.termsAccepted) {
      this.errorMessage = '';
    }
  }

  private resetTermsAcceptance(): void {
    this.hasReachedTermsBottom = false;
    this.termsAccepted = false;
  }


// --- updated onSubmit (replace your existing onSubmit) ---
async onSubmit(): Promise<void> {
  this.errorMessage = '';
  if (!this.termsAccepted) {
    this.errorMessage = 'Please read the Terms & Conditions, scroll to the bottom, and accept them before signing up.';
    this.openTermsPopup();
    return;
  }

  this.signupForm.markAllAsTouched();
  if (!this.signupForm.valid) {
    const invalidFields: string[] = [];
    if (this.f['email'].invalid) invalidFields.push('Email');
    if (this.f['password'].invalid) invalidFields.push('Password');
    if (this.f['role'].invalid) invalidFields.push('Role');
    this.errorMessage = `Please provide valid: ${invalidFields.join(', ')}.`;
    return;
  }

  const formValue = { ...this.signupForm.value };
  this.loading = true;

  try {
    // normalize phone
    if (formValue.phoneNumber) {
      formValue.phoneNumber = formValue.phoneNumber.startsWith('+')
        ? formValue.phoneNumber
        : `+91${formValue.phoneNumber}`;
    }

    // 1) Sign up user with Cognito (expects Observable)
   const signupResult: any = await this.cognitoService.signUpUser(formValue);
    console.log('Cognito signup success:', signupResult);

    // emit for parent components
    this.signup.emit({input:formValue,result:signupResult});

    // determine amount for role (paise)
    const role: string = this.signupForm.value.role;
    const amountPaise = this.amountForRole(role);

    const userId = this.extractUserIdFromCognitoResponse(signupResult);

    if (amountPaise > 0) {
      // 2) Create order via PaymentService (backend)
      // const createOrderReq :any= {
      //   userId,
      //   amount: amountPaise,
      //   currency: 'INR',
      //   receipt: `signup_${Date.now()}`,
      //   metadata: { role }
      // };

      // const orderResp: any = await firstValueFrom(this.paymentService.createOrder(createOrderReq));
      // console.log('Order created:', orderResp);

      // // 3) load SDK and open checkout
      // await this.loadRazorpayScript();

      // const options: any = {
      //   key: this.RAZORPAY_KEY_ID,
      //   amount: orderResp.amount, // paise
      //   currency: orderResp.currency || 'INR',
      //   name: 'Your App / Company Name',
      //   description: 'Registration fee',
      //   order_id: orderResp.orderId,
      //   prefill: {
      //     name: `${this.signupForm.value.firstName || ''} ${this.signupForm.value.lastName || ''}`.trim(),
      //     email: this.signupForm.value.email,
      //     contact: this.signupForm.value.phoneNumber || ''
      //   },
      //   notes: {
      //     userId: userId || '',
      //     role
      //   },
      //   theme: {
      //     color: '#F2D479'
      //   },
      //   handler: async (response: any) => {
      //     // Successful payment — verify with backend
      //     try {
      //       this.loading = true;
      //       const verifyPayload :any= {
      //         razorpay_payment_id: response.razorpay_payment_id,
      //         razorpay_order_id: response.razorpay_order_id,
      //         razorpay_signature: response.razorpay_signature,
      //         userId,
      //         role,
      //         amount: amountPaise
      //       };
      //       const verifyResp: any = await firstValueFrom(this.paymentService.verifyPayment(verifyPayload));
      //       console.log('Payment verified (backend):', verifyResp);

      //       if (verifyResp?.valid) {
      //         // optionally call your backend to mark user as paid/active
      //         try {
      //           await firstValueFrom(this.http.post('/api/users/post-signup', { userId, role, paid: true }));
      //         } catch (postSignupErr) {
      //           console.warn('post-signup backend call failed', postSignupErr);
      //         }
      //         this.notify?.showInfo('Success !','Payment successful — registration complete');
      //         this.closePopup();
      //       } else {
      //         this.errorMessage = 'Payment verification failed. Please contact support.';
      //       }
      //     } catch (verifyErr: any) {
      //       console.error('Payment verification failed:', verifyErr);
      //       this.errorMessage = 'Payment succeeded but verification failed. Contact support.';
      //     } finally {
      //       this.loading = false;
      //     }
      //   },
      //   modal: {
      //     ondismiss: () => {
      //       console.log('Razorpay modal dismissed');
      //     }
      //   }
      // };

      // const rzp = new Razorpay(options);

      // rzp.on('payment.failed', (response: any) => {
      //   console.error('Payment failed:', response);
      //   this.errorMessage = response?.error?.description || 'Payment failed. Try again.';
      //   this.notify?.showInfo('Success !','Payment failed. Please retry.');
      // });

      // rzp.open();
    } else {
      // Free registration: notify backend if needed
      try {
        await firstValueFrom(this.http.post('/api/users/post-signup', { userId, role, paid: false }));
      } catch (e) {
        console.warn('post-signup backend call failed', e);
      }
      this.notify?.showInfo('Success !','Registration successful');
      this.closePopup();
    }
  } catch (error: any) {
    console.error('Signup or payment flow error:', error);
    this.errorMessage = error?.message || 'Signup failed. Please try again.';
  } finally {
    this.loading = false;
  }
}

  private loadRazorpayScript(): Promise<void> {
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

private extractUserIdFromCognitoResponse(signupResult: any): string | null {
  return signupResult?.userSub || signupResult?.Username || signupResult?.user?.sub || null;
}
}
