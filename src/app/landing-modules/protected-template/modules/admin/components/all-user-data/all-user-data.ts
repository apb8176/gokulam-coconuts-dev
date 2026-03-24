import { ChangeDetectorRef, Component, HostListener, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { AdminApiService } from '../../services/admin-api';
import { InterestListComponent } from '../interest-list.component/interest-list.component';

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
  get photoUrls(): string[] {
    if (!this.selectedItem) return [];
    const combined = [
      ...(Array.isArray(this.selectedItem.photos_urls) ? this.selectedItem.photos_urls : []),
      ...(Array.isArray(this.selectedItem.photos) ? this.selectedItem.photos : []),
      ...(Array.isArray(this.selectedItem.images) ? this.selectedItem.images : []),
      ...this.getMediaByType('image'),
    ];
    return this.normalizeMediaList(combined);
  }

  get videoUrls(): string[] {
    if (!this.selectedItem) return [];
    const combined = [
      ...(Array.isArray(this.selectedItem.videos_urls) ? this.selectedItem.videos_urls : []),
      ...(Array.isArray(this.selectedItem.videos) ? this.selectedItem.videos : []),
      ...this.getMediaByType('video'),
    ];
    return this.normalizeMediaList(combined);
  }

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
 @ViewChild(InterestListComponent) interestModal!: InterestListComponent;


  // sample data (same as before, trimmed for brevity)
  data: any = {};
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

  private getMediaByType(type: 'image' | 'video'): any[] {
    const media = Array.isArray(this.selectedItem?.media) ? this.selectedItem.media : [];
    if (!media.length) return [];
    return media.filter((entry: any) =>
      type === 'image' ? this.isImageEntry(entry) : this.isVideoEntry(entry)
    );
  }

  private normalizeMediaList(list: any): string[] {
    const entries = Array.isArray(list) ? list : list ? [list] : [];
    const urls = entries
      .map((entry) => this.resolveEntryUrl(entry))
      .filter((url): url is string => typeof url === 'string' && url.trim().length > 0);
    return Array.from(new Set(urls));
  }

  private resolveEntryUrl(entry: any): string | null {
    if (!entry) return null;
    if (typeof entry === 'string') return entry;
    const candidateProps = [
      'url',
      'uri',
      'link',
      'signedUrl',
      'fileUrl',
      'path',
      'src',
      'mediaUrl',
      'downloadLink',
      'attachmentUrl',
    ];
    for (const prop of candidateProps) {
      const value = entry[prop];
      if (typeof value === 'string' && value.trim()) {
        return value;
      }
    }
    if (entry.file && typeof entry.file === 'string' && entry.file.trim()) {
      return entry.file;
    }
    if (entry.file?.url) return entry.file.url;
    if (entry.data?.url) return entry.data.url;
    return null;
  }

  private getMediaTypeHints(entry: any): string[] {
    if (!entry || typeof entry !== 'object') return [];
    return ['mediaType', 'type', 'mimeType', 'fileType', 'category']
      .map((key) => entry[key])
      .filter(Boolean)
      .map((hint) => String(hint).toLowerCase());
  }

  private isImageEntry(entry: any): boolean {
    const hints = this.getMediaTypeHints(entry);
    const keywords = ['image', 'photo', 'jpeg', 'jpg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp'];
    return hints.some((hint) => keywords.some((keyword) => hint.includes(keyword)));
  }

  private isVideoEntry(entry: any): boolean {
    const hints = this.getMediaTypeHints(entry);
    const keywords = ['video', 'mp4', 'mov', 'avi', 'mpeg', 'webm', 'mkv'];
    return hints.some((hint) => keywords.some((keyword) => hint.includes(keyword)));
  }

  showInterestList(_t105: any) {
    console.log(_t105);
     
     this.adminApiService.getInterestList(_t105.eventId).subscribe({
      next: (response: { items: any[] }) => {
        console.log('✅ Property added successfully:', response);

    this.interestModal.open(response);
      
      
        this.cdr.detectChanges();
      },
      error: (error: any) => {
      
        console.error('❌ Error adding property:', error);
        this.cdr.detectChanges();
      },
      complete: () => {
        this.cdr.detectChanges();
      },
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
      const arr = this.selectedItem.events || [];
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
    console.log(item);
    
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
      if (target.isEnable !== undefined) {
        target.isEnable = target.isEnable === 'true' ? 'false' : 'true';
      } else {
        target.enabled = !target.enabled;
      }
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
    const isCurrentlyEnabled = item.isEnable !== undefined ? item.isEnable === 'true' : item.enabled;
    const will = isCurrentlyEnabled ? 'Disable' : 'Enable';
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
    const defaultMsg = `Hello ${item.contactName || item.owner || item.name || item.title || ''},\n\n`;
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
    const apiCall4 = this.adminApiService.getMembers();

    return forkJoin([apiCall1, apiCall2, apiCall3, apiCall4]);
  }
  getCombineAPIData() {
    this.getAllData().subscribe(
      (results: any[]) => {
        const studioList = results[1];
        const bussinessList = results[0];
        const classifiedList = results[2];
        const memeberList = results[3];
        console.log('Studio List:', studioList);
        console.log('Bussiness List:', bussinessList);
        this.data['Businesses'] = [];
        bussinessList.items.forEach((property: any) => {
          this.data['Businesses'].push({
            ...property,
            id: property.businessUserId,
            title: property.name ? property.name : 'No Name',
            shortDesc: property.tagline ? property.tagline : '',
            details: property.details,
          });
        });
        this.data['Yoga Studio'] = [];
        studioList.items.forEach((property: any) => {
          this.data['Yoga Studio'].push({
            ...property,
            id: property.studioUserId,
            title: property.name ? property.name : 'No Name',
            shortDesc: property.tagline ? property.tagline : '',
            details: property.details,
          });
        });
        this.data['Classifieds'] = [];
        classifiedList.items.forEach((property: any) => {
          this.data['Classifieds'].push({
            ...property,
            id: property.classifiedId,
            title: property.title ? property.title : 'No Name',
            shortDesc: property.location ? property.location : '',
            details: property.description,
          });
        });
        this.data['Community Members'] = [];
        console.log('memeberList',memeberList);
        
        memeberList.items.forEach((property: any) => {
          this.data['Community Members'].push({
            ...property,
            id: property.communityUserId,
            title: property.firstName ? property.firstName+ ' '+property.lastName : 'No Name',
            shortDesc: property.phone ? property.phone : '',
            details: property.email,
          });
        });
        this.cdr.detectChanges();
        // You can now use studioList and bussinessList as needed
      },
      (error: any) => {}
    );
  }

  getEventData() {
    console.log(this.activeSection);
    
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
          break;
        }

      case 'Community Members':
        {
          this.adminApiService.getMemberEvents(this.selectedItem.id).subscribe((response: { items: any[] }) => {
            const memberClass = response.items;
            console.log(response.items);
            
            if (memberClass.length) {
              this.selectedItem.events = memberClass || [];
              this.selectedItem.events = this.selectedItem.events.map((item:any)=>{

                return { ...item, "details":item.description,"postedOn":new Date(item.createdAt).toLocaleString() };

              })
              console.log(this.selectedItem.events);
              
            }
            this.cdr.detectChanges();
          });
          break;
        }
        
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
            ...property,
            id: property.propertyId,
            title: property.propertyName ? property.propertyName : 'No Name',
            shortDesc: property.details ? property.details : '',
            details: property.details,
            owner: property.ownerName,
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
