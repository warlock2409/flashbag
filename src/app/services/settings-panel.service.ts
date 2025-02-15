import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsPanelService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  isOpen$ = this.isOpenSubject.asObservable();

  openPanel() {
    this.isOpenSubject.next(true);
  }

  closePanel() {
    this.isOpenSubject.next(false);
  }
} 