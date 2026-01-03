import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-flash-vibe',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './flash-vibe.component.html',
  styleUrl: './flash-vibe.component.scss'
})
export class FlashVibeComponent {
  activeSetup: string | null = null;
  selectedTrigger: string = 'any';
  triggerWord: string = '';
  replyMessage: string = 'Thanks for your comment! Check your DM 😊';
  
  // Preview data
  previewComment: string = 'price?';
  previewReply: string = 'Hey! We\'ve sent you today\'s offer in DM 🎁';
  
  openSetup(feature: string) {
    this.activeSetup = feature;
    this.updatePreview();
  }
  
  closeSetup() {
    this.activeSetup = null;
  }
  
  activateAutomation() {
    // In a real app, this would activate the automation
    console.log('Activating automation with:', {
      trigger: this.selectedTrigger,
      triggerWord: this.triggerWord,
      replyMessage: this.replyMessage
    });
    
    // Show success message or update UI
    this.closeSetup();
  }
  
  updatePreview() {
    // Update preview based on selected trigger and reply message
    if (this.selectedTrigger === 'word' && this.triggerWord) {
      this.previewComment = this.triggerWord;
    } else {
      this.previewComment = 'price?';
    }
    
    this.previewReply = this.replyMessage;
  }
  
  onTriggerChange() {
    this.updatePreview();
  }
  
  onReplyMessageChange() {
    this.updatePreview();
  }
}
