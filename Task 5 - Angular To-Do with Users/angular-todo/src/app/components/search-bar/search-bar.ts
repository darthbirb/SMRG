import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  imports: [],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
  @Input() searchTerm: string = '';
  @Output() searchChange = new EventEmitter<string>();
  @Output() clearSearch = new EventEmitter<void>();

  protected readonly localSearchTerm = signal<string>('');

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.localSearchTerm.set(value);
    this.searchChange.emit(value);
  }

  protected onClearSearch(): void {
    this.localSearchTerm.set('');
    this.clearSearch.emit();
  }
}
