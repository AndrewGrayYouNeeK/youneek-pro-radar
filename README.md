# YouNeeK Pro Radar

A military-style NEXRAD radar and severe weather tracker — built for real storm chasers and weather enthusiasts.

## About

YouNeeK Pro Radar is a professional-grade weather radar application featuring live NEXRAD base reflectivity mosaics, NWS severe weather alert overlays, NOAA weather radio streaming, and an emergency shelter alert system. Designed to look like a tactical PPI scope with a dark, phosphor-green aesthetic.

## Features

- **Live NEXRAD Radar** — Iowa Mesonet base reflectivity mosaics, auto-refreshing every 5 minutes
- **NWS Alert Overlays** — Real-time GeoJSON polygons for:
  - 🔴 Tornado Warnings
  - 🟠 Severe Thunderstorm Warnings
  - 🔵 Flood Warnings
  - ❄️ Winter Storm Advisories
- **NOAA Weather Radio** — 130 stations nationwide with auto-select by GPS location
- **I'M SHELTERING Button** — One-tap emergency SMS to up to 5 contacts with GPS coordinates and Google Maps link
- **Dark Tactical UI** — PPI scope aesthetic, phosphor on black

## Running Locally

```bash
git clone https://github.com/AndrewGrayYouNeeK/youneek-pro-radar.git
cd youneek-pro-radar
npm install
npm run dev
```

No API keys required — uses Iowa Mesonet public tiles and NWS public GeoJSON endpoints.

## Data Sources

- **Radar:** [Iowa Environmental Mesonet](https://mesonet.agron.iastate.edu) — NEXRAD mosaics
- **Alerts:** [NWS Weather API](https://api.weather.gov) — Active polygon warnings
- **Radio:** NOAA Weather Radio station list (130 stations)

## Tech Stack

- React + Vite
- Leaflet.js for map rendering
- Iowa Mesonet XYZ tiles for radar
- NWS GeoJSON API for live alerts
- `sms:` URI scheme for emergency contacts
- PWA-ready with multi-device icon support

## Development

### Regenerating Icons

If you modify `public/icon.svg`, regenerate the PWA icons with:

```bash
npm run generate-icons
```

This creates PNG icons in sizes: 16×16, 32×32, 180×180 (Apple), 192×192, 512×512, and favicon.ico.

## Built By

Andrew Gray — YouNeeK
