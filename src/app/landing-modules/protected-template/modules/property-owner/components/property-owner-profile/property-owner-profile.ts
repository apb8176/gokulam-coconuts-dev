import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'property-owner-profile',
  standalone: false,
  templateUrl: './property-owner-profile.html',
  styleUrl: './property-owner-profile.scss'
})
export class PropertyOwnerProfile {
structuredClone(arg0: any) {
  this.original = JSON.parse(JSON.stringify(arg0));

}
  // sample user JSON
  user:any = {
    firstName: 'Neeraj',
    lastName: 'R',
    phoneNumber: '+91 98765 43210',
    whatsappNumber: '+91 98765 43210',
    email: 'neeraj@example.com',
    website: 'https://example.com',
    dob: '1990-07-15',
    gender: 'male', // 'male' | 'female' | 'other'
    localAddress: '12 Palm Street, Mysore, Karnataka',
    permanentAddress: '12 Palm Street, Mysore, Karnataka',
    pinCode: '570001',
    citizenship: 'Indian', // or 'Other'
    citizenshipOther: '',
    designation: 'Property Owner'
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
