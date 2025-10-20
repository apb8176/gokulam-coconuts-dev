import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-ys-dashboard',
  standalone: false,
  templateUrl: './ys-dashboard.html',
  styleUrl: './ys-dashboard.scss'
})
export class YsDashboard {


  mobileMenuOpen = false;
  unreadNotifications = 0;

  // BRAND
  brandForm!: FormGroup;
  brandEditOpen = false;
  brand: any = {
    logo: null,
    name: 'Local Bakers & Co.',
    tagline: 'Fresh breads & handcrafted cakes',
    description: 'We bake fresh bread daily and offer custom cakes for events. Local supplier to cafés.',
    postedOn: new Date().toLocaleDateString()
  };

  // OFFERS / EVENTS
  offers: any[] = [];
  // ADMIN RESPONSES
  adminResponses: any[] = [];
  // INVOICES
  invoices: any[] = [];

  showInvoices = false;

  constructor(private fb: FormBuilder) {
    this.buildForms();
    this.makeDummyData();
  }

  ngOnInit(): void {
    this.unreadNotifications = 1; // example
  }

  buildForms() {
    this.brandForm = this.fb.group({
      name: [this.brand.name || ''],
      tagline: [this.brand.tagline || ''],
      description: [this.brand.description || '']
    });
  }

  makeDummyData() {
    this.offers = [
      { id: 'o1', title: 'Monsoon Discount', type: 'offer', validFrom: '2025-09-01', validTo: '2025-09-30', venue: 'Store', description: '30% off on snacks', value: '30% off', poster: null },
      { id: 'o2', title: 'Free Cake Tasting', type: 'event', validFrom: '2025-10-05', validTo: '2025-10-05', venue: 'Main outlet', description: 'Try our new cake flavours', value: 'Free tasting', poster: null }
    ];

    this.adminResponses = [
      { id: 'a1', type: 'post_approved', comment: 'Your offer has been approved', date: '2025-09-11T10:00:00Z', relatedId: 'o1' },
      { id: 'a2', type: 'post_rejected', comment: 'Poster resolution too low', date: '2025-09-12T12:00:00Z', relatedId: 'o2' }
    ];

    this.invoices = [
      { id: 'inv-1', date: '2025-09-01', amount: 5000, items: [{desc: 'Featured Offer', amount: 5000}] },
      { id: 'inv-2', date: '2025-08-01', amount: 1200, items: [{desc: 'Boost', amount: 1200}] }
    ];
  }

  get recentOffers() {
    return this.offers.slice(0, 4);
  }

  // BRAND handlers
  openBrandEdit() {
    this.brandForm.patchValue({ name: this.brand.name, tagline: this.brand.tagline, description: this.brand.description });
    this.brandEditOpen = true;
  }

  onBrandLogo(ev: any) {
    const f = ev.target.files?.[0];
    if (!f) return;
    this.brand.logo = URL.createObjectURL(f);
  }

  saveBrand() {
    const v = this.brandForm.value;
    this.brand.name = v.name;
    this.brand.tagline = v.tagline;
    this.brand.description = v.description;
    this.brand.postedOn = new Date().toLocaleDateString();
    this.brandEditOpen = false;
  }

  previewPublic() {
    alert('Preview public view (implement navigation).');
  }

  // OFFERS
  openOffers() {
    alert('Open offers page / drawer (implement navigation).');
  }
  editOffer(ev: any) {
    alert('Edit offer: ' + ev.title);
  }
  deleteOffer(ev: any) {
    if (!confirm('Delete this offer?')) return;
    this.offers = this.offers.filter(o => o.id !== ev.id);
  }

  // ADMIN responses
  openAdminResponses() {
    alert('Open admin responses (implement navigation).');
  }
  gotoRelated(id: string) {
    // try to find offer
    const found = this.offers.find(o => o.id === id);
    if (found) {
      alert('Open related offer: ' + found.title);
    } else {
      alert('Related item not in current view.');
    }
  }

  // INVOICES
  openInvoices() { this.showInvoices = true; }
  closeInvoices() { this.showInvoices = false; }

  async downloadInvoicePDF(inv: any) {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text(`Invoice #${inv.id}`, 14, 20);
      doc.setFontSize(11);
      doc.text(`Date: ${inv.date}`, 14, 30);
      doc.text(`Amount: ₹${inv.amount}`, 14, 38);
      inv.items?.forEach((it: any, i: number) => doc.text(`${i+1}. ${it.desc} — ₹${it.amount}`, 14, 48 + i*8));
      doc.save(`invoice-${inv.id}.pdf`);
    } catch (err) {
      alert('Install jspdf to enable PDF download.');
    }
  }

  // Notifications
  markAllRead() {
    this.unreadNotifications = 0;
  }

  formatShort(dateStr: string) {
    try { return new Date(dateStr).toLocaleString(); } catch { return dateStr; }
  }
}
