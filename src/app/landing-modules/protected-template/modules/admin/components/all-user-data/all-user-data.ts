import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { AdminApiService } from '../../services/admin-api';

@Component({
  selector: 'app-all-user-data',
  standalone: false,
  templateUrl: './all-user-data.html',
  styleUrls: ['./all-user-data.scss'],
})
export class AllUserData {
  sections = [
    'Real Estate',
    'Yoga Studio',
    'Businesses',
    'Community Members',
    'Scouters',
    'Classifieds',
  ];
  activeSection = this.sections[0];
  searchText = '';
  searchRightText = '';
  selectedItem: any = null;

  // Modal state
  modalVisible = false;
  modalMode: 'confirm' | 'message' | 'reply' | null = null;
  modalTitle = '';
  modalBody = '';
  modalInput = ''; // used for message/reply
  modalConfirmLabel = 'Yes';
  modalCancelLabel = 'Cancel';

  // action context (target object + action name)
  modalContext: { action?: string; target?: any; parent?: any } = {};

  // sample postedOn value
  postedOn = new Date().toISOString();

  // sample data (same as before, trimmed for brevity)
  data: any = {};
  // // {
  //   'Real Estate': [
  //     {
  //       id: 1,
  //       propertyName: 'Test 2BHK Apartment',
  //       address: '100 Demo Lane, Mysore, Karnataka',
  //       owner: 'Test Owner',
  //       phone: '90000 00000',
  //       email: 'test@example.com',
  //       details: '2BHK, 1200 sqft, Furnished',
  //       postedOn: this.postedOn,
  //       enabled: true,
  //       posts: [
  //         { id: 'p1', title: '2BHK Furnished', visible: true, postedOn: this.postedOn },
  //         { id: 'p2', title: '3BHK Unfurnished', visible: false, postedOn: this.postedOn }
  //       ]
  //     }
  //   ],
  //   'Yoga Studio': [
  //     {
  //       id: 2,
  //       name: 'Morning Flow',
  //       tagline: 'Start your day with energy',
  //       details: 'A refreshing vinyasa flow.',
  //       address: 'Bogadi',
  //       owner: 'Priya Sharma',
  //       phone: '+91 98765 11111',
  //       email: 'priya@yoga.example',
  //       postedOn: this.postedOn,
  //       enabled: true,
  //       events: [
  //         { id: 'e1', title: 'Sunrise Vinyasa', venue: 'Main Hall', validFrom: '2025-11-01', validTo: '2025-11-01', visible: true }
  //       ]
  //     }
  //   ],
  //   'Businesses': [
  //     {
  //       id: 3,
  //       name: 'Local Bakers & Co.',
  //       tagline: 'Fresh breads & handcrafted cakes',
  //       details: 'We bake fresh bread daily.',
  //       address: '12 Market Road, Mysore, Karnataka',
  //       owner: 'Ravi Kumar',
  //       phone: '+91 98765 43210',
  //       email: 'contact@localbakers.com',
  //       postedOn: this.postedOn,
  //       enabled: true,
  //       offers: [
  //         { id: 'o1', title: 'Festive Discount', venue: 'Shop', validFrom: '2025-10-10', validTo: '2025-10-31', visible: true }
  //       ]
  //     }
  //   ],
  //   'Community Members': [
  //     {
  //       id: 4,
  //       name: 'Asha Rao',
  //       phone: '+91 90000 11111',
  //       email: 'asha@example.com',
  //       address: 'Gokulam',
  //       enabled: true,
  //       requests: [
  //         { id: 'r1', title: 'Looking for part-time tutoring job', details: 'Math tutor needed', visible: true, postedOn: this.postedOn }
  //       ]
  //     }
  //   ],
  //   'Scouters': [
  //     {
  //       id: 5,
  //       name: 'Scouter Ravi',
  //       phone: '+91 90000 22222',
  //       email: 'scouter@example.com',
  //       address: 'Vijayanagar',
  //       enabled: true,
  //       connectedProperties: [
  //         { id: 'sc1', propertyName: '1BHK Cozy', owner: 'Landlord A', phone: '90000 33333', visible: true, postedOn: this.postedOn }
  //       ]
  //     }
  //   ],
  //   'Classifieds': [
  //     {
  //       id: 6,
  //       title: 'Used Car Sale',
  //       location: '2019 model sedan',
  //       details: 'Well-maintained, single-owner car.',
  //       enabled: true,
  //       interests: [
  //         { id: 'i1', name: 'Ramesh', phone: '+91 90001 11111', email: 'ramesh@example.com', message: 'Is the car still available? Can I test drive this weekend?', responded: false, response: '', createdOn: this.postedOn },
  //         { id: 'i2', name: 'Sangeeta', phone: '+91 90002 22222', email: 'sangeeta@example.com', message: 'Any accident history?', responded: true, response: 'Seller: No accidents', createdOn: this.postedOn }
  //       ]
  //     },
  //     {
  //       id: 7,
  //       title: 'Home Tutor',
  //       location: 'Math & Science',
  //       details: 'Experienced tutor for grades 8–12.',
  //       enabled: true,
  //       interests: [
  //         { id: 'i3', name: 'Vikram', phone: '+91 90003 33333', email: 'vikram@example.com', message: 'Can you tutor for 10th boards?', responded: false, response: '', createdOn: this.postedOn }
  //       ]
  //     }
  //   ]
  // // };

  // -------------------------
  // Left / Right helpers
  // -------------------------
  getFilteredItems() {
    const items = this.data[this.activeSection] || [];
    if (!this.searchText) return items;
    const q = this.searchText.toLowerCase();
    return items.filter((item: any) => {
      const values = [
        item.title,
        item.name,
        item.propertyName,
        item.address,
        item.location,
        item.owner,
        item.tagline,
        item.type,
      ]
        .filter(Boolean)
        .map((v: any) => String(v).toLowerCase());
      return values.some((v: string) => v.includes(q));
    });
  }

  getRightList() {
    //this.getEventData();
    if (!this.selectedItem) return [];
    const q = (this.searchRightText || '').toLowerCase();
    if (this.activeSection === 'Yoga Studio') {
      const arr = this.selectedItem.events || [];
      return q
        ? arr.filter(
            (it: any) =>
              (it.title || '').toLowerCase().includes(q) ||
              (it.description || '').toLowerCase().includes(q)
          )
        : arr;
    }
    if (this.activeSection === 'Businesses') {
      const arr = this.selectedItem.events || [];
      return q
        ? arr.filter(
            (it: any) =>
              (it.title || '').toLowerCase().includes(q) ||
              (it.description || '').toLowerCase().includes(q)
          )
        : arr;
    }
    if (this.activeSection === 'Real Estate') {
      const arr = this.selectedItem.posts || [];
      return q
        ? arr.filter(
            (it: any) =>
              (it.title || it.propertyName || '').toLowerCase().includes(q) ||
              (it.details || '').toLowerCase().includes(q)
          )
        : arr;
    }
    if (this.activeSection === 'Community Members') {
      const arr = this.selectedItem.requests || [];
      return q
        ? arr.filter(
            (it: any) =>
              (it.title || '').toLowerCase().includes(q) ||
              (it.details || '').toLowerCase().includes(q)
          )
        : arr;
    }
    if (this.activeSection === 'Scouters') {
      const arr = this.selectedItem.connectedProperties || [];
      return q
        ? arr.filter(
            (it: any) =>
              (it.propertyName || '').toLowerCase().includes(q) ||
              (it.owner || '').toLowerCase().includes(q)
          )
        : arr;
    }
    if (this.activeSection === 'Classifieds') {
      const arr = this.selectedItem.interests || [];
      return q
        ? arr.filter(
            (it: any) =>
              (it.name || '').toLowerCase().includes(q) ||
              (it.message || '').toLowerCase().includes(q)
          )
        : arr;
    }
    return [];
  }

  selectItem(item: any) {
    this.selectedItem = item;
    this.searchRightText = '';
    this.getEventData();
  }

  // -------------------------
  // Modal helpers
  // -------------------------
  openConfirm(title: string, body: string, target: any, action: string) {
    this.modalMode = 'confirm';
    this.modalTitle = title;
    this.modalBody = body;
    this.modalInput = '';
    this.modalConfirmLabel = 'Yes';
    this.modalCancelLabel = 'Cancel';
    this.modalContext = { action, target, parent: this.selectedItem };
    this.modalVisible = true;
  }

  openMessageModal(title: string, defaultText: string, target: any, action = 'sendMessage') {
    this.modalMode = 'message';
    this.modalTitle = title;
    this.modalBody = '';
    this.modalInput = defaultText || '';
    this.modalConfirmLabel = 'Send';
    this.modalCancelLabel = 'Cancel';
    this.modalContext = { action, target, parent: this.selectedItem };
    this.modalVisible = true;
  }

  openReplyModal(interest: any, parentItem: any) {
    this.modalMode = 'reply';
    this.modalTitle = `Reply to ${interest.name}`;
    this.modalBody = `Original: "${interest.message}"`;
    this.modalInput = interest.response || '';
    this.modalConfirmLabel = 'Reply';
    this.modalCancelLabel = 'Cancel';
    this.modalContext = { action: 'replyToInterest', target: interest, parent: parentItem };
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
    this.modalMode = null;
    this.modalInput = '';
    this.modalContext = {};
  }

  // Called when confirm dialog OK clicked
  confirmOk() {
    const { action, target } = this.modalContext as any;
    this.modalVisible = false;

    if (action === 'toggleEnable') {
      target.enabled = !target.enabled;
      // TODO: persist via API
      return;
    }

    if (action === 'markResponded') {
      target.responded = !target.responded;
      if (!target.responded) target.response = '';
      // TODO persist
      return;
    }

    // other confirm actions can be added here
  }

  // Called when message/reply OK clicked
  confirmSend() {
    const { action, target, parent } = this.modalContext as any;
    const payload = (this.modalInput || '').trim();
    this.modalVisible = false;

    if (!payload) {
      // nothing to send — keep modal closed but do nothing
      return;
    }

    if (action === 'sendMessage') {
      // send message to target (user/item)
      // For demo, store message on the target as `lastAdminMessage`
      target.lastAdminMessage = payload;
      // TODO: call messaging API
      return;
    }

    if (action === 'replyToInterest') {
      // target is interest entry
      target.response = payload;
      target.responded = true;
      // TODO: call messaging API
      return;
    }

    // generic fallback
    target.lastAdminMessage = payload;
  }

  // -------------------------
  // Public actions (replaced window.* usages)
  // -------------------------
  // Toggle enable with confirm
  toggleEnable(item: any) {
    const will = item.enabled ? 'Disable' : 'Enable';
    this.openConfirm(
      `${will} item`,
      `Are you sure you want to ${will.toLowerCase()} this item?`,
      item,
      'toggleEnable'
    );
  }

  // Toggle visibility (no confirm needed)
  toggleVisibility(item: any) {
    item.visible = !item.visible;
    // TODO persist
  }

  // Send message: open message modal
  sendMessageToUser(item: any) {
    const defaultMsg = `Hello ${item.owner || item.name || item.title || ''},\n\n`;
    this.openMessageModal('Send message', defaultMsg, item, 'sendMessage');
  }

  // Reply to interest: open reply modal
  replyToInterest(interest: any, parentItem: any) {
    this.openReplyModal(interest, parentItem);
  }

  // Mark responded/unresponded with confirm
  markResponded(interest: any) {
    const will = interest.responded ? 'Mark as not responded' : 'Mark as responded';
    this.openConfirm(
      will,
      `Are you sure you want to ${will.toLowerCase()}?`,
      interest,
      'markResponded'
    );
  }

  // fallback toggle action show/hide
  toggleActionShow(item: any) {
    item.actionHidden = !item.actionHidden;
  }

  getTopTitle() {
    if (!this.selectedItem) return '';
    if (this.activeSection === 'Real Estate')
      return this.selectedItem.propertyName || this.selectedItem.title || 'Property';
    if (this.activeSection === 'Yoga Studio' || this.activeSection === 'Businesses')
      return this.selectedItem.name || this.selectedItem.title || 'Details';
    if (this.activeSection === 'Community Members' || this.activeSection === 'Scouters')
      return this.selectedItem.name || this.selectedItem.title || 'Member';
    if (this.activeSection === 'Classifieds') return this.selectedItem.title || 'Classified';
    return this.selectedItem.title || this.selectedItem.name;
  }

  loading: boolean = true;

  constructor(
    private fb: FormBuilder,
    private adminApiService: AdminApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getProperties();
    this.getCombineAPIData();
  }

  changeTap(section: string) {
    this.activeSection = section;
    this.selectedItem = null;
  }

  getAllData(): Observable<any[]> {
    const apiCall1 = this.adminApiService.getBussiness();
    const apiCall2 = this.adminApiService.getStudio();
    const apiCall3 = this.adminApiService.getClassifieds();
    return forkJoin([apiCall1, apiCall2, apiCall3]);
  }
  getCombineAPIData() {
    this.getAllData().subscribe(
      (results: any[]) => {
        const studioList = results[1];
        const bussinessList = results[0];
        const classifiedList = results[2];
        console.log('Studio List:', studioList);
        console.log('Bussiness List:', bussinessList);
        this.data['Businesses'] = [];
        bussinessList.items.forEach((property: any) => {
          this.data['Businesses'].push({
            id: property.businessUserId,
            title: property.name ? property.name : 'No Name',
            shortDesc: property.tagline ? property.tagline : '',
            details: property.details,
          });
        });
        this.data['Yoga Studio'] = [];
        studioList.items.forEach((property: any) => {
          this.data['Yoga Studio'].push({
            id: property.studioUserId,
            title: property.name ? property.name : 'No Name',
            shortDesc: property.tagline ? property.tagline : '',
            details: property.details,
          });
        });
        this.data['Classifieds'] = [];
        classifiedList.items.forEach((property: any) => {
          this.data['Classifieds'].push({
            id: property.classifiedId,
            title: property.title ? property.title : 'No Name',
            shortDesc: property.location ? property.location : '',
            details: property.description,
          });
        });
        this.cdr.detectChanges();
        // You can now use studioList and bussinessList as needed
      },
      (error: any) => {}
    );
  }

  getEventData() {
    switch (this.activeSection) {
      case 'Yoga Studio': {
        this.adminApiService.getYogaEvents(this.selectedItem.id).subscribe((response: { items: any[] }) => {
          const studio = response.items;
          if (studio.length) {
            this.selectedItem['events'] = studio || [];
          }
          this.cdr.detectChanges();
        });
        break;
      }

      case 'Businesses':
        {
          this.adminApiService.getBussinessEvents(this.selectedItem.id).subscribe((response: { items: any[] }) => {
            const business = response.items;
            if (business.length) {
              this.selectedItem.events = business || [];
            }
            this.cdr.detectChanges();
          });
        }
        break;
    }
  }

  getProperties() {
    this.loading = true;
    this.adminApiService.getProperties().subscribe({
      next: (response: { items: any[] }) => {
        console.log('✅ Property added successfully:', response);

        this.data['Real Estate'] = [];
        response.items.forEach((property: any) => {
          this.data['Real Estate'].push({
            id: property.propertyId,
            title: property.propertyName ? property.propertyName : 'No Name',
            shortDesc: property.details ? property.details : '',
            details: property.details,
          });
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.loading = false;
        console.error('❌ Error adding property:', error);
        this.cdr.detectChanges();
      },
      complete: () => {
        this.cdr.detectChanges();
      },
    });

    return this.data;
  }

  isMobileView = window.innerWidth < 768;

  @HostListener('window:resize', [])
  onResize() {
    this.isMobileView = window.innerWidth < 768;
  }
}
