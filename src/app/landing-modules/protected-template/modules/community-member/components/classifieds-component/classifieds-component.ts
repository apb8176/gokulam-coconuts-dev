import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CmApiService } from '../../services/cm-api-service';

export type ClassifiedStatus = 'Active' | 'Inactive' | 'Expired';

export interface Classified {
  id: string;
  title: string;
  type: string;
  description: string;
  imageDataUrl?: string | null;
  validFrom?: string | null; // ISO date string
  validTo?: string | null;   // ISO date string
  status: ClassifiedStatus;
  location: string;
  contactName: string;
  contactNumber: string;
  createdAt: string;
}

@Component({
  selector: 'app-classifieds',
  templateUrl: './classifieds-component.html',
  standalone: false,
})
export class ClassifiedsComponent implements OnInit {
  form!: FormGroup;
  classifieds: Classified[] = [];
  modalOpen = false;
  modalMode: 'create' | 'edit' | 'preview' = 'create';
  editingId: string | null = null;
  imagePreview: string | null = null;

  // example types - extend as needed
  types = [
      'Vacancy', 
      'Enquiry',
      'Service Offered',
      'Service Required',
      'Item for Sale/Rent', 
      'Item Wanted',
      'Event Announcement',
      'Adoption',
      'Lost and Found',
      'Volunteer Opportunity',
      'Community Notice',
      'Others' 
  ];

  statuses: ClassifiedStatus[] = ['Active', 'Inactive', 'Expired'];
  constructor(
    private fb: FormBuilder,
    private cmApi: CmApiService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.seedDemoData();
  }

  private initForm() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      type: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(2000)]],
      image: [null], // holds File object when uploading
      validFrom: [null],
      validTo: [null],
      status: ['Active', Validators.required],
      location: ['', Validators.required],
      contactName: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]{7,20}$/)]],
    });
    this.imagePreview = null;
    this.editingId = null;
  }

  private seedDemoData() {
    const now = new Date().toISOString();
    this.classifieds = [
      {
        id: this.makeId(),
        title: 'Plumber needed urgently',
        type: 'Plumber needed',
        description: 'Experienced plumber required in Sector 17. Prefer someone with experience in overhead tanks.',
        imageDataUrl: null,
        validFrom: this.toDateISO(new Date()),
        validTo: this.toDateISO(this.addDays(new Date(), 10)),
        status: 'Active',
        location: 'Sector 17, Mysore',
        contactName: 'Ramesh',
        contactNumber: '+91 98765 12345',
        createdAt: now,
      },
      {
        id: this.makeId(),
        title: 'Dog for adoption - Labrador mix',
        type: 'Dog for adoption',
        description: 'Loyal and vaccinated 2-year-old Labrador mix. Friendly with kids.',
        imageDataUrl: null,
        validFrom: this.toDateISO(new Date()),
        validTo: this.toDateISO(this.addDays(new Date(), 30)),
        status: 'Active',
        location: 'Hebbal, Bangalore',
        contactName: 'Anita',
        contactNumber: '+91 99887 66554',
        createdAt: now,
      },
    ];
  }

  private toDateISO(d?: Date) {
    if (!d) return null;
    const iso = d.toISOString().slice(0, 10); // YYYY-MM-DD (works with <input type="date">)
    return iso;
  }

  private addDays(d: Date, days: number) {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  openCreate() {
    this.modalMode = 'create';
    this.initForm();
    this.modalOpen = true;
  }

  openEdit(c: Classified) {
    this.modalMode = 'edit';
    this.editingId = c.id;
    this.form.patchValue({
      title: c.title,
      type: c.type,
      description: c.description,
      validFrom: c.validFrom,
      validTo: c.validTo,
      status: c.status,
      location: c.location,
      contactName: c.contactName,
      contactNumber: c.contactNumber,
    });
    this.imagePreview = c.imageDataUrl ?? null;
    this.modalOpen = true;
  }

  openPreview(c: Classified) {
    this.modalMode = 'preview';
    this.editingId = c.id;
    this.form.disable();
    this.form.patchValue({
      title: c.title,
      type: c.type,
      description: c.description,
      validFrom: c.validFrom,
      validTo: c.validTo,
      status: c.status,
      location: c.location,
      contactName: c.contactName,
      contactNumber: c.contactNumber,
    });
    this.imagePreview = c.imageDataUrl ?? null;
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
    this.form.enable();
    this.initForm();
  }

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.form.patchValue({ image: null });
      this.imagePreview = null;
      return;
    }
    const file = input.files[0];
    this.form.patchValue({ image: file });

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  submit() {
    if (this.modalMode === 'preview') {
      this.closeModal();
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value;
    const entry: Classified = {
      id: this.editingId ?? this.makeId(),
      title: raw.title,
      type: raw.type,
      description: raw.description,
      imageDataUrl: this.imagePreview ?? null,
      validFrom: raw.validFrom ?? null,
      validTo: raw.validTo ?? null,
      status: raw.status,
      location: raw.location,
      contactName: raw.contactName,
      contactNumber: raw.contactNumber,
      createdAt: new Date().toISOString(),
    };

    if (this.modalMode === 'create') {
      this.classifieds = [entry, ...this.classifieds];
    } else if (this.modalMode === 'edit' && this.editingId) {
      this.classifieds = this.classifieds.map((c) => (c.id === this.editingId ? entry : c));
    }
    // this.cmApi.putClassifieds(this.classifieds).subscribe({
    //   next: (res) => {
    //     console.log('Classifieds saved successfully', res); 
    this.cmApi.postClassifieds(entry).subscribe({
      next: (response) => {
        console.log('✅ Property added successfully:', response);
        this.closeModal();
      },
      error: (error) => {
        console.error('❌ Error adding property:', error);
      },
    });
  
    
  }

  deleteItem(id: string) {
    if (!confirm('Delete this classified?')) return;
    this.classifieds = this.classifieds.filter((c) => c.id !== id);
  }

  // small helpers
  makeId(length = 8) {
    return Math.random().toString(36).slice(2, 2 + length);
  }

  // convenience getters for template
  get f():any {
    return this.form.controls;
  }
}
