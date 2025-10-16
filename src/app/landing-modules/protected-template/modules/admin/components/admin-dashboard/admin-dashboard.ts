
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

export type PendingItem = {
  id: string;
  name: string;
  type: string;
  date: string; // ISO
  summary?: string;
  // admin fields we will set from modal:
  adminStatus?: 'Accepted' | 'Rejected' | 'Custom' | null;
  adminComment?: string | null;
  section?: string; // optional: helps to know where it belongs
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard { 
  private router = inject(Router);

  // --- example data (keep as before) ---
  approveUserRegs: PendingItem[] = [
    { id: 'u1', name: 'Anita Sharma', type: 'Tenant', date: '2025-10-14', summary: 'New user from Mysore' },
    { id: 'u2', name: 'Ravi Kumar', type: 'Owner', date: '2025-10-13', summary: 'Verified phone' },
  ];

  approveProperties: PendingItem[] = [
    { id: 'p1', name: '2BHK in Jayanagar', type: 'New Listing', date: '2025-10-15', summary: 'Added 6 photos, price updated' },
    { id: 'p2', name: 'Whitefield Villa update', type: 'Update', date: '2025-10-11', summary: 'Change in description & price' },
  ];

  communityRequests: PendingItem[] = [
    { id: 'c1', name: 'Plumbing help - 2nd Cross', type: 'Plumber Request', date: '2025-10-12', summary: 'Urgent leak repair' },
    { id: 'c2', name: 'Pre-owned WagonR', type: 'Car Sell Request', date: '2025-10-10', summary: 'Good condition, single owner' },
  ];

  businessOffers: PendingItem[] = [
    { id: 'b1', name: 'Yoga Studio - Launch Offer', type: 'Event/Offer', date: '2025-10-09', summary: 'Opening discounts for first 50' },
    { id: 'b2', name: 'Cafe - Weekend Brunch', type: 'Update', date: '2025-10-08', summary: 'New menu added' },
  ];

  landlordRequests: PendingItem[] = [
    { id: 's1', name: 'Scout - Add landlord Mr. Reddy', type: 'Add Landlord', date: '2025-10-07', summary: 'New landlord for Indiranagar' },
    { id: 's2', name: 'Scout - Edit landlord contact', type: 'Edit Landlord', date: '2025-10-06', summary: 'Updated phone number' },
  ];

  // --- Signals for modal state and selected item ---
  isModalOpen = signal(false);
  selectedItem = signal<PendingItem | null>(null);
  selectedSection = signal<string | null>(null);

  // responseType signal: 'accept' | 'reject' | 'custom'
  responseType = signal<'accept' | 'reject' | 'custom'>('accept');
  comment = signal('');

  // --- called from each Respond button in template ---
  openRespondModal(item: PendingItem, section: string) {
    // copy item lightly to avoid accidental mutation while editing; we'll update original on save
    this.selectedItem.set({ ...item, section });
    this.selectedSection.set(section);
    this.responseType.set('accept'); // default
    this.comment.set(item.adminComment ?? '');
    this.isModalOpen.set(true);
    // prevent body scroll while modal open
    document.documentElement.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen.set(false);
    // small timeout to clear selectedItem after animation completes (optional)
    setTimeout(() => {
      this.selectedItem.set(null);
      this.selectedSection.set(null);
      this.comment.set('');
      // restore scrolling
      document.documentElement.style.overflow = '';
    }, 220); // match transition duration
  }

  saveResponse() {
    const si = this.selectedItem();
    const sec = this.selectedSection();
    if (!si || !sec) { this.closeModal(); return; }

    // determine status label
    const status = this.responseType() === 'accept' ? 'Accepted' :
                   this.responseType() === 'reject' ? 'Rejected' : 'Custom';

    // find the actual item in the corresponding array and update it (so UI reflects change)
    const update = (arr: PendingItem[]) => {
      const idx = arr.findIndex(x => x.id === si.id);
      if (idx > -1) {
        arr[idx] = {
          ...arr[idx],
          adminStatus: status as PendingItem['adminStatus'],
          adminComment: this.comment() ?? null,
        };
      }
    };

    switch (sec) {
      case 'users': update(this.approveUserRegs); break;
      case 'properties': update(this.approveProperties); break;
      case 'community': update(this.communityRequests); break;
      case 'business': update(this.businessOffers); break;
      case 'scout': update(this.landlordRequests); break;
      default: break;
    }

    // optional: call API here to persist decision
    // this.api.post('/admin/respond', { id: si.id, section: sec, status, comment: this.comment() })

    // close modal
    this.closeModal();
  }

  // keep old respond() for backward compatibility if used elsewhere
  respond(item: PendingItem, section: string) {
    this.openRespondModal(item, section);
  }

  // seeMore navigation (unchanged)
  seeMore(section: string) {
    this.router.navigate(['/admin/approvals', section]);
  }

  // approve/reject helpers (kept for other buttons)
  approve(item: PendingItem, section: string) {
    // simple set — in real app call backend and reflect change
    item.adminStatus = 'Accepted';
    item.adminComment = null;
  }
  reject(item: PendingItem, section: string) {
    item.adminStatus = 'Rejected';
    item.adminComment = null;
  }
}
