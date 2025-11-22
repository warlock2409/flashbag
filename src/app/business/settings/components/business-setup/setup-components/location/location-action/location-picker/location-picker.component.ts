import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, OnDestroy, Inject, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import * as L from 'leaflet';

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule
  ],
  template: `
    <div class="location-picker-dialog">
      <!-- Dialog Header -->
      <div class="dialog-header">
        <h2>Select Location</h2>
        <button mat-icon-button (click)="closeDialog()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
    
      
      <!-- Map Container -->
      <div class="map-container">
        <div id="map"></div>
      </div>
      
      <!-- Coordinates Display -->
      <div class="coordinates-display">
        <div class="coordinate-item">
          <label>Latitude:</label>
          <span>{{ selectedLat | number:'1.6-6' }}</span>
        </div>
        <div class="coordinate-item">
          <label>Longitude:</label>
          <span>{{ selectedLng | number:'1.6-6' }}</span>
        </div>
      </div>
      
      <!-- Dialog Actions -->
      <div class="dialog-actions">
        <button mat-stroked-button (click)="detectUserLocation()" [disabled]="isDetectingLocation || isSearching">
          <span *ngIf="!isDetectingLocation">Detect My Location</span>
          <span *ngIf="isDetectingLocation">Detecting...</span>
        </button>
        <div class="spacer"></div>
        <button mat-stroked-button (click)="closeDialog()">Cancel</button>
        <button mat-flat-button color="primary" (click)="selectLocation()" 
                [disabled]="!selectedLat || !selectedLng">
          Use this location
        </button>
      </div>
    </div>
  `,
  styles: [`
    .location-picker-dialog {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      max-width: 800px;
      background-color: white;
    }
    
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .dialog-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
    
    .search-container {
      padding: 16px 24px 8px 24px;
    }
    
    .search-field {
      width: 100%;
    }
    
    .address-actions {
      margin-top: 12px;
    }
    
    .map-container {
      flex: 1;
      min-height: 200px;
      position: relative;
    }
    
    #map {
      height: 100%;
      width: 100%;
      background-color: #f5f5f5;
    }
    
    .coordinates-display {
      display: flex;
      padding: 16px 24px;
      background-color: #f9f9f9;
      border-top: 1px solid #e0e0e0;
      gap: 24px;
    }
    
    .coordinate-item {
      display: flex;
      flex-direction: column;
    }
    
    .coordinate-item label {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }
    
    .coordinate-item span {
      font-size: 14px;
      font-weight: 500;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
    }
    
    .spacer {
      flex: 1;
    }
    
    @media (max-width: 768px) {
      .coordinates-display {
        flex-direction: column;
        gap: 8px;
      }
      
      .dialog-header {
        padding: 12px 16px;
      }
      
      .search-container {
        padding: 12px 16px 8px 16px;
      }
      
      .dialog-actions {
        padding: 12px 16px;
        flex-wrap: wrap;
      }
      
      .dialog-actions button {
        flex: 1;
        min-width: 100px;
      }
    }
  `]
})
export class LocationPickerComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedLat: number | null = null;
  selectedLng: number | null = null;
  searchQuery: string = '';
  isDetectingLocation = false;
  isSearching = false;
  private map: any;
  private marker: any;
  private mapInitialized = false;

  constructor(
    private dialogRef: MatDialogRef<LocationPickerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(data,"LocationPickerComponent");
    
  }

  ngOnInit(): void {
    // Initialize with provided coordinates if available
    if (this.data && this.data.latitude && this.data.longitude) {
      this.selectedLat = parseFloat(this.data.latitude);
      this.selectedLng = parseFloat(this.data.longitude);
    }
  }

  ngAfterViewInit(): void {
    // Initialize map after view is ready
    setTimeout(() => {
      this.initializeMap();
      // Try to detect user location after map is initialized if no coordinates provided
      if ((!this.selectedLat || !this.selectedLng) && !this.isDetectingLocation) {
        // If we have address data, try to use it as default
        if (this.hasAddressData()) {
          this.useAddressLocation();
        } else {
          this.detectUserLocation();
        }
      }
    }, 100);
  }

  // Listen for window resize events to adjust map size
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.resizeMap();
  }

  // Listen for dialog resize events
  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  onFullScreenChange(event: any) {
    setTimeout(() => {
      this.resizeMap();
    }, 100);
  }

  private resizeMap(): void {
    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    }
  }

  hasAddressData(): boolean {
    return this.data && (
      this.data.addressLine1 || 
      this.data.addressLine2 || 
      this.data.city || 
      this.data.state || 
      this.data.country
    );
  }

  useAddressLocation(): void {
    if (!this.hasAddressData()) {
      return;
    }

    this.isSearching = true;
    
    // Build address string from available data
    const addressParts = [
      this.data.addressLine1,
      this.data.addressLine2,
      this.data.city,
      this.data.state,
      this.data.country
    ].filter(part => part); // Remove empty parts
    
    const addressString = addressParts.join(', ');
    this.searchQuery = addressString;
    
    // Use the existing search functionality
    this.searchLocationByAddress(addressString);
  }

  private searchLocationByAddress(address: string): void {
    if (!address.trim()) {
      this.isSearching = false;
      return;
    }
    
    // Using Nominatim API for geocoding (OpenStreetMap's search service)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    
    fetch(url)
      .then(response => response.json())
      .then(results => {
        if (results && results.length > 0) {
          const result = results[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          this.centerMap(lat, lng);
        } else {
          alert('Address location not found. Please try searching manually.');
        }
        this.isSearching = false;
      })
      .catch(error => {
        console.error('Search error:', error);
        alert('Error searching for address location. Please try again.');
        this.isSearching = false;
      });
  }

  searchLocation(): void {
    if (!this.searchQuery.trim()) {
      return;
    }
    
    this.isSearching = true;
    
    // Using Nominatim API for geocoding (OpenStreetMap's search service)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}&limit=1`;
    
    fetch(url)
      .then(response => response.json())
      .then(results => {
        if (results && results.length > 0) {
          const result = results[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          this.centerMap(lat, lng);
        } else {
          alert('Location not found. Please try a different search term.');
        }
        this.isSearching = false;
      })
      .catch(error => {
        console.error('Search error:', error);
        alert('Error searching for location. Please try again.');
        this.isSearching = false;
      });
  }

  private initializeMap(): void {
    if (this.mapInitialized) {
      return;
    }
    
    try {
      // Fix for default marker icons in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.error('Map container not found');
        return;
      }
      
      // Set default coordinates (New Delhi, India) if none provided
      const defaultLat = this.selectedLat || 28.6139;
      const defaultLng = this.selectedLng || 77.2090;
      
      this.map = L.map('map', {
        center: [defaultLat, defaultLng],
        zoom: 13,
        zoomControl: true
      });
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(this.map);
      
      this.map.on('click', (e: any) => {
        this.onMapClick(e.latlng);
      });
      
      if (this.selectedLat && this.selectedLng) {
        this.addMarker(this.selectedLat, this.selectedLng);
      }
      
      this.mapInitialized = true;
      
      // Add a small delay to ensure the map container has proper dimensions
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 300);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  detectUserLocation(): void {
    this.isDetectingLocation = true;
    
    // Try browser geolocation first as it's more accurate
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.centerMap(lat, lng);
          this.isDetectingLocation = false;
        },
        (error) => {
          console.error('Browser geolocation error:', error);
          // Fallback to IP-based geolocation
          this.getLocationFromIP()
            .then(location => {
              if (location) {
                this.centerMap(location.lat, location.lng);
              }
              this.isDetectingLocation = false;
            })
            .catch(() => {
              this.isDetectingLocation = false;
            });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 600000
        }
      );
    } else {
      // Fallback to IP-based geolocation if browser doesn't support geolocation
      this.getLocationFromIP()
        .then(location => {
          if (location) {
            this.centerMap(location.lat, location.lng);
          }
          this.isDetectingLocation = false;
        })
        .catch(() => {
          this.isDetectingLocation = false;
        });
    }
  }

  private getLocationFromIP(): Promise<{lat: number, lng: number} | null> {
    // First try ipapi.co
    return this.fetchLocationFromService('https://ipapi.co/json/')
      .then(result => {
        if (result) return result;
        // If first service fails, try ip-api.com
        return this.fetchLocationFromService('http://ip-api.com/json/');
      })
      .catch(() => {
        // If both services fail, try ip-api.com as final fallback
        return this.fetchLocationFromService('http://ip-api.com/json/');
      });
  }

  private fetchLocationFromService(url: string): Promise<{lat: number, lng: number} | null> {
    return new Promise((resolve) => {
      // Set a timeout for the request
      const timeout = setTimeout(() => {
        resolve(null);
      }, 8000);
      
      fetch(url)
        .then(response => {
          clearTimeout(timeout);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          let lat, lng;
          
          // Handle different response formats
          if (data.latitude && data.longitude) {
            lat = parseFloat(data.latitude);
            lng = parseFloat(data.longitude);
          } else if (data.lat && data.lon) {
            lat = parseFloat(data.lat);
            lng = parseFloat(data.lon);
          } else if (data.loc) {
            // Handle ipinfo.io format
            const [latStr, lngStr] = data.loc.split(',');
            if (latStr && lngStr) {
              lat = parseFloat(latStr);
              lng = parseFloat(lngStr);
            }
          }
          
          if (lat && lng) {
            resolve({ lat, lng });
          } else {
            resolve(null);
          }
        })
        .catch(error => {
          clearTimeout(timeout);
          console.error(`Error fetching from ${url}:`, error);
          resolve(null);
        });
    });
  }

  private centerMap(lat: number, lng: number): void {
    this.selectedLat = lat;
    this.selectedLng = lng;
    
    if (this.map) {
      this.map.setView([lat, lng], 15);
      if (this.marker) {
        this.marker.setLatLng([lat, lng]);
      } else {
        this.addMarker(lat, lng);
      }
      // Ensure map resizes properly after centering
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    }
  }

  private onMapClick(latlng: any): void {
    this.selectedLat = latlng.lat;
    this.selectedLng = latlng.lng;
    
    if (this.marker) {
      this.marker.setLatLng(latlng);
    } else {
      this.addMarker(latlng.lat, latlng.lng);
    }
  }

  private addMarker(lat: number, lng: number): void {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
    
    this.marker = L.marker([lat, lng], {
      draggable: true
    }).addTo(this.map);
    
    this.marker.on('dragend', (e: any) => {
      const position = e.target.getLatLng();
      this.selectedLat = position.lat;
      this.selectedLng = position.lng;
    });
  }

  selectLocation(): void {
    if (this.selectedLat && this.selectedLng) {
      this.dialogRef.close({
        latitude: this.selectedLat,
        longitude: this.selectedLng
      });
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
  
  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
      this.mapInitialized = false;
    }
  }
}