import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Observable, startWith, map } from 'rxjs';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-business-setup',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,MatButtonModule,MatSidenavModule,NzButtonModule
  ],
  templateUrl: './business-setup.component.html',
  styleUrl: './business-setup.component.scss'
})
export class BusinessSetupComponent {
  businessControl = new FormControl('');
  options: string[] = ['One', 'Two', 'Three'];

  filteredOptions!: Observable<string[]>;

  ngOnInit() {
    this.filteredOptions = this.businessControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }


  showFiller = true;
}
