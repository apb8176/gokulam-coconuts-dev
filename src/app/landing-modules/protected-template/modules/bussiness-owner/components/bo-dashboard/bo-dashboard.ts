


import { jsPDF } from 'jspdf';
  import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
@Component({
  selector: 'app-bo-dashboard',
  standalone: false,
  templateUrl: './bo-dashboard.html',
  styleUrl: './bo-dashboard.scss'
})
export class BoDashboard implements OnInit, OnDestroy {
  // Reactive form for editing a property



  // Dummy owner id used to find owner properties & scouter association
  readonly ownerId = 'owner-123';

  // ========= Local data (dummy JSON) =========
  properties: any[] = [];
  interests: any[] = [];
  adminResponses: any[] = [];
  classifieds: any[] = [];
  invoices: any[] = [];
  scouters: any[] = [];
  notifications: any[] = [];

  // ========= UI state =========
  editingProperty: any | null = null;
  editForm!: FormGroup;
  filePreview: string[] = [];
  // For contact reveal modal
  contactReveal: { interestId: string, contact?: string } | null = null;
  // For composer to contact scouter/person
  composerData: { to?: string, subject?: string, body?: string } | null = null;

  // classifieds pagination/filter
  classifiedsPage = 1;
  classifiedsPageSize = 4;
  classifiedsTotal = 0;
  classifiedsCategory = '';
  classifiedsQ = '';

  // view details drawer for classified
  viewingClassified: any | null = null;

  // invoices modal
  showInvoices = false;

  // optimistic update rollback map
  private interestRollback = new Map<string, any>();
  // store pending timers to clear on destroy
  private pendingTimers = new Map<string, any>();

  // small helpers
  unreadNotifications = 0;

  // reference for scrolling to a property when clicking admin link
  @ViewChild('propertiesListContainer', { static: false }) propertiesListContainer?: ElementRef;

  constructor(private fb: FormBuilder) {
    this.makeDummyData();
    this.buildEditForm();
  }

  ngOnInit(): void {
    this.unreadNotifications = this.notifications.filter(n => !n.read).length;
  }

  ngOnDestroy(): void {
    this.pendingTimers.forEach(t => clearTimeout(t));
    this.pendingTimers.clear();
  }

  // ===================== Setup =====================
  private makeDummyData() {
    // Properties (3 total; owner has two)
    this.properties = [
      {
        id: 'prop-1', ownerId: this.ownerId, title: 'Cozy 2BHK near the lake',
        location: 'Mysore, Karnataka', price: 4500000, status: 'active', postedDate: '2025-09-01T10:00:00Z',
        description: 'Comfortable 2BHK with lake view.', photos: ['https://picsum.photos/seed/prop1/400/240'],
        facilities: ['parking','lift'], scouterId: 'sc-1'
      },
      {
        id: 'prop-2', ownerId: this.ownerId, title: 'Independent 3BHK villa',
        location: 'Mysore outskirts', price: 12500000, status: 'pending', postedDate: '2025-09-10T14:00:00Z',
        description: 'Spacious villa with garden.', photos: ['https://picsum.photos/seed/prop2/400/240'],
        facilities: ['garden','private_parking']
      },
      {
        id: 'prop-3', ownerId: 'owner-456', title: 'Studio apartment',
        location: 'Bengaluru', price: 2500000, status: 'active', postedDate: '2025-07-01T10:00:00Z',
        description: 'Compact studio in prime location.', photos: ['https://picsum.photos/seed/prop3/400/240'],
        facilities: ['wifi']
      }
    ];

    // Interests
    this.interests = [
      { id: 'int-1', propertyId: 'prop-1', userName: 'Jayesh', message: 'Is this still available? I can visit on weekends.', contact: 'jayesh@example.com', date: '2025-09-12T08:00:00Z', status: 'pending' },
      { id: 'int-2', propertyId: 'prop-2', userName: 'Rina', message: 'Interested, please share more photos.', contact: 'rina@example.com', date: '2025-09-13T09:30:00Z', status: 'pending' },
      { id: 'int-3', propertyId: 'prop-3', userName: 'Suresh', message: 'Can I pay deposit online?', contact: 'suresh@example.com', date: '2025-07-02T11:00:00Z', status: 'accepted' }
    ];

    // Admin responses relevant to owner (linked by relatedId)
    this.adminResponses = [
      { id: 'adm-1', type: 'post_approved', comment: 'Your property has been approved', date: '2025-09-11T10:00:00Z', relatedId: 'prop-1' },
      { id: 'adm-2', type: 'media_rejected', comment: 'Image quality is low', date: '2025-09-11T12:00:00Z', relatedId: 'prop-2' },
      { id: 'adm-3', type: 'post_rejected', comment: 'Missing address details', date: '2025-07-02T14:00:00Z', relatedId: 'prop-3' }
    ];

    // Scouters
    this.scouters = [
      { id: 'sc-1', name: 'Ravi Kumar', phone: '+919876543210', commission: 2.5, transactions: [{date:'2025-08-01', amount:2000}, {date:'2025-07-02', amount:1500}] }
    ];

    // Classifieds (8)
    this.classifieds = [
      { id: 'c-1', title: 'Local Moving Service', category: 'services', date: '2025-09-01', details: 'Affordable movers near Mysore.' },
      { id: 'c-2', title: 'Painter available', category: 'services', date: '2025-08-20', details: 'Professional painter.' },
      { id: 'c-3', title: 'Sell used fridge', category: 'items', date: '2025-08-10', details: 'Working condition.' },
      { id: 'c-4', title: 'Apartment cleaning', category: 'services', date: '2025-07-30', details: 'Deep cleaning.' },
      { id: 'c-5', title: 'Gardening tools', category: 'items', date: '2025-07-12', details: 'Various tools.' },
      { id: 'c-6', title: 'Electrician', category: 'services', date: '2025-07-01', details: 'Affordable electrician.' },
      { id: 'c-7', title: 'Water purifier sale', category: 'items', date: '2025-06-21', details: 'Aqua guard - good condition.' },
      { id: 'c-8', title: 'Pest control', category: 'services', date: '2025-06-15', details: 'Effective pest control.' }
    ];
    this.classifiedsTotal = this.classifieds.length;

    // Invoices
    this.invoices = [
      { id: 'inv-1', date: '2025-09-01', amount: 5000, items: [{desc:'Featured listing', amount:5000}] },
      { id: 'inv-2', date: '2025-08-01', amount: 1200, items: [{desc:'Boost', amount:1200}] },
      { id: 'inv-3', date: '2025-07-01', amount: 750, items: [{desc:'Ad promo', amount:750}] }
    ];

    // Notifications
    this.notifications = [
      { id: 'n-1', text: 'Property prop-1 approved', read: false, date: '2025-09-11T10:00:00Z' },
      { id: 'n-2', text: 'New interest from Jayesh', read: false, date: '2025-09-12T09:00:00Z' },
      { id: 'n-3', text: 'Invoice inv-1 generated', read: true, date: '2025-09-01T01:00:00Z' }
    ];
  }

  private buildEditForm() {
    this.editForm = this.fb.group({
      id: [''],
      title: ['', [Validators.required, Validators.maxLength(120)]],
      price: [0, Validators.required],
      status: ['active', Validators.required],
      postedDate: [''],
      description: [''],
      facilities: this.fb.array([]) // we'll use comma CSV toggling helper
    });
  }

  // ========== Properties (recent 2) ==========
  get recentProperties() {
    // sort by postedDate DESC and return only owner properties
    return this.properties
      .filter(p => p.ownerId === this.ownerId)
      .sort((a, b) => +new Date(b.postedDate) - +new Date(a.postedDate))
      .slice(0, 2);
  }
min(a: number, b: number): number {
  return a < b ? a : b;
}
  openEditModal(prop: any) {
    this.editingProperty = { ...prop }; // copy to edit
    this.editForm.patchValue({
      id: prop.id,
      title: prop.title,
      price: prop.price,
      status: prop.status,
      postedDate: prop.postedDate,
      description: prop.description
    });
    // set facilities: clear and add
    const fa = this.editForm.get('facilities') as FormArray;
    while (fa.length) fa.removeAt(0);
    (prop.facilities || []).forEach((f: string) => fa.push(this.fb.control(f)));
    // previews
    this.filePreview = [...(prop.photos || [])];
    // autofocus handled in template via autofocus attribute
  }

  addFacility(tagInput: HTMLInputElement) {
    const val = tagInput.value?.trim();
    if (!val) return;
    (this.editForm.get('facilities') as FormArray).push(this.fb.control(val));
    tagInput.value = '';
  }

  removeFacility(idx: number) {
    (this.editForm.get('facilities') as FormArray).removeAt(idx);
  }

  onPhotoSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // preview inserted at start
      this.filePreview = [e.target.result, ...this.filePreview];
    };
    reader.readAsDataURL(file);
  }

  saveEditedProperty() {
    if (this.editForm.invalid) return;
    const formVal = this.editForm.value;
    const idx = this.properties.findIndex(p => p.id === formVal.id);
    const newProp = {
      ...this.properties[idx],
      title: formVal.title,
      price: Number(formVal.price),
      status: formVal.status,
      description: formVal.description,
      facilities: (this.editForm.get('facilities') as FormArray).value,
      photos: this.filePreview
    };
    if (idx > -1) {
      this.properties[idx] = newProp;
      // also add a notification about update
      this.notifications.unshift({ id: 'n-' + Date.now(), text: `Property ${newProp.title} updated`, read: false, date: new Date().toISOString() });
      this.unreadNotifications = this.notifications.filter(n => !n.read).length;
    }
    this.editingProperty = null;
  }

  deleteProperty(id: string) {
    if (!confirm('Delete this property?')) return;
    this.properties = this.properties.filter(p => p.id !== id);
    this.notifications.unshift({ id: 'n-' + Date.now(), text: `Property removed`, read: false, date: new Date().toISOString() });
    this.unreadNotifications = this.notifications.filter(n => !n.read).length;
  }

  // ========== Interests (accept/reject, mask contact) ==========
  maskContact(emailOrPhone: string) {
    if (!emailOrPhone) return '';
    const emailMatch = emailOrPhone.match(/(.).+(@.+)/);
    if (emailMatch) return emailOrPhone.replace(/^(.).+(@.+)$/, (m, a, b) => `${a}***${b}`);
    // phone fallback: show first 3 and last 2
    return emailOrPhone.replace(/(\d{3})\d+(\d{2})/, '$1*****$2');
  }

  acceptInterest(interest: any) {
    // optimistic: store previous snapshot
    this.interestRollback.set(interest.id, { ...interest });
    // optimistic UI change
    this.interests = this.interests.map(i => i.id === interest.id ? { ...i, status: 'accepted' } : i);

    // simulate async server response with 10% failure to demonstrate rollback
    const timerId = setTimeout(() => {
      const failed = Math.random() < 0.1;
      if (failed) {
        const prev = this.interestRollback.get(interest.id);
        if (prev) {
          this.interests = this.interests.map(i => i.id === prev.id ? prev : i);
          this.interestRollback.delete(interest.id);
          alert('Simulated error: Accept failed. UI rolled back.');
        }
      } else {
        // show contact reveal modal (simulated server-updated)
        this.contactReveal = { interestId: interest.id, contact: interest.contact };
        // push notification
        this.notifications.unshift({ id: 'n-' + Date.now(), text: `Interest from ${interest.userName} accepted`, read: false, date: new Date().toISOString() });
        this.unreadNotifications = this.notifications.filter(n => !n.read).length;
        this.interestRollback.delete(interest.id);
      }
      this.pendingTimers.delete(interest.id);
    }, 600 + Math.random() * 800);

    this.pendingTimers.set(interest.id, timerId);
  }

  rejectInterest(interest: any) {
    const reason = prompt('Optional rejection reason:') || '';
    this.interests = this.interests.map(i => i.id === interest.id ? { ...i, status: 'rejected', reason } : i);
    // simulate server ack
    const t = setTimeout(() => this.pendingTimers.delete(interest.id), 400);
    this.pendingTimers.set(interest.id, t);
    this.notifications.unshift({ id: 'n-' + Date.now(), text: `Interest from ${interest.userName} rejected`, read: false, date: new Date().toISOString() });
    this.unreadNotifications = this.notifications.filter(n => !n.read).length;
  }

  closeContactReveal() {
    this.contactReveal = null;
  }

  // ========== Admin responses (click link to jump to property) ==========
  gotoRelatedPost(relatedId: string) {
    // try scroll to property card if visible - fallback: alert
    setTimeout(() => {
      const el = document.querySelector(`[data-prop-id="${relatedId}"]`);
      if (el) {
        (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        (el as HTMLElement).classList.add('highlight-temp');
        setTimeout(() => (el as HTMLElement).classList.remove('highlight-temp'), 2000);
      } else {
        alert(`Open post ${relatedId} (not present in current view).`);
      }
    }, 50);
  }

  // ========== Scouter ==========
  getScouterForOwner() {
    const prop = this.properties.find(p => p.ownerId === this.ownerId && p.scouterId);
    if (!prop) return null;
    const sc = this.scouters.find(s => s.id === prop.scouterId);
    if (!sc) return { id: prop.scouterId, name: 'Scouter', phone: '+91-**********', commission: null, transactions: [] };
    return sc;
  }

  openContactComposer(to?: string, subject?: string,msg?:string) {
    this.composerData = { to: to || '', subject: subject || '', body: '' };
  }

  sendComposer() {
    if (!this.composerData) return;
    // simulate send
    this.notifications.unshift({ id: 'n-' + Date.now(), text: `Message sent to ${this.composerData.to}`, read: false, date: new Date().toISOString() });
    this.unreadNotifications = this.notifications.filter(n => !n.read).length;
    this.composerData = null;
  }
// component.ts (snippet)

  mobileMenuOpen = false;


  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }




  openNewProperty() {
    // open new property modal / drawer
    console.log('open new property');
  }


  // ========== Classifieds: pagination & filter ==========
  get pagedClassifieds() {
    let filtered = this.classifieds.slice();
    if (this.classifiedsCategory) {
      filtered = filtered.filter(c => c.category === this.classifiedsCategory);
    }
    if (this.classifiedsQ) {
      const q = this.classifiedsQ.toLowerCase();
      filtered = filtered.filter(c => c.title.toLowerCase().includes(q) || c.details.toLowerCase().includes(q));
    }
    this.classifiedsTotal = filtered.length;
    const start = (this.classifiedsPage - 1) * this.classifiedsPageSize;
    return filtered.slice(start, start + this.classifiedsPageSize);
  }

  nextClassifieds() {
    if (this.classifiedsPage * this.classifiedsPageSize < this.classifiedsTotal) this.classifiedsPage++;
  }
  prevClassifieds() {
    if (this.classifiedsPage > 1) this.classifiedsPage--;
  }

  viewClassified(c: any) {
    this.viewingClassified = c;
  }
  closeClassifiedViewer() {
    this.viewingClassified = null;
  }

  // ========== Notifications & Invoices (PDF via jsPDF) ==========
  markAllRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.unreadNotifications = 0;
  }

  openInvoices() {
    this.showInvoices = true;
  }
  closeInvoices() {
    this.showInvoices = false;
  }

  async downloadInvoicePDF(inv: any) {
    try {
      // dynamic import so app doesn't crash if jspdf missing
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Invoice #${inv.id}`, 14, 20);
      doc.setFontSize(12);
      doc.text(`Date: ${inv.date}`, 14, 32);
      doc.text(`Amount: ₹${inv.amount}`, 14, 42);
      doc.setFontSize(10);
      inv.items?.forEach((it: any, i: number) => {
        doc.text(`${i + 1}. ${it.desc} — ₹${it.amount}`, 14, 56 + i * 8);
      });
      doc.save(`invoice-${inv.id}.pdf`);
    } catch (err) {
      alert('Unable to generate PDF. Install jspdf: npm i jspdf');
    }
  }

  // small util: format date short
  formatShort(dateStr: string) {
    return new Date(dateStr).toLocaleString();
  }
}
