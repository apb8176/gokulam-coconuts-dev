import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CmApiService } from '../../services/cm-api-service';
import { Observable } from 'rxjs/internal/Observable';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../../../core/services/auth.service';

@Component({
  selector: 'app-item-list',
  standalone: false,
  templateUrl: './item-list.html',
  styleUrl: './item-list.scss',
})
export class ItemList {
  sections = ['Real Estate', 'Yoga Studio', 'Business', 'Classifieds'];
  activeSection = this.sections[0];
  searchText = '';
  selectedItem: any = null;
  loading: boolean = true;

  modalVisible = false;
  modalMode: 'confirm' | 'message' | 'reply' | null = null;
  modalTitle = '';
  modalBody = '';
  modalInput = ''; // used for message/reply
  modalConfirmLabel = 'Yes';
  modalCancelLabel = 'Cancel';

  // action context (target object + action name)
  modalContext: { action?: string; target?: any; parent?: any } = {};
  currentSubItem: any;
  currentUser: any;
  studioList: any;
  bussinessList: any;
  classifiedList: any;
  propertyList: any;

  constructor(
    private fb: FormBuilder,
    private cmApi: CmApiService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}
  data: any = {
    'Real Estate': [
      {
        id: 1,
        title: 'Luxury Apartment',
        shortDesc: '3BHK sea view',
        details: 'A premium 3BHK apartment near the beach with modern interiors and parking.',
      },
      {
        id: 2,
        title: 'Downtown Office',
        shortDesc: 'Prime location',
        details: 'Spacious commercial space in the city center with excellent connectivity.',
      },
    ],
    'Yoga Studio': [
      {
        id: 3,
        title: 'Morning Flow',
        shortDesc: '6AM - 7AM',
        details: 'A refreshing vinyasa flow to start your day with energy and mindfulness.',
      },
      {
        id: 4,
        title: 'Weekend Retreat',
        shortDesc: '2-day session',
        details: 'A peaceful weekend yoga retreat in the hills with guided meditation.',
      },
    ],
    Bussiness: [
      {
        id: 5,
        title: 'New Arrivals',
        shortDesc: 'Autumn collection',
        details: 'Latest fashion trends with vibrant colors and sustainable fabrics.',
      },
      {
        id: 6,
        title: 'Discount Offers',
        shortDesc: 'Up to 40% off',
        details: 'Exciting seasonal discounts on select items for a limited time.',
      },
    ],
    Classifieds: [
      {
        id: 7,
        title: 'Used Car Sale',
        shortDesc: '2019 model sedan',
        details: 'Well-maintained, single-owner car with full service history and insurance.',
      },
      {
        id: 8,
        title: 'Home Tutor',
        shortDesc: 'Math & Science',
        details: 'Experienced tutor available for home sessions, grades 8–12.',
      },
      {
        id: 9,
        title: 'Freelance Designer',
        shortDesc: 'Logo & branding',
        details: 'Creative freelance designer available for logo, poster, and web design work.',
      },
    ],
  };
  ngOnInit() {
    this.currentUser = this.authService.getUser();

    this.getProperties();
    this.getCombineAPIData();
  }

  changeTap(section: string) {
    this.activeSection = section;
    this.selectedItem = null;
  }

  getAllData(): Observable<any[]> {
    const apiCall1 = this.cmApi.getBussiness();
    const apiCall2 = this.cmApi.getStudio();
    const apiCall3 = this.cmApi.getClassifieds();
    return forkJoin([apiCall1, apiCall2, apiCall3]);
  }
  getCombineAPIData() {
    this.getAllData().subscribe(
      (results) => {
        this.studioList = results[1];
        this.bussinessList = results[0];
        this.classifiedList = results[2];
        console.log('Studio List:', this.studioList);
        console.log('Bussiness List:', this.bussinessList);
        this.data['Business'] = [];
        this.bussinessList.items.forEach((property: any) => {
          this.data['Business'].push({
            id: property.businessUserId,
            title: property.name ? property.name : 'No Name',
            shortDesc: property.tagline ? property.tagline : '',
            details: property.details,
          });
        });
        this.data['Yoga Studio'] = [];
        this.studioList.items.forEach((property: any) => {
          this.data['Yoga Studio'].push({
            id: property.studioUserId,
            title: property.name ? property.name : 'No Name',
            shortDesc: property.tagline ? property.tagline : '',
            details: property.details,
          });
        });
        this.data['Classifieds'] = [];
        this.classifiedList.items.forEach((property: any) => {
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
      (error) => {}
    );
  }
  getFilteredItems() {
    const items = this.data[this.activeSection] || [];
    return items.filter(
      (item: any) =>
        item.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        item.shortDesc.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
  toggleEnable(item: any) {
    const will = item.enabled ? 'Disable' : 'Enable';
    this.openConfirm(
      `${will} item`,
      `Are you sure you want to ${will.toLowerCase()} this item?`,
      item,
      'toggleEnable'
    );
  }
  selectItem(item: any) {
    this.selectedItem = item;
    console.log('this.selectedItem', this.selectedItem);

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

  closeModal() {
    this.modalVisible = false;
    this.modalMode = null;
    this.modalInput = '';
    this.modalContext = {};
  }
  toggleActionShow(item: any) {
    item.actionHidden = !item.actionHidden;
    this.sendMessageToUser(this.selectedItem, item);
    console.log(item);
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
      let data = {
        userId: '',
        sourceTable: '',
        idAttr: '',
        interest: true,
        enquires: '',
        ownerUserId: '',
      };
      data.enquires = this.modalInput;
      console.log(this.selectedItem);
      if (this.selectedItem.events && this.selectedItem.events[0].studioUserId) {
        data.sourceTable = 'YogaEventDetails';
        data.userId = this.selectedItem.events[0].eventId;
        (data.idAttr = 'eventId'), (data.ownerUserId = this.selectedItem.events[0].studioUserId);
      } else if (this.selectedItem.events && this.selectedItem.events[0].propertyUserId) {
        data.sourceTable = 'PropertyDetails';
        data.userId = this.selectedItem.events[0].propertyId;
        (data.idAttr = 'propertyId'),
          (data.ownerUserId = this.selectedItem.events[0].propertyUserId);
      } else if (this.selectedItem.events && this.selectedItem.events[0].businessUserId) {
        data.sourceTable = 'BusinessEventDetails';
        data.userId = this.selectedItem.events[0].eventId;
        (data.idAttr = 'eventId'),
          (data.ownerUserId = this.selectedItem.events[0].businessUserId);
      } else if (this.selectedItem.events && this.selectedItem.events[0].communityUserId) {
        data.sourceTable = 'MemberClassifieds';
        data.userId = this.selectedItem.events[0].classifiedId;
        (data.idAttr = 'classifiedId'),
          (data.ownerUserId = this.selectedItem.events[0].communityUserId);
      } else {        
        let item = this.classifiedList.items.filter(
          (item: any) => item.classifiedId == this.selectedItem.id
        )[0];
        data.sourceTable = 'MemberClassifieds';
        data.userId = item.classifiedId;
        (data.idAttr = 'classifiedId'), (data.ownerUserId = item.communityUserId);
      }

      this.postInterest(data);
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

  getEventData() {
    switch (this.activeSection) {
      case 'Yoga Studio': {
        this.cmApi.getYogaEvents(this.selectedItem.id).subscribe((response: { items: any[] }) => {
          const studio = response.items;
          if (studio.length) {
            this.selectedItem['events'] = studio || [];
          }
          this.cdr.detectChanges();
        });
        break;
      }

      case 'Business':
        {
          this.cmApi
            .getBussinessEvents(this.selectedItem.id)
            .subscribe((response: { items: any[] }) => {
              const business = response.items;
              if (business.length) {
                this.selectedItem['events'] = business || [];
              }
              console.log(business);
              
              this.cdr.detectChanges();
            });
        }
        break;
    }
  }
  // toggleEnable(item: any) {
  //   const will = item.enabled ? 'Disable' : 'Enable';
  //   this.openConfirm(`${will} item`, `Are you sure you want to ${will.toLowerCase()} this item?`, item, 'toggleEnable');
  // }

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
  sendMessageToUser(item: any, subItem?: any) {
    this.currentSubItem = subItem;
    const defaultMsg = `Hello ${item.owner || item.name || item.title || ''},\n\n`;
    this.openMessageModal('Send message', defaultMsg, item, 'sendMessage');
  }
  // Toggle visibility (no confirm needed)
  toggleVisibility(item: any) {
    item.visible = !item.visible;
    // TODO persist
  }
  getTopTitle() {
    if (!this.selectedItem) return '';
    if (this.activeSection === 'Real Estate')
      return this.selectedItem.propertyName || this.selectedItem.title || 'Property';
    if (this.activeSection === 'Yoga Studio' || this.activeSection === 'Business')
      return this.selectedItem.name || this.selectedItem.title || 'Details';
    if (this.activeSection === 'Community Members' || this.activeSection === 'Scouters')
      return this.selectedItem.name || this.selectedItem.title || 'Member';
    if (this.activeSection === 'Classifieds') return this.selectedItem.title || 'Classified';
    return this.selectedItem.title || this.selectedItem.name;
  }
  searchRightText = '';
  getRightList() {
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
    if (this.activeSection === 'Business') {
    
      
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
  replyToInterest(interest: any, parentItem: any) {
    this.openReplyModal(interest, parentItem);
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

  getProperties() {
    this.loading = true;
    this.cmApi.getProperties().subscribe({
      next: (response) => {
        console.log('✅ Property added successfully:', response);
        this.propertyList = response.items;
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
      error: (error) => {
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

  postInterest(data: any) {
    console.log(this.selectedItem);

    // let data = {
    //   "classifiedId": this.selectedItem.id,
    //   "userId":this.currentUser.cognitoSub,
    //   "communityUserId": "002c499c-7091-704a-fa7b-a10a067b690f",
    //   "interest": true,
    //   "sourceTable":'yoga_event',
    //   "enquires": this.modalInput
    // }{

    // }

    this.cmApi.postInterest(data).subscribe({
      next: (response) => {
        console.log('✅ Property added successfully:', response);
        this.closeModal();
      },
      error: (error) => {
        console.error('❌ Error adding property:', error);
      },
    });
  }
}
