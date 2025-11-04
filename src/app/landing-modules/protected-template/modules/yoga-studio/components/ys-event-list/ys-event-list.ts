import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { YogaApiService } from '../../services/yoga-api-service';

@Component({
  selector: 'app-ys-event-list',
  standalone: false,
  templateUrl: './ys-event-list.html',
  styleUrl: './ys-event-list.scss'
})
export class YsEventList {

  offerForm: FormGroup;
   showForm = false;
   editingIndex: number = -1;
 
   posterPreview: string | null = null;
 
   offers: any[] = [
     // Sample data (optional)
     {
       title: 'Monsoon Special - 30% Off',
       type: 'offer',
       validFrom: '2025-09-01',
       validTo: '2025-09-30',
       venue: 'Main Street Store',
       description: 'Enjoy 30% off on all snacks and beverages.',
       value: '30% Off',
       status: 'active',
       conditions: 'Min purchase ₹200. Not combinable with other coupons.',
       poster: null,
     },
   ];
   posterFile: any;
   isNew: boolean = true;
   isLoading: any = false;
   selectedOffer: any;
 
   constructor(
     private fb: FormBuilder,
     private boService: YogaApiService,
     private cdr: ChangeDetectorRef
   ) {
     this.offerForm = this.fb.group({
       title: ['', Validators.required],
       type: ['', Validators.required],
       validFrom: [''],
       validTo: [''],
       venue: [''],
       description: ['', Validators.required],
       value: [''],
       status: ['active'],
       conditions: [''],
       requestToAdmin: [false],
     });
   }
   ngOnInit() {
     this.getEventDetails();
   }
   getEventDetails() {
     this.isLoading = true;
     this.boService.getEventDetails().subscribe({
       next: (res: { items: any[]; }) => {
        // console.log('Event saved successfully', res);
         if (res.items) {
           this.offers = res.items;
             this.isLoading = false;
           this.cdr.detectChanges();
         }
       },
       error: (err: any) => {
         console.error('Error saving event', err);
          this.isLoading = false;
           this.cdr.detectChanges();
       },
     });
   }
   get f(): any {
     return this.offerForm.controls;
   }
 
   openCreate() {
     this.resetForm();
     this.showForm = true;
     this.editingIndex = -1;
     this.isNew = true;
   }
 
   toggleListView() {
     this.showForm = !this.showForm;
   }
 
   onPosterSelected(event: any) {
     const file = event.target.files[0];
     if (file) {
       this.offerForm.patchValue({ photo: file });
     }
     this.posterPreview = URL.createObjectURL(file);
     this.posterFile = file;
   }
 
   saveOffer() {
     if (this.offerForm.invalid) {
       this.offerForm.markAllAsTouched();
       return;
     }
 
     const val = { ...this.offerForm.value };
 
     // Auto-calc status from dates if provided
     if (val.validFrom && val.validTo) {
       const today = new Date();
       const from = new Date(val.validFrom);
       const to = new Date(val.validTo);
 
       if (today < from) val.status = 'upcoming';
       else if (today > to) val.status = 'expired';
       else val.status = 'active';
     }
 
     // 🧩 Convert to FormData
     const formData = new FormData();
     Object.entries(val).forEach(([key, value]) => {
       if (value !== null && value !== undefined) {
         formData.append(key, value as any);
       }
     });
 
     if (this.posterFile) {
       formData.append('photo', this.posterFile);
     } else if (this.posterPreview) {
       // in case you store image URL instead of file
       formData.append('photo', this.posterPreview);
     }
 
     // 🔥 Post using FormData
     if (this.isNew) {
       this.boService.postEvent(formData).subscribe({
         next: (res: any) => {
           console.log('Event saved successfully', res);
           this.resetForm();
           this.showForm = false;
           this.editingIndex = -1;
           this.getEventDetails();
         },
         error: (err: any) => {
           console.error('Error saving event', err);
         },
       });
     } else {
       this.selectedOffer && formData.append('eventId', this.selectedOffer.eventId);
       this.boService.putEvent(formData).subscribe({
         next: (res: any) => {
           console.log('Event saved successfully', res);
           this.resetForm();
           this.showForm = false;
           this.editingIndex = -1;
           this.getEventDetails();
         },
         error: (err: any) => {
           console.error('Error saving event', err);
         },
       });
     }
 
     // Update local list
     if (this.editingIndex >= 0) {
       this.offers[this.editingIndex] = { ...this.offers[this.editingIndex], ...val };
     } else {
       this.offers.unshift(val);
     }
   }
 
   startEdit(index: number) {
     this.selectedOffer = this.offers[index];
     this.isNew = false;
     const o = this.offers[index];
     this.offerForm.patchValue({
       title: o.title,
       type: o.type,
       validFrom: o.validFrom,
       validTo: o.validTo,
       venue: o.venue,
       description: o.description,
       value: o.value,
       status: o.status,
       conditions: o.conditions,
       requestToAdmin: !!o.requestToAdmin,
     });
     this.posterPreview = o.poster || null;
     this.editingIndex = index;
     this.showForm = true;
     // scroll into view on mobile (optional)
     setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
   }
 
   deleteOffer(index: number) {
     if (!confirm('Delete this offer?')) return;
     this.offers.splice(index, 1);
   }
 
   resetForm() {
     this.offerForm.reset({
       title: '',
       type: '',
       validFrom: '',
       validTo: '',
       venue: '',
       description: '',
       value: '',
       status: 'active',
       conditions: '',
       requestToAdmin: false, // <-- reset default
     });
     this.posterPreview = null;
     this.editingIndex = -1;
   }
}
