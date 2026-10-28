# SkyPulse Weather — Real-Time Forecast & Climate Intelligence

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.x-38bdf8.svg)](https://tailwindcss.com/)
[![OpenWeatherMap API](https://img.shields.io/badge/API-OpenWeatherMap-orange.svg)](https://openweathermap.org/api)

> A modern, responsive real-time weather forecast and climate application built with HTML5, Tailwind CSS, and modern vanilla ES6+ JavaScript, directly integrating the official OpenWeatherMap API.

---

## 🌐 Live Demo

- **Live URL:** [https://weather-forecast-app-datheon.vercel.app](https://weather-forecast-app-datheon.vercel.app) *(or your deployed Vercel URL)*

---

## ⚡ Core Features

- **Official OpenWeatherMap API Integration**: Connects directly to `/weather` (current weather) and `/forecast` (5-day outlook) using asynchronous `fetch()` and `async/await` with comprehensive error handling.
- **Global & Regional City Search**: Instant search for any international metropolis or Bangladeshi city (e.g., Chattogram, Dhaka, Sylhet, Cox's Bazar), complete with quick-access chips and recent search history.
- **One-Click Geolocation ("Locate")**: Seamless current location weather lookup powered by the browser's `navigator.geolocation` API.
- **Current Weather Dashboard**:
  - Live temperature with instant Celsius (`°C`) and Fahrenheit (`°F`) conversion.
  - Official high-resolution OpenWeatherMap condition iconography and descriptions.
  - Feels-like temperature, daily high/low bounds, and precipitation indicators.
  - 6 Key Metrics: Wind speed (km/h or mph) with compass orientation, Humidity & Dew Point, Atmospheric Pressure (hPa), Visibility (km), Sunrise & Sunset times, and Cloud Cover percentage.
- **24-Hour Hourly Forecast**: Clean 8-slot progression (3-hour intervals) showing upcoming times, weather icons, temperatures, and rain probabilities.
- **Dynamic 5-Day Forecast Generation**: Summary outlook cards rendered dynamically using ES6 `Array.map()`.
- **Dynamic Weather Themes**: Ambient background glow and colors automatically adapt to real-time atmospheric conditions (Sunny/Clear, Thunderstorm, Rain, Clouds, Snow, Mist/Haze, and Night states).
- **Responsive & Accessible**: Mobile-first glassmorphic UI built with Tailwind CSS.

---

## 🛠️ Tech Stack

- **Markup & Structure**: HTML5 Semantic Architecture
- **Styling**: Tailwind CSS (via CDN) + Custom Glassmorphism CSS (`style.css`)
- **Scripting & Logic**: Vanilla Modern ES6+ JavaScript (`app.js`)
- **Iconography**: Lucide Icons
- **Data Source**: [OpenWeatherMap 2.5 API](https://openweathermap.org/api)

---

## 🚀 Local Setup & Development

No complex build steps or dependencies required.

### 1. Clone the repository
```bash
git clone https://github.com/OnikTechHub/weather-forecast-app.git
cd weather-forecast-app
```

### 2. Run locally

You can open `index.html` directly in your browser, or launch any local development server:

#### Option A: Node.js `npx serve`
```bash
npx serve .
```

#### Option B: Python 3
```bash
python -m http.server 3000
```
Then open `http://localhost:3000` in your browser.

#### Option C: VS Code Live Server
Right-click `index.html` and select **"Open with Live Server"**.

---

## ☁️ Deployment to Vercel

### Deploying via Vercel CLI
```bash
# 1. Install Vercel CLI globally (if not installed)
npm install -g vercel

# 2. Deploy from the root folder
vercel

# 3. Deploy to production
vercel --prod
```

### Deploying via GitHub & Vercel Dashboard
1. Push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete SkyPulse weather application"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New..." > "Project"**.
3. Import your `weather-forecast-app` repository.
4. Set Framework Preset as **Other** and click **Deploy**.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).