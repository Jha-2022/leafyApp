# 🌿 Leafy - AI Plant Care & Real-Time Botanical Companion

**Leafy** (Grass_project1) is a modern, cross-platform mobile application built with **React Native** and **Expo (SDK 57)**. It combines the conversational intelligence of **Google Gemini AI**, real-time **atmospheric meteorological weather intelligence**, and a comprehensive **botanical care management system** to help users nurture healthy, flourishing plants.

---

## 🌟 Key Features

### 1. 🤖 Conversational Plant Chatbots (Roleplaying AI)
- **Talk Directly to Your Living Plants**: Every plant in your library features an interactive **Chat** button.
- **First-Person Roleplay Personas**: Instructs Google Gemini to speak in-character as the selected houseplant (e.g., Monstera Deliciosa, Snake Plant, Peace Lily) discussing its thirst levels, sun needs, and leaf health.
- **Schedule-Aware Dialogues**: Plants reference their upcoming watering date and specific care instructions during conversation.
- **Weather-Aware Responses**: Plants receive real-time temperature and atmospheric humidity updates, weaving current environmental conditions naturally into their responses.

### 2. 💬 General Gemini AI Assistant
- **Plant Care & Botany Expert**: Ask general botanical questions, diagnosis advice for yellowing leaves, pest treatments, or everyday questions.
- **Rich Markdown Formatting (`FormattedMessage`)**:
  - Replaces raw asterisks and markdown symbols with clean typography.
  - Native support for **bold text**, `# headers`, `• bullet points`, numbered lists, and styled `inline code` / ````code blocks````.
- **Time-Based Dynamic Greetings**: Automatically displays custom greetings (*Good morning*, *Good afternoon*, *Good evening*) aligned with the current time of day.
- **In-App API Key Manager**: Switch or update your Google AI Studio API key at any time directly through the UI header.

### 3. 🌤️ Real-Time Weather & Botanical Advisory Engine
- **Zero-Key Meteorological Data**: Powered by the **Open-Meteo API** and **GeoJS IP Geolocation**—operates out of the box with zero weather API keys required.
- **Live Environmental Metrics**:
  - Real-time temperature (°C) & "feels like" apparent temperature.
  - Relative humidity (%) & precipitation rate (mm).
  - Wind speed (km/h) & day/night status with dynamic icons (☀️, 🌙, ⛅, 🌧️, ⛈️, ❄️).
- **Automated Botanical Care Advisories**: Dynamically evaluates current temperature and humidity thresholds to recommend actions (e.g., misting during low humidity, heat wave protection, or reducing watering during cold snaps).
- **Interactive Weather Widget**: Compact top-bar widget with live clock ticker (🕒), humidity badge (💧), and an expandable detailed weather modal.
- **City Switcher**: Choose from predefined world climates (Mumbai, Delhi, Bengaluru, London, New York, Tokyo, Sydney, Singapore, Paris, Cairo) or use automatic GPS/IP geolocation.

### 4. 📚 Interactive Plant Library & Watering Schedules
- **Curated Plant Catalog**: Comprehensive profiles for popular houseplants with scientific names, light, soil, watering frequency, and pet toxicity indicators.
- **📅 Watering Calendar Reminders**: Every card displays the calculated next watering date and time (e.g., *"Tomorrow at 09:30 AM"*).
- **Pet Safety Badges**: Instant visual identification for pet-safe vs. toxic plants (🐾).
- **Deep-Dive Care Modal**: Tap any plant card to view detailed care instructions, potting soil blends, propagation tips, and lighting guidelines.

### 5. ⚙️ Plant Management & Customization (Settings)
- **Add New Plants**: Create and add custom houseplants with personalized names, scientific classifications, emoji icons, water schedules, and soil descriptions.
- **Edit Existing Plants**: Modify any plant card's properties (watering schedule, lighting, toxicity) with changes updating live in the Plant Library.
- **Delete & Reset**: Remove plants or reset the entire collection back to the default botanical database with one tap.
- **Environment Status Panel**: Monitor live weather conditions and change your location directly from Settings.

### 6. 📱 Polished Mobile Experience
- **Auto-Hiding Navigation Bar**: Automatically hides the Android system navigation bar (`expo-navigation-bar`) when not in use for an immersive edge-to-edge experience.
- **Slide-Out Animated Sidebar**: Smooth animated drawer navigation with swipe-to-close gestures.
- **Keyboard-Aware Layout**: Prevents UI clipping and scrolls chat messages automatically when typing.

---

## 📁 Project Directory Structure

```text
Grass_project1/
├── assets/                         # Application branding and icon assets
│   ├── icon.png                    # Primary application icon
│   ├── splash-icon.png             # Splash launch screen image
│   ├── favicon.png                 # Web favicon
│   └── android-icon-*.png          # Android adaptive foreground & background assets
│
├── backend/                        # API services and integration logic
│   ├── config.js                   # Gemini API endpoint & model configuration
│   ├── geminiService.js            # Google Gemini AI fetcher & response parser
│   ├── weatherService.js           # Open-Meteo & GeoJS live weather service
│   └── index.js                    # Unified backend service exports
│
├── src/                            # Source components and application logic
│   ├── components/                 # Reusable UI components & screen views
│   │   ├── FormattedMessage.js     # Markdown & typography rendering component
│   │   ├── PlantLibrary.js         # Plant catalog, watering schedule & detail modal
│   │   ├── Settings.js             # Plant CRUD manager & environment panel
│   │   └── WeatherWidget.js        # Real-time weather bar & atmospheric modal
│   ├── features/                   # Modular domain logic (plant care & DB hooks)
│   ├── theme/                      # Styling tokens, color palette, and constants
│   └── utils/                      # Helper utilities and formatters
│
├── App.js                          # Root application component & state coordinator
├── app.json                        # Expo application manifest & native plugin config
├── index.js                        # Registered application entry point
├── package.json                    # Project metadata, dependencies, and scripts
└── README.md                       # Complete project documentation
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (SDK 57) |
| **Language** | JavaScript (ESNext / JSX) |
| **AI Engine** | [Google Gemini API](https://ai.google.dev/) (`gemini-flash-latest`) |
| **Weather Service** | [Open-Meteo API](https://open-meteo.com/) (Free, zero-key meteorological service) |
| **Geolocation** | [GeoJS IP Geolocation](https://www.geojs.io/) |
| **Native Controls** | `expo-navigation-bar`, `expo-status-bar`, `expo-haptics` |
| **Storage / Data** | `expo-sqlite`, `expo-file-system` |

---

## 🚀 Getting Started

### Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (version 18 or newer)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- [Expo Go](https://expo.dev/go) app installed on your physical mobile device (Android/iOS), or an Android/iOS emulator.

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Grass_project1
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

4. **Run on your device:**
   - **Android Device / Emulator**: Press `a` in the terminal or scan the QR code using Expo Go.
   - **iOS Simulator / Device**: Press `i` in the terminal or scan using the Camera app.
   - **Web Browser**: Press `w` in the terminal to run in your desktop browser.

---

## 🔑 Configuration

### Google Gemini API Key
The application connects to Google's Gemini models for both general advice and interactive plant roleplay.

1. Obtain a free API key at [Google AI Studio](https://aistudio.google.com/).
2. You can provide the API key in two ways:
   - **Directly in App**: Tap the **🔑 Key** button in the header bar and paste your key.
   - **In Source Code**: Open [`backend/config.js`](file:///d:/HacktoberFest2027/Grass_project1/backend/config.js) and update `DEFAULT_API_KEY`:
     ```javascript
     export const GEMINI_CONFIG = {
       BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
       DEFAULT_MODEL: 'gemini-flash-latest',
       DEFAULT_API_KEY: 'YOUR_GEMINI_API_KEY_HERE',
     };
     ```

### Weather & Geolocation
No API keys or tokens are needed. Weather requests automatically query the Open-Meteo public endpoints with IP-based fallback to your local city.

---

## 🧪 Available Scripts

In the project root, you can run:

- `npm start` or `npx expo start`: Launches the Expo development server and interactive terminal UI.
- `npm run android` or `npx expo start --android`: Launches on an attached Android emulator or device.
- `npm run ios` or `npx expo start --ios`: Launches on an iOS Simulator.
- `npm run web` or `npx expo start --web`: Runs a web preview in your default browser.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](file:///d:/HacktoberFest2027/Grass_project1/LICENSE) file for more information.
