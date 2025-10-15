import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-bo-event-list',
  standalone: false,
  templateUrl: './bo-event-list.html',
  styleUrl: './bo-event-list.scss'
})
export class BoEventList {


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
      poster: null
    }
  ];

  constructor(private fb: FormBuilder) {
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
  requestToAdmin: [false]   
    });

    
  }

  get f() :any {
    return this.offerForm.controls;
  }

  openCreate() {
    this.resetForm();
    this.showForm = true;
    this.editingIndex = -1;
  }

  toggleListView() {
    this.showForm = !this.showForm;
  }

  onPosterSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    this.posterPreview = URL.createObjectURL(file);
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

    val.poster = this.posterPreview;

    if (this.editingIndex >= 0) {
      // update existing
      this.offers[this.editingIndex] = { ...this.offers[this.editingIndex], ...val };
    } else {
      // push new
      this.offers.unshift(val);
    }

    // after save, reset form and show list
    this.resetForm();
    this.showForm = false;
    this.editingIndex = -1;
  }

  startEdit(index: number) {
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
  requestToAdmin: !!o.requestToAdmin 
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
  requestToAdmin: false              // <-- reset default
});
this.posterPreview = null;
this.editingIndex = -1;

 
  }
}
