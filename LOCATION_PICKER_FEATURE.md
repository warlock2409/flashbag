# Location Picker Feature

## Overview
This feature adds a location picker using OpenStreetMap to the shop creation/editing form. Users can visually select a location on a map instead of manually entering latitude and longitude coordinates.

## Implementation Details

### Components
1. **LocationPickerDialogComponent** - A standalone dialog component that displays an OpenStreetMap interface
2. **Integration in ShopActionsComponent** - Added a button that opens the location picker dialog

### Files Modified
1. `shop-actions.component.html` - Added a button below the latitude/longitude fields
2. `shop-actions.component.ts` - Added the LocationPickerDialogComponent and integration logic
3. `shop-actions.component.scss` - Added CSS for proper map display

### How It Works
1. User clicks the "Select Location on Map" button below the latitude and longitude fields
2. A dialog opens with an OpenStreetMap interface
3. User can click on the map to select a location or drag an existing marker
4. Selected coordinates are displayed in real-time
5. User clicks "Use this location" to apply the coordinates to the form

### Dependencies
- Leaflet.js (for map rendering)
- OpenStreetMap (map tiles)

### Usage
The feature is automatically available in the shop creation/editing form. No additional setup is required.

### Future Improvements
1. Add search functionality to find locations by address
2. Add ability to switch between different map providers
3. Improve mobile responsiveness
4. Add geolocation detection to automatically center on user's location