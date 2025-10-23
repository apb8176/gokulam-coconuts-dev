import { Component } from '@angular/core';

@Component({
  selector: 'app-ys-profile',
  standalone: false,
  templateUrl: './ys-profile.html',
  styleUrl: './ys-profile.scss'
})
export class YsProfile {


structuredClone(arg0: any) {
  this.original = JSON.parse(JSON.stringify(arg0));

}
  // sample user JSON
user :any= {
  firstName: 'Ananya',
  lastName: 'Iyer',
  phoneNumber: '+91 99458 32107',
  whatsappNumber: '+91 99458 32107',
  email: 'ananya@gokulamyoga.com',
  website: 'https://gokulamyoga.com',
  dob: '1988-05-22',
  gender: 'female', // 'male' | 'female' | 'other'
  localAddress: '45 Temple Street, Gokulam, Mysore, Karnataka',
  permanentAddress: '45 Temple Street, Gokulam, Mysore, Karnataka',
  pinCode: '570002',
  citizenship: 'Indian',
  citizenshipOther: '',
  designation: 'Yoga Studio Owner & Instructor'
};

  // copy to revert on cancel
original:any;;

  // per-field edit state
  edit: any = {
    whatsappNumber: false,
    website: false,
    localAddress: false,
    permanentAddress: false,
    pinCode: false,
    citizenship: false,
    citizenshipOther: false,
    designation: false,
  };

  // toggle edit for a field
  toggleEdit(field: string) {
    // if toggling on, make sure original copy is updated
    if (!this.edit[field]) this.original = structuredClone(this.user);
    this.edit[field] = !this.edit[field];
  }

  // save single field (just closes edit mode; in real app call API)
  saveField(field: string) {
    // Ideally call API here to persist single-field change
    this.edit[field] = false;
    this.original = structuredClone(this.user);
  }

  // cancel single-field edit and revert
  cancelField(field: string) {
    this.user[field] = this.original[field];
    // if citizenshipOther, revert the linked value as well
    if (field === 'citizenship') {
      this.user.citizenshipOther = this.original.citizenshipOther;
    }
    this.edit[field] = false;
  }

  // helper to check if a field is editable
  isEditable(field: string) {
    return Object.prototype.hasOwnProperty.call(this.edit, field);
  }
}
