import { Component } from '@angular/core';

@Component({
  selector: 'app-entity-details',
  standalone: false,
  templateUrl: './entity-details.html',
  styleUrl: './entity-details.scss'
})
export class EntityDetails {
searchText = '';
  selectedItem: any = null;

  items = [
    {
      id: 1,
      title: 'Project Alpha',
      subtitle: 'Ongoing Initiative',
      description: 'Project Alpha focuses on sustainable energy and AI integration.',
      details: [
        { name: 'Status', info: 'In Progress' },
        { name: 'Team Size', info: '8 Members' },
        { name: 'Deadline', info: 'June 2025' },
      ],
    },
    {
      id: 2,
      title: 'Green Horizon',
      subtitle: 'Environmental Project',
      description: 'A collaborative effort towards zero emissions by 2030.',
      details: [
        { name: 'Status', info: 'Completed' },
        { name: 'Budget', info: '$2 Million' },
        { name: 'Partners', info: 'UN, WHO' },
      ],
    },
    {
      id: 3,
      title: 'Solar Shift',
      subtitle: 'Energy Transformation',
      description: 'Transitioning industrial units to solar-based operations.',
      details: [
        { name: 'Status', info: 'Planning Phase' },
        { name: 'Lead', info: 'Energy Department' },
        { name: 'Launch', info: 'Dec 2025' },
      ],
    },
  ];

  filteredItems = [...this.items];

  filterItems() {
    const term = this.searchText.toLowerCase();
    this.filteredItems = this.items.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.subtitle.toLowerCase().includes(term)
    );
  }

  selectItem(item: any) {
    this.selectedItem = item;
  }
}
