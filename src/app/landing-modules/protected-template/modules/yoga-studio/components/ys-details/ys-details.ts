import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { YogaApiService } from '../../services/yoga-api-service';

@Component({
  selector: 'app-ys-details',
  standalone: false,
  templateUrl: './ys-details.html',
  styleUrl: './ys-details.scss'
})
export class YsDetails {
 businessForm: FormGroup;
  isEditMode = false;
  isPreviewOnly = false;

  // local previews
  logoPreview: string | null = null;
  photosPreview: string[] = [];
  videoPreview: string | null = null;

  // tags
  tags: string[] = [];
  tagInput = '';

  postedOn = new Date().toISOString().split('T')[0];

  // preview data
  previewData: any = {
    name: '',
    type: '',
    tagline: '',
    details: '',
    address: '',
    googleMapUrl: '',
    gstin: '',
    owner: '',
    phone: '',
    email: '',
    photos: [],
    tags: [],
    amenitiesSelected: [],
    postedOn: this.postedOn,
  };
  studioId: any = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private boApiService: YogaApiService,
    private cdr: ChangeDetectorRef
  ) {
    this.businessForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      tagline: [''],
      details: ['', [Validators.required]],
      address: ['', [Validators.required]],
      googleMapUrl: [''],
      gstin: [''],
      owner: [''],
      phone: [''],
      email: ['', [Validators.email]],
      amenities_parking: [false],
      amenities_wifi: [false],
      amenities_delivery: [false],
      amenities_dinein: [false],
    });

    // init previewData if you want some defaults
    this.loadDefaultsForPreview();
  }
  ngOnInit() {
    this.getData();
  }

  get f(): any {
    return this.businessForm.controls;
  }

  loadDefaultsForPreview() {
  
    this.previewData = {
      name: '',
      type: '',
      tagline: '',
      details:'',
      address: '',
      googleMapUrl: '',
      gstin: '',
      owner: '',
      phone: '',
      email: '',
      photos: [],
      tags: [],
      amenitiesSelected: [],
      postedOn: this.postedOn,
    };

    // populate form from preview default (optional)
    this.businessForm.patchValue({
      name: this.previewData.name,
      type: this.previewData.type,
      tagline: this.previewData.tagline,
      details: this.previewData.details,
      address: this.previewData.address,
      gstin: this.previewData.gstin,
      owner: this.previewData.owner,
      phone: this.previewData.phone,
      email: this.previewData.email,
    });
    if(this.previewData.tags){this.tags = [...this.previewData.tags]};
  }

  toggleEdit() {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.isPreviewOnly = false;
    }
  }

  togglePreviewOnly() {
    this.isPreviewOnly = !this.isPreviewOnly;
    if (this.isPreviewOnly) this.isEditMode = false;
  }

  onLogoSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    this.logoPreview = URL.createObjectURL(file);
  }

  onPhotosSelected(event: any) {
    const files = event.target.files;
    if (!files) return;
    for (let f of files) {
      this.photosPreview.push(URL.createObjectURL(f));
    }
  }

  onVideoSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    this.videoPreview = URL.createObjectURL(file);
  }

  addTag(event: any) {
    if (event?.preventDefault) event.preventDefault();
    const val = (this.tagInput || '').trim();
    if (!val) return;
    if (!this.tags.includes(val)) this.tags.push(val);
    this.tagInput = '';
  }

  removeTag(index: number) {
    this.tags.splice(index, 1);
  }

  resetForm() {
    this.businessForm.reset();
    this.logoPreview = null;
    this.photosPreview = [];
    this.videoPreview = null;
    this.tags = [];
  }

  onSubmit() {
    if (this.businessForm.invalid) {
      this.businessForm.markAllAsTouched();
      return;
    }

    const values = this.businessForm.value;
    // Build preview data
    let inputData :any = {
      name: values.name,
      type: values.type,
      tagline: values.tagline,
      details: values.details,
      address: values.address,
      googleMapUrl: values.googleMapUrl,
      gstin: values.gstin,
      owner: values.owner,
      phone: values.phone,
      email: values.email,
      photos: this.photosPreview,
      tags: this.tags,
      amenitiesSelected: this.getSelectedAmenities(values),
      postedOn: this.postedOn,
    };
    inputData['studioId'] = this.studioId;
    if(this.previewData?.isComplete){
        this.boApiService.putYogaStudioDetails(inputData).subscribe({
      next: (response: any) => {
        this.getData();
      },
      error: (error: any) => {
        console.error('❌ Error adding property:', error);
      },
    });
    }
    else{
  this.boApiService.postYogaStudioDetails(inputData).subscribe({
      next: (response: any) => {
          this.getData();
      },
      error: (error: any) => {
        console.error('❌ Error adding property:', error);
      },
    });
    }
  

    // Switch to preview
    this.isEditMode = false;
    this.isPreviewOnly = true;
  }
  getData() {
    this.isLoading = true;
    this.boApiService.getYogaStudioDetails().subscribe({
      next: (response: { data: { studioId: any; }; }) => {
        console.log('✅ Property added successfully:', response);
        this.isLoading = false;
        this.previewData = response.data;
        this.studioId = response.data.studioId
        this.businessForm.patchValue({
          name: this.previewData.name,
          type: this.previewData.type,
          tagline: this.previewData.tagline,
          details: this.previewData.details,
          address: this.previewData.address,
          gstin: this.previewData.gstin,
          owner: this.previewData.owner,
          phone: this.previewData.phone,
          email: this.previewData.email,
        });
        if(this.previewData.tags){this.tags = [...this.previewData.tags]};
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.isLoading = false;
         this.cdr.detectChanges();
        console.error('❌ Error adding property:', error);
      },
    });
  }

  getSelectedAmenities(values: any): string[] {
    const a: string[] = [];
    if (values.amenities_parking) a.push('Parking');
    if (values.amenities_wifi) a.push('WiFi');
    if (values.amenities_delivery) a.push('Home Delivery');
    if (values.amenities_dinein) a.push('Dine-in / On-site');
    return a;
  }

  editFromPreview() {
    // copy preview back to form for quick edit
    this.businessForm.patchValue({
      name: this.previewData.name,
      type: this.previewData.type,
      tagline: this.previewData.tagline,
      details: this.previewData.details,
      address: this.previewData.address,
      googleMapUrl: this.previewData.googleMapUrl,
      gstin: this.previewData.gstin,
      owner: this.previewData.owner,
      phone: this.previewData.phone,
      email: this.previewData.email,
    });

    // set amenities checkboxes
    this.businessForm.patchValue({
      amenities_parking: this.previewData.amenitiesSelected.includes('Parking'),
      amenities_wifi: this.previewData.amenitiesSelected.includes('WiFi'),
      amenities_delivery: this.previewData.amenitiesSelected.includes('Home Delivery'),
      amenities_dinein: this.previewData.amenitiesSelected.includes('Dine-in / On-site'),
    });

    // previews
    this.logoPreview = this.logoPreview;
    this.photosPreview = [...this.previewData.photos];
    this.videoPreview = this.videoPreview;

    this.tags = [...(this.previewData.tags || [])];

    this.isEditMode = true;
    this.isPreviewOnly = false;
  }

  // Convert a google map url into a safe embed url (simplified)
  safeMapUrl(url: string): SafeResourceUrl | null {
    if (!url) return null;
    // If user provided a maps "place" url or query url, try to convert to embed src.
    // For simplicity we just use the provided url inside an embed if it already contains "https://"
    let embed = url;
    // If it's a "maps.google.com/?q=" style link, construct an embed variant:
    if (url.includes('maps.google') || url.includes('www.google.com/maps')) {
      // Use the url itself (some google urls are embeddable)
      embed = url;
    } else {
      // fallback: use query param
      embed = url;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(embed);
  }
}

