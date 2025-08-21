import { Component } from '@angular/core';

@Component({
  selector: 'app-bo-post-details',
  standalone: false,
  templateUrl: './bo-post-details.html',
  styleUrl: './bo-post-details.scss'
})
export class BoPostDetails {
showInfo: boolean = true;
  property: any = {
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

  onSubmit(form: any) {
    if (form.valid) {
      console.log('Property Data:', this.property);
      alert('Form Submitted Successfully!');
    }
  }
}
