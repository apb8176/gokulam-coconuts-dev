import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-bo-post-details',
  standalone: false,
  templateUrl: './bo-post-details.html',
  styleUrl: './bo-post-details.scss'
})
export class BoPostDetails {
   @Input() propertySelected: any = {
    propertyName: "Luxury 2BHK Apartment",
    address: "123 Palm Street, Mysore, Karnataka",
    googleMapUrl: "https://maps.google.com/?q=123+Palm+Street+Mysore",
    contact: {
      owner: "John Doe",
      phone: "+91 98765 43210",
      email: "john@example.com"
    },
    type: "Apartment",
    details: "2BHK, 1200 sqft, Semi-Furnished",
    facilities: ["Lift", "24x7 Water", "Security", "Parking", "Power Backup"],
    price: "₹ 25,000 / month",
    purpose: "Rent",
    photos: [
      "../../../../assets/kitchen.jpg",
      "../../../../assets/bedroom.png"
    ],
    video: "assets/ovt.mp4",
    buildingAge: "5 years",
    status: "Available",
    conditions: "No pets allowed. 3-month deposit.",
    postedOn: "2025-09-25"
  };

showInfo: boolean = true;
 propertys: any = {
    type: '',
    address: '',
    location: '',
    ownerName: '',
    contact: '',
    price: '',
    maintenance: '',
    advance: '',
    size: '',
    bhk: '',
    startDate: '',
    age: '',
    amenities: {
      parking: false,
      water: false,
      lift: false,
      power: false,
      security: false,
      gym: false
    }
  };
isEditMode = false;

  property: any = {
    propertyName: "",
    address: "",
    googleMapUrl: "",
    contact: { owner: "", phone: "", email: "" },
    type: "",
    details: "",
    facilities: [],
    price: "",
    purpose: "",
    photos: [],
    video: "",
    buildingAge: "",
    status: "",
    conditions: "",
    postedOn: new Date().toISOString().split('T')[0],
  };

  facilityInput = "";

  toggleEdit() {
    this.isEditMode = !this.isEditMode;
  }

  addFacility() {
    if (this.facilityInput.trim()) {
      this.property.facilities.push(this.facilityInput.trim());
      this.facilityInput = "";
    }
  }

  removeFacility(index: number) {
    this.property.facilities.splice(index, 1);
  }

  onPhotoSelected(event: any) {
    const files = event.target.files;
    for (let file of files) {
      this.property.photos.push(URL.createObjectURL(file));
    }
  }

  onVideoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.property.video = URL.createObjectURL(file);
    }
  }

  submitForm() {
    // In real app: call API to save property details
    this.isEditMode = false; // Switch back to preview mode
  }
//   onSubmit(form: any) {
//     if (form.valid) {
//       console.log('Property Data:', this.property);
//       alert('Form Submitted Successfully!');
//     }
//   }
// }
}