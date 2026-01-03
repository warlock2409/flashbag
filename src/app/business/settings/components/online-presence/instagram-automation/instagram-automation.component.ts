import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FlashVibeComponent } from './components/flash-vibe/flash-vibe.component';

@Component({
  selector: 'app-instagram-automation',
  standalone: true,
  imports: [CommonModule, FlashVibeComponent],
  templateUrl: './instagram-automation.component.html',
  styleUrl: './instagram-automation.component.scss'
})
export class InstagramAutomationComponent implements OnInit {
  isConnected: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Check if user has already connected Instagram
    this.checkConnectionStatus();
  }

  checkConnectionStatus() {
    // In a real app, this would check with the backend
    // For now, we'll check a localStorage flag
    this.isConnected = localStorage.getItem('instagram_connected') === 'true';
    console.log('Instagram connection status:', this.isConnected);
    
    // If connected, show the dashboard immediately
    if (this.isConnected) {
      // Optionally navigate to the flash-vibe route
      this.router.navigate(['/business/settings/insta-automate/flash-vibe'], { replaceUrl: true });
    }
  }

  connectToInstagram() {
    const instagramAuthUrl = 'https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=1901509340461903&redirect_uri=https://9myle.pages.dev/business/settings&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights&state=12345';
    
    // Open the Instagram authorization URL in a new window/tab
    // Calculate window position to center it on screen
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const windowWidth = 600;
    const windowHeight = 800;
    
    const left = (screenWidth - windowWidth) / 2;
    const top = (screenHeight - windowHeight) / 2;
    
    // Open the Instagram authorization URL in a centered popup window
    const windowFeatures = `width=${windowWidth},height=${windowHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`;
    
    // Set connection flag to true immediately
    localStorage.setItem('instagram_connected', 'true');
    
    // Open the Instagram authorization URL in a centered popup window
    const authWindow = window.open(instagramAuthUrl, 'instagram_auth', windowFeatures);
    
    // Check for window closing and redirect to dashboard
    if (authWindow) {
      const checkClosed = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(checkClosed);
          // Redirect to FlashVibe dashboard after successful connection
          this.router.navigate(['/business/settings/insta-automate/flash-vibe']);
        }
      }, 1000);
    }
  }
}
