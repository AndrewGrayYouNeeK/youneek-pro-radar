# YouNeeKProRadar

A personal, military-style PPI radar simulator for iOS—think tactical scope meets storm tracking. Drop manual targets, watch the sweep spin, and get real tornado warnings with an "I'm Safe" ping button. Built in Swift with WeatherKit for live alerts. Quiet mode keeps it stealthy (dog-approved). (https://img.shields.io/badge/Swift-5.9-orange.svg?style=flat)](https://swift.org) (https://img.shields.io/badge/iOS-16%2B-blue.svg?style=flat)](https://developer.apple.com/ios/) (https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Authentic PPI Scope**: Rotating green sweep, range rings, bearing lines—classic radar glow on black.
- **Manual Targets**: Tap to drop blips—red hostile, blue friendly, yellow unknown. Drag, label, set threat levels.
- **WeatherKit Integration**: Pulls live tornado warnings → flashes "I'm Safe" button. Tap to text/call your crew with GPS.
- **Stealth Mode**: Mute sounds, dim screen—perfect for quiet ops (or napping pups).
- **Location-Based**: Uses CoreLocation for alerts—no manual zip codes.
- **Dark Theme Only**: No bright bullshit—just phosphor green on void.

## Screenshots

<img src="images/radar-sweep.gif" width="300" alt="PPI scope with rotating sweep and manual blips">  
<img src="images/im-safe-button.png" width="300" alt="Tornado warning: 'I'm Safe' button glowing green">  
<img src="images/target-drop.png" width="300" alt="Dropping a custom target on the scope">

(Pro tip: Upload your own GIFs/screenshots—make the sweep loop for max hype.)

## Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/YouNeeKProRadar.git
2.  Open in Xcode (needs iOS 16+).
3.  Sign in with your Apple ID → enable WeatherKit in Capabilities.
4.  Run on device/simulator—grant location perms.
Usage
•  Swipe for bearings, pinch to zoom.
•  Tap screen → add target (hold for edit).
•  During warnings: “I’m Safe” pops—tap to notify contacts.
•  Toggle silent: Top-right kill-switch (red when active).
Tech Stack
•  Swift / SwiftUI (mostly UIKit for radar perf)
•  WeatherKit (Apple’s API—500k free calls/mo)
•  CoreLocation for GPS
•  No third-party deps—pure Apple.
Why This Exists
Built for fun: simulate radar while tracking real storms. No ads, no tracking—just you, your dog, and a glowing scope.
Contributing
Pull requests welcome—especially if you wanna add phased-array sim or ECM jamming mode.
License
MIT—do whatever. Just credit if you fork.