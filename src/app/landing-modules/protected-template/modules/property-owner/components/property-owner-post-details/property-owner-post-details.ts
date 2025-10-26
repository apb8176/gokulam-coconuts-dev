import { Component, Input } from '@angular/core';
import { PoApi } from '../../services/po-api';
import { MultipartUpload } from '../../services/multipart-upload';

type PhotoItem = {
  key: string; // unique key for this photo, sent as form field name
  file: File; // actual File object (binary)
  previewUrl?: string; // local preview URL
};

@Component({
  selector: 'property-owner-post-details',
  standalone: false,
  templateUrl: './property-owner-post-details.html',
  styleUrls: ['./property-owner-post-details.scss'],
})
export class PropertyOwnerPostDetails {
  videos: any = [];
  constructor(private propertyService: PoApi, private uploadService: MultipartUpload) {}

  @Input() propertySelected: any ;
  // = {
  //   propertyName: 'Luxury 2BHK Apartment',
  //   address: '123 Palm Street, Mysore, Karnataka',
  //   googleMapUrl: 'https://maps.google.com/?q=123+Palm+Street+Mysore',
  //   contact: {
  //     owner: 'John Doe',
  //     phone: '+91 98765 43210',
  //     email: 'john@example.com',
  //   },
  //   type: 'Apartment',
  //   details: '2BHK, 1200 sqft, Semi-Furnished',
  //   facilities: ['Lift', '24x7 Water', 'Security', 'Parking', 'Power Backup'],
  //   price: '₹ 25,000 / month',
  //   purpose: 'Rent',
  //   photos: [],
  //   video: 'assets/ovt.mp4',
  //   buildingAge: '5 years',
  //   status: 'Available',
  //   conditions: 'No pets allowed. 3-month deposit.',
  //   postedOn: '2025-09-25',
  // };

  // normalized property.photos as PhotoItem[]
  property: any = {
    propertyName: '',
    address: '',
    googleMapUrl: '',
    contact: { owner: '', phone: '', email: '' },
    type: '',
    details: '',
    facilities: [],
    price: '',
    purpose: '',
    photos: [] as PhotoItem[],
    video: null as File | null, // store video File for upload, keep preview outside
    videoPreview: '' as string,
    buildingAge: '',
    status: '',
    conditions: '',
    postedOn: new Date().toISOString().split('T')[0],
  };

  // other fields kept from your original component
  showInterested = false;
  propertySelectedPep = {
    interestedPeople: [
      {
        name: 'John Doe',
        address: '123 Street, City',
        phone: '9876543210',
        email: 'john@example.com',
        date: '2025-09-28',
        message: 'Is it still available?',
      },
      {
        name: 'Jane Smith',
        address: '456 Avenue, Town',
        phone: '9876501234',
        email: 'jane@example.com',
        date: '2025-09-29',
        message: '',
      },
    ],
  };
  showInfo: boolean = true;
  propertys: any = {
    /* ... omitted for brevity ... */
  };
  isEditMode = false;
  facilityInput = '';
 file?: File;
  uploading = false;
  // when component initializes, if propertySelected.photos contains legacy string URLs,
  // convert them into PhotoItem with no file (preview-only) so they still display.
  ngOnInit() {
    console.log('this.uploadService.selectedItem',this.uploadService.selectedItem());
    
    this.propertySelected =this.uploadService.selectedItem(); 
    this.propertys = this.propertySelected;
    this.loadSelectedPropertyToForm();
    console.log(this.propertySelected);
    
  }

  loadSelectedPropertyToForm() {
    // Map basic fields
    if (this.propertySelected) {
      this.property.propertyName = this.propertySelected.propertyName || '';
      this.property.address = this.propertySelected.address || '';
      this.property.googleMapUrl = this.propertySelected.googleMapUrl || '';
      this.property.contact = this.propertySelected.contact || { owner: '', phone: '', email: '' };
      this.property.type = this.propertySelected.type || '';
      this.property.details = this.propertySelected.details || '';
      this.property.facilities = Array.isArray(this.propertySelected.facilities)
        ? [...this.propertySelected.facilities]
        : [];
      this.property.price = this.propertySelected.price || '';
      this.property.purpose = this.propertySelected.purpose || '';
      this.property.buildingAge = this.propertySelected.buildingAge || '';
      this.property.status = this.propertySelected.status || '';
      this.property.conditions = this.propertySelected.conditions || '';
      this.property.postedOn = this.propertySelected.postedOn || this.property.postedOn;

      // Photos: normalize legacy URL strings to PhotoItem with previewUrl only
      const initialPhotos = this.propertySelected.photos || [];
      this.property.photos = initialPhotos.map((p: any, idx: number) => {
        if (typeof p === 'string') {
          return {
            key: `photo_${Date.now()}_${idx}`, // unique key
            file: null as any, // no File available (server image only)
            previewUrl: p, // show existing image URL
          } as PhotoItem;
        } else if (p instanceof File) {
          return {
            key: `photo_${Date.now()}_${idx}`,
            file: p,
            previewUrl: URL.createObjectURL(p),
          } as PhotoItem;
        } else {
          // fallback
          return {
            key: `photo_${Date.now()}_${idx}`,
            file: null as any,
            previewUrl: String(p),
          } as PhotoItem;
        }
      });
    }
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.file = input.files[0];
    }
  }

  async onVideoSelected(event:any) {
    this.file = event.target.files[0] ;
    if (!this.file) return alert('Pick a file first');
    this.uploading = true;
    try {
      const result = await this.uploadService.uploadFile(this.file);
      console.log('Upload completed', result.completed);
      alert('Upload completed successfully');
      this.videos.push(result.completed[0].key);
    } catch (err: any) {
      console.error(err);
      alert('Upload failed: ' + err.message);
    } finally {
      this.uploading = false;
    }
  }

  toggleEdit() {
    this.isEditMode = !this.isEditMode;
  }

  addFacility() {
    if (this.facilityInput.trim()) {
      this.property.facilities.push(this.facilityInput.trim());
      this.facilityInput = '';
    }
  }

  removeFacility(index: number) {
    this.property.facilities.splice(index, 1);
  }

  // Photo handling: multiple selection allowed
  onPhotoSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file) {
        this.property.photos.push(file); // push only the File object (binary)
      }
    }

    // reset input so same file can be re-selected later
    (event.target as HTMLInputElement).value = '';
  }

  // onVideoSelected(event: Event) {
  //   const file = (event.target as HTMLInputElement).files?.[0] ?? null;
  //   if (!file) return;
  //   this.videoFile = file;
  //   this.property.videoPreview = URL.createObjectURL(file);
  //   // reset input
  //   (event.target as HTMLInputElement).value = '';
  // }

  // allow changing the key for a photo
  updatePhotoKey(index: number, newKey: string) {
    if (!newKey || !newKey.trim()) return;
    this.property.photos[index].key = newKey.trim();
  }

  // remove a photo from the list (and revoke object URL)
  removePhoto(index: number) {
    const p = this.property.photos[index];
    if (p?.previewUrl && p.file) {
      URL.revokeObjectURL(p.previewUrl);
    }
    this.property.photos.splice(index, 1);
  }

  // Video handling (store File and preview)

  // Holds newly selected photo Files only (files to upload)
  newPhotos: File[] = [];

  // Holds existing server URLs for photos (strings) — when editing an existing property
  existingPhotoUrls: string[] = []; // populated on ngOnInit from propertySelected.photos if they're URLs

  // Single video file to upload (new)
  videoFile: File | null = null;

  // Build FormData and send to API. Each photo is appended with its key.
  submitForm() {
    // Combine all property details into a single object (not FormData)
    let payload :any = {
      propertyName: this.property.propertyName || '',
      address: this.property.address || '',
      googleMapUrl: this.property.googleMapUrl || '',
      owner: this.property.contact?.owner || '',
      phone: this.property.contact?.phone || '',
      email: this.property.contact?.email || '',
      type: this.property.type || '',
      details: this.property.details || '',
      facilities: this.property.facilities || [],
      price: this.property.price || '',
      purpose: this.property.purpose || '',
      buildingAge: this.property.buildingAge || '',
      status: this.property.status || '',
      photos: this.property.photos[0]
      // Uncomment if needed later
      // conditions: this.property.conditions || '',
      // postedOn: this.property.postedOn || ''
    };
    if(this.property.videos && this.property.videos.length > 0){
      payload['videos']= this.videos;
    }

    console.log('Payload:', payload);

    this.propertyService.postPropertyDetails(payload).subscribe({
      next: (response) => {
        console.log('✅ Property added successfully:', response);
      },
      error: (error) => {
        console.error('❌ Error adding property:', error);
      },
    });
  }

  // smaller helper if you wish to download/inspect a photo
  getPhotoDownloadUrl(photo: PhotoItem) {
    return photo.previewUrl || '';
  }
}
