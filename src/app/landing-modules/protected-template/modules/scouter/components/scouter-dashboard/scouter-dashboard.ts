import { Component, signal } from '@angular/core';
import { ScouterRestapiService } from '../../services/scouter-restapi.service';

@Component({
  selector: 'app-scouter-dashboard',
  standalone: false,
  templateUrl: './scouter-dashboard.html',
  styleUrl: './scouter-dashboard.scss',
})
export class ScouterDashboard {
  constructor(private apiService: ScouterRestapiService){}
  landlords = signal<any[]>([
    // sample data to show structure — replace with API data
    {
      name: 'Suresh Kumar',
      phone: '9876543210',
      city: 'Bengaluru',
      property: '3BHK near MG Road',
      added: new Date(),
    },
    {
      name: 'Anita Devi',
      phone: '8765432109',
      city: 'Kochi',
      property: '2BHK near Vyttila',
      added: new Date(Date.now() - 86400000),
    },
  ]);

  activity = signal<any>([
    {
      type: 'added',
      title: 'Added landlord: Suresh Kumar',
      desc: 'Added to Real-Estate Group',
      date: new Date(),
    },
    {
      type: 'note',
      title: 'Reminder',
      desc: 'Follow up with Anita about listing photos',
      date: new Date(Date.now() - 7200000),
    },
  ]);
filteredLandlords() {
    if (!this.filter || !this.landlords) return this.landlords;
    const f = this.filter.toLowerCase();
    return this.landlords().filter(l =>
        (l.name && l.name.toLowerCase().includes(f)) ||
        (l.phone && l.phone.toLowerCase().includes(f)) ||
        (l.city && l.city.toLowerCase().includes(f))
    );
}
  // simple derived values
  get potentialIncome() {
    // 2.5% of an assumed lifetime transaction value per landlord — replace with real calc
    const estPerLandlord = 2000000; // example
    return this.landlords().length * estPerLandlord * 0.025;
  }

  get transactions() {
    return 0;
  }
  get referralBonus() {
    return 0;
  }

  filter = '';
  showAdd = false;
  newLandlord: any = { name: '', phone: '', city: '', property: '' };

  openAdd() {
    this.showAdd = true;
  }
  closeAdd() {
    this.showAdd = false;
    this.resetNew();
  }

  addLandlord() {
    let payload = { ...this.newLandlord, added: new Date() };
    this.landlords.set([...this.landlords(), payload]);

    // record activity
    this.activity.set([
      {
        type: 'added',
        title: `Added landlord: ${payload.name}`,
        desc: payload.property,
        date: new Date(),
      },
      ...this.activity(),
    ]);

    // reset + close
    payload = {
        "landlordName":this.newLandlord.name,
        "phone":this.newLandlord.phone,
        "city":this.newLandlord.city,
        "property":this.newLandlord.property
    }
    this.resetNew();
    this.showAdd = false;
    this.apiService.postClassified(payload).subscribe({
      next: (response) => {
        console.log('✅ Property added successfully:', response);
      },
      error: (error) => {
        console.error('❌ Error adding property:', error);
      },
    });
  
    // In a real app: call backend API to register the landlord to GCIBN group and persist
  }

  resetNew() {
    this.newLandlord = { name: '', phone: '', city: '', property: '' };
  }

copyGroupLink(l: any) {
const details = `Landlord Name: ${l.name}\nPhone: ${l.phone}\nCity: ${l.city}\nProperty: ${l.property}\nAdded On: ${new Date(l.added).toLocaleDateString()}`;
navigator.clipboard?.writeText(details);
alert('Landlord details copied to clipboard');
}

  initials(name: string) {
    if (!name) return 'G';
    return name
      .split(' ')
      .map((s) => s[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  avatarColor(name: string) {
    // pick a color from palette using a simple hash
    const colors = ['#115930', '#C7D943', '#F2C438', '#F2D479', '#0D0D0D'];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h << 5) - h + name.charCodeAt(i);
    return colors[Math.abs(h) % colors.length];
  }
}
