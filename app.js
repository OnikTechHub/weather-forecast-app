const API_KEY = localStorage.getItem('openweather_api_key') || '8ac5c4d57ba6a4b3dfcf622700447b1e';
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const REVERSE_GEO_URL = 'https://api.openweathermap.org/geo/1.0/reverse';
const DEFAULT_CITY = 'Chattogram';

// Normalize city names for OpenWeatherMap compatibility
const CITY_ALIASES = {
  'chattogram': 'Chittagong',
  'coxs bazar': "Cox's Bazar",
  'cox bazar': "Cox's Bazar",
  'barishal': 'Barisal',
  'jessore': 'Jashore',
  'bogra': 'Bogura'
};

const state = {
  city: DEFAULT_CITY,
  unit: localStorage.getItem('sky_pulse_unit') || 'metric', // 'metric' (°C) or 'imperial' (°F)
  currentWeather: null,
  forecast: null,
  loading: false
};

const DOM = {
  body: document.getElementById('appBody'),
  searchForm: document.getElementById('searchForm'),
  cityInput: document.getElementById('cityInput'),
  searchBtn: document.getElementById('searchBtn'),
  geoLocateBtn: document.getElementById('geoLocateBtn'),
  quickChips: document.getElementById('quickChips'),
  recentSearchesContainer: document.getElementById('recentSearchesContainer'),
  recentChipsList: document.getElementById('recentChipsList'),
  loadingIndicator: document.getElementById('loadingIndicator'),
  dashboardContent: document.getElementById('dashboardContent'),
  alertContainer: document.getElementById('alertContainer'),
  alertTitle: document.getElementById('alertTitle'),
  alertMessage: document.getElementById('alertMessage'),
  alertCard: document.getElementById('alertCard'),
  alertIcon: document.getElementById('alertIcon'),
  closeAlertBtn: document.getElementById('closeAlertBtn'),
  localClock: document.getElementById('localClock'),
  unitCelsius: document.getElementById('unitCelsius'),
  unitFahrenheit: document.getElementById('unitFahrenheit'),

  // Hero section
  cityName: document.getElementById('cityName'),
  countryCode: document.getElementById('countryCode'),
  currentFlag: document.getElementById('currentFlag'),
  localDateFormatted: document.getElementById('localDateFormatted'),
  currentTemp: document.getElementById('currentTemp'),
  tempUnitDisplay: document.getElementById('tempUnitDisplay'),
  feelsLikeTemp: document.getElementById('feelsLikeTemp'),
  tempHigh: document.getElementById('tempHigh'),
  tempLow: document.getElementById('tempLow'),
  weatherIconLarge: document.getElementById('weatherIconLarge'),
  conditionText: document.getElementById('conditionText'),
  quickRain: document.getElementById('quickRain'),
  quickClouds: document.getElementById('quickClouds'),
  quickAirStatus: document.getElementById('quickAirStatus'),

  // Hourly track
  hourlyForecastTrack: document.getElementById('hourlyForecastTrack'),

  // Telemetry metrics
  metricWindSpeed: document.getElementById('metricWindSpeed'),
  metricWindUnit: document.getElementById('metricWindUnit'),
  metricWindDirection: document.getElementById('metricWindDirection'),
  windDirLabel: document.getElementById('windDirLabel'),
  windCompassIcon: document.getElementById('windCompassIcon'),
  windProgressBar: document.getElementById('windProgressBar'),
  metricHumidity: document.getElementById('metricHumidity'),
  humidityDewPoint: document.getElementById('humidityDewPoint'),
  humidityProgressBar: document.getElementById('humidityProgressBar'),
  metricPressure: document.getElementById('metricPressure'),
  pressureStatus: document.getElementById('pressureStatus'),
  pressureProgressBar: document.getElementById('pressureProgressBar'),
  metricVisibility: document.getElementById('metricVisibility'),
  visibilityRating: document.getElementById('visibilityRating'),
  visibilityProgressBar: document.getElementById('visibilityProgressBar'),
  metricSunrise: document.getElementById('metricSunrise'),
  metricSunset: document.getElementById('metricSunset'),
  solarProgressBar: document.getElementById('solarProgressBar'),
  metricCloudCover: document.getElementById('metricCloudCover'),
  cloudCoverLabel: document.getElementById('cloudCoverLabel'),
  cloudProgressBar: document.getElementById('cloudProgressBar'),

  // 5-day forecast container
  forecastContainer: document.getElementById('forecastContainer')
};

// Unit conversion helpers
function formatTemp(celsius) {
  if (state.unit === 'imperial') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

function getUnitLabel() {
  return state.unit === 'imperial' ? '°F' : '°C';
}

function formatSpeed(metersPerSec) {
  if (state.unit === 'imperial') {
    return (metersPerSec * 2.23694).toFixed(1);
  }
  return (metersPerSec * 3.6).toFixed(1);
}

function getSpeedUnit() {
  return state.unit === 'imperial' ? 'mph' : 'km/h';
}

function getCountryFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function getCompassDirection(deg) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return `${directions[index]} (${Math.round(deg)}°)`;
}

// API Fetch Functions
async function fetchCurrentWeather(query, isCoords = false) {
  const params = new URLSearchParams({
    units: 'metric',
    appid: API_KEY
  });

  if (isCoords) {
    params.append('lat', query.lat);
    params.append('lon', query.lon);
  } else {
    const baseQuery = query.includes('(') ? query.split('(')[0].trim() : query.trim();
    const normalized = baseQuery.toLowerCase();
    const resolvedName = CITY_ALIASES[normalized] || baseQuery;
    params.append('q', resolvedName);
  }

  const response = await fetch(`${WEATHER_URL}?${params.toString()}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData.message || `HTTP ${response.status}`);
    err.status = response.status;
    throw err;
  }
  return response.json();
}

async function fetchForecast(query, isCoords = false) {
  const params = new URLSearchParams({
    units: 'metric',
    appid: API_KEY
  });

  if (isCoords) {
    params.append('lat', query.lat);
    params.append('lon', query.lon);
  } else {
    const baseQuery = query.includes('(') ? query.split('(')[0].trim() : query.trim();
    const normalized = baseQuery.toLowerCase();
    const resolvedName = CITY_ALIASES[normalized] || baseQuery;
    params.append('q', resolvedName);
  }

  const response = await fetch(`${FORECAST_URL}?${params.toString()}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData.message || `HTTP ${response.status}`);
    err.status = response.status;
    throw err;
  }
  return response.json();
}

async function fetchReverseGeo(lat, lon) {
  try {
    const params = new URLSearchParams({
      lat,
      lon,
      limit: 1,
      appid: API_KEY
    });
    const response = await fetch(`${REVERSE_GEO_URL}?${params.toString()}`);
    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
}

// Coordinate and load weather
async function loadWeatherData(query, isCoords = false, displayName = null) {
  setLoading(true);
  hideAlert();

  try {
    const [current, forecast, geo] = await Promise.all([
      fetchCurrentWeather(query, isCoords),
      fetchForecast(query, isCoords),
      isCoords ? fetchReverseGeo(query.lat, query.lon) : Promise.resolve(null)
    ]);

    // Handle display name: prioritize city/district level for coordinates or handle aliases
    if (isCoords) {
      const geoCity = geo?.name || geo?.state;
      const rawArea = current.name || '';
      let resolvedName = rawArea;

      if (geoCity) {
        if (rawArea && geoCity.toLowerCase() !== rawArea.toLowerCase()) {
          // Clearly prioritize the city/district and append the local micro-area
          resolvedName = `${geoCity} (${rawArea})`;
        } else {
          resolvedName = geoCity;
        }
      }

      current.customDisplayName = resolvedName;
      DOM.cityInput.value = resolvedName;
    } else if (displayName) {
      current.customDisplayName = displayName;
    } else if (typeof query === 'string' && query.trim().toLowerCase() === 'chattogram') {
      current.customDisplayName = 'Chattogram';
    }

    state.currentWeather = current;
    state.forecast = forecast;

    renderDashboard(current, forecast);
    saveRecentSearch(current.customDisplayName || current.name);
  } catch (err) {
    console.error('Weather load error:', err);
    if (err.status === 404) {
      showAlert(
        'City Not Found',
        `Could not find weather for "${query}". Please check the spelling (e.g., Chattogram, Dhaka, or London).`,
        'warning'
      );
    } else {
      showAlert(
        'Connection Error',
        `Unable to fetch weather data. Please check your internet connection and try again.`,
        'error'
      );
    }
  } finally {
    setLoading(false);
  }
}

// Master UI render
function renderDashboard(current, forecast) {
  renderCurrentWeather(current);
  renderHourlyForecast(forecast);
  render5DayForecast(forecast);
  updateTheme(current);
  lucide.createIcons();
}

function renderCurrentWeather(data) {
  const { name, sys, main, weather, wind, visibility, clouds, timezone, customDisplayName } = data;
  const weatherItem = weather[0] || {};

  DOM.cityName.textContent = customDisplayName || name;
  DOM.countryCode.textContent = sys?.country || '--';
  DOM.currentFlag.textContent = getCountryFlag(sys?.country);

  // Local date formatting based on timezone
  const localDate = getCityDate(timezone);
  DOM.localDateFormatted.textContent = localDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Temperatures
  DOM.currentTemp.textContent = formatTemp(main.temp);
  DOM.tempUnitDisplay.textContent = getUnitLabel();
  DOM.feelsLikeTemp.textContent = `${formatTemp(main.feels_like)}${getUnitLabel()}`;
  DOM.tempHigh.textContent = `${formatTemp(main.temp_max)}°`;
  DOM.tempLow.textContent = `${formatTemp(main.temp_min)}°`;

  // Condition and icon
  DOM.conditionText.textContent = weatherItem.description || 'Clear Sky';
  const iconCode = weatherItem.icon || '01d';
  DOM.weatherIconLarge.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
  DOM.weatherIconLarge.alt = weatherItem.description || 'Weather condition';

  // Quick summary pills
  const rainAmount = data.rain ? (data.rain['1h'] || data.rain['3h'] || 0) : 0;
  DOM.quickRain.textContent = rainAmount > 0 ? `${rainAmount} mm` : '0%';
  DOM.quickClouds.textContent = `${clouds?.all ?? 0}%`;

  const isComfortable = main.humidity >= 35 && main.humidity <= 75;
  DOM.quickAirStatus.textContent = isComfortable ? 'Comfortable' : (main.humidity > 75 ? 'Humid' : 'Dry');
  DOM.quickAirStatus.className = `font-semibold ${isComfortable ? 'text-emerald-400' : 'text-amber-400'}`;

  // Wind metric
  DOM.metricWindSpeed.textContent = formatSpeed(wind?.speed || 0);
  DOM.metricWindUnit.textContent = getSpeedUnit();
  const deg = wind?.deg || 0;
  DOM.windDirLabel.textContent = getCompassDirection(deg);
  DOM.windCompassIcon.style.transform = `rotate(${deg}deg)`;
  DOM.windProgressBar.style.width = `${Math.min(100, Math.round(((wind?.speed || 0) / 25) * 100))}%`;

  // Humidity and calculated dew point
  const humidity = main.humidity || 0;
  DOM.metricHumidity.textContent = humidity;
  DOM.humidityProgressBar.style.width = `${humidity}%`;
  const dewPoint = Math.round(main.temp - ((100 - humidity) / 5));
  DOM.humidityDewPoint.textContent = `Dew Point: ${formatTemp(dewPoint)}${getUnitLabel()}`;

  // Atmospheric pressure
  const pressure = main.pressure || 1013;
  DOM.metricPressure.textContent = pressure;
  DOM.pressureProgressBar.style.width = `${Math.min(100, Math.max(10, ((pressure - 960) / 90) * 100))}%`;
  if (pressure > 1020) {
    DOM.pressureStatus.textContent = 'High';
    DOM.pressureStatus.className = 'text-[11px] text-sky-400 font-mono mt-0.5';
  } else if (pressure < 1005) {
    DOM.pressureStatus.textContent = 'Low';
    DOM.pressureStatus.className = 'text-[11px] text-rose-400 font-mono mt-0.5';
  } else {
    DOM.pressureStatus.textContent = 'Normal';
    DOM.pressureStatus.className = 'text-[11px] text-emerald-400 font-mono mt-0.5';
  }

  // Optical visibility
  const visKm = ((visibility || 10000) / 1000).toFixed(1);
  DOM.metricVisibility.textContent = visKm;
  DOM.visibilityProgressBar.style.width = `${Math.min(100, (visibility / 10000) * 100)}%`;
  DOM.visibilityRating.textContent = visibility >= 9000 ? 'Clear Horizon' : (visibility >= 5000 ? 'Moderate' : 'Low Visibility');

  // Solar cycle
  if (sys?.sunrise && sys?.sunset) {
    DOM.metricSunrise.textContent = formatLocalTime(sys.sunrise, timezone);
    DOM.metricSunset.textContent = formatLocalTime(sys.sunset, timezone);

    const nowSec = Math.floor(Date.now() / 1000) + timezone;
    const riseSec = sys.sunrise + timezone;
    const setSec = sys.sunset + timezone;
    const solarSpan = setSec - riseSec;
    const currentProgress = Math.max(0, Math.min(1, (nowSec - riseSec) / solarSpan));
    DOM.solarProgressBar.style.width = `${Math.round(currentProgress * 100)}%`;
  }

  // Cloud density
  const cloudPercent = clouds?.all ?? 0;
  DOM.metricCloudCover.textContent = cloudPercent;
  DOM.cloudProgressBar.style.width = `${cloudPercent}%`;
  DOM.cloudCoverLabel.textContent = cloudPercent < 20 ? 'Clear Skies' : (cloudPercent < 60 ? 'Partly Cloudy' : 'Overcast');
}

// 24-Hour Hourly Forecast (8 intervals x 3 hours)
function renderHourlyForecast(forecast) {
  if (!forecast || !forecast.list) return;

  const hourlySlots = forecast.list.slice(0, 8);
  const timezone = forecast.city?.timezone || 0;

  DOM.hourlyForecastTrack.innerHTML = hourlySlots.map((slot, index) => {
    const timeLabel = index === 0 ? 'Now' : formatLocalTime(slot.dt, timezone);
    const temp = formatTemp(slot.main.temp);
    const icon = slot.weather[0]?.icon || '01d';
    const condition = slot.weather[0]?.main || 'Clear';
    const pop = Math.round((slot.pop || 0) * 100);

    return `
      <div class="hourly-card">
        <span class="text-xs font-mono font-medium text-slate-300">${timeLabel}</span>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${condition}" class="w-10 h-10 object-contain my-0.5" />
        <span class="text-sm font-bold text-white">${temp}°</span>
        <span class="text-[11px] font-mono text-sky-400 flex items-center gap-0.5">
          <i data-lucide="droplet" class="w-3 h-3 inline"></i>
          ${pop}%
        </span>
      </div>
    `;
  }).join('');
}

// 5-Day Forecast dynamically generated with Array.map()
function render5DayForecast(forecast) {
  if (!forecast || !forecast.list) return;

  const dailyBuckets = {};

  forecast.list.forEach(item => {
    const dateKey = item.dt_txt.split(' ')[0];
    if (!dailyBuckets[dateKey]) {
      dailyBuckets[dateKey] = {
        dt: item.dt,
        minTemp: item.main.temp_min,
        maxTemp: item.main.temp_max,
        icons: {},
        conditions: {},
        pop: item.pop || 0
      };
    }

    const bucket = dailyBuckets[dateKey];
    bucket.minTemp = Math.min(bucket.minTemp, item.main.temp_min);
    bucket.maxTemp = Math.max(bucket.maxTemp, item.main.temp_max);
    bucket.pop = Math.max(bucket.pop, item.pop || 0);

    const icon = item.weather[0]?.icon || '01d';
    const cond = item.weather[0]?.main || 'Clear';
    bucket.icons[icon] = (bucket.icons[icon] || 0) + 1;
    bucket.conditions[cond] = (bucket.conditions[cond] || 0) + 1;
  });

  const days = Object.values(dailyBuckets).slice(0, 5);

  DOM.forecastContainer.innerHTML = days.map((day, idx) => {
    const dateObj = new Date(day.dt * 1000);
    const dayTitle = idx === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const topIcon = Object.keys(day.icons).sort((a, b) => day.icons[b] - day.icons[a])[0] || '01d';
    const topCondition = Object.keys(day.conditions).sort((a, b) => day.conditions[b] - day.conditions[a])[0] || 'Clear';
    const rainChance = Math.round(day.pop * 100);

    const minT = formatTemp(day.minTemp);
    const maxT = formatTemp(day.maxTemp);

    return `
      <article class="forecast-card group">
        <div class="w-full flex items-center justify-between text-xs pb-2 border-b border-white/5">
          <span class="font-bold text-white tracking-wide uppercase font-mono">${dayTitle}</span>
          <span class="text-slate-400 font-mono text-[11px]">${formattedDate}</span>
        </div>

        <div class="my-4 flex flex-col items-center">
          <div class="w-14 h-14 relative flex items-center justify-center transition-transform group-hover:scale-110">
            <img src="https://openweathermap.org/img/wn/${topIcon}@2x.png" alt="${topCondition}" class="w-full h-full object-contain drop-shadow" />
          </div>
          <span class="text-xs font-medium text-slate-300 mt-1 capitalize">${topCondition}</span>
        </div>

        <div class="w-full space-y-2 pt-2 border-t border-white/5">
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-rose-400 font-semibold">${maxT}°</span>
            <div class="flex-1 mx-2 bg-white/10 rounded-full h-1 overflow-hidden">
              <div class="bg-gradient-to-r from-sky-400 to-rose-400 h-1 rounded-full" style="width: 80%"></div>
            </div>
            <span class="text-sky-300 font-semibold">${minT}°</span>
          </div>

          <div class="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span class="flex items-center gap-1">
              <i data-lucide="droplets" class="w-3 h-3 text-sky-400 inline"></i>
              ${rainChance}% Rain
            </span>
            <span class="text-[10px] text-slate-500 uppercase">Outlook</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Dynamic Theme switcher
function updateTheme(weatherData) {
  const icon = weatherData.weather?.[0]?.icon || '01d';
  const condition = (weatherData.weather?.[0]?.main || '').toLowerCase();
  const isNight = icon.includes('n');

  DOM.body.classList.remove(
    'theme-clear',
    'theme-clouds',
    'theme-rain',
    'theme-thunderstorm',
    'theme-snow',
    'theme-mist',
    'theme-night',
    'theme-default'
  );

  if (isNight && (condition.includes('clear') || condition.includes('cloud'))) {
    DOM.body.classList.add('theme-night');
  } else if (condition.includes('thunder')) {
    DOM.body.classList.add('theme-thunderstorm');
  } else if (condition.includes('rain') || condition.includes('drizzle')) {
    DOM.body.classList.add('theme-rain');
  } else if (condition.includes('snow')) {
    DOM.body.classList.add('theme-snow');
  } else if (condition.includes('cloud')) {
    DOM.body.classList.add('theme-clouds');
  } else if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze')) {
    DOM.body.classList.add('theme-mist');
  } else {
    DOM.body.classList.add('theme-clear');
  }
}

// Helper date/time math
function getCityDate(timezoneSeconds = 0) {
  const nowUtc = Date.now() + (new Date().getTimezoneOffset() * 60000);
  return new Date(nowUtc + (timezoneSeconds * 1000));
}

function formatLocalTime(unixTimestamp, timezoneSeconds = 0) {
  const date = new Date((unixTimestamp + timezoneSeconds) * 1000);
  let hours = date.getUTCHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours} ${ampm}`;
}

// UI state helpers
function setLoading(isLoading) {
  state.loading = isLoading;
  if (isLoading) {
    DOM.loadingIndicator.classList.remove('hidden');
    DOM.dashboardContent.classList.add('opacity-40', 'pointer-events-none');
    DOM.searchBtn.disabled = true;
  } else {
    DOM.loadingIndicator.classList.add('hidden');
    DOM.dashboardContent.classList.remove('opacity-40', 'pointer-events-none');
    DOM.searchBtn.disabled = false;
  }
}

function showAlert(title, message, type = 'info') {
  DOM.alertTitle.textContent = title;
  DOM.alertMessage.textContent = message;

  DOM.alertCard.className = 'flex items-start gap-3 p-4 rounded-2xl border text-sm backdrop-blur-md transition-all ';
  if (type === 'error') {
    DOM.alertCard.classList.add('bg-rose-500/10', 'border-rose-500/30', 'text-rose-200');
    DOM.alertIcon.className = 'w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400';
  } else if (type === 'warning') {
    DOM.alertCard.classList.add('bg-amber-500/10', 'border-amber-500/30', 'text-amber-200');
    DOM.alertIcon.className = 'w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400';
  } else {
    DOM.alertCard.classList.add('bg-sky-500/10', 'border-sky-500/30', 'text-sky-200');
    DOM.alertIcon.className = 'w-5 h-5 flex-shrink-0 mt-0.5 text-sky-400';
  }

  DOM.alertContainer.classList.remove('hidden');
}

function hideAlert() {
  DOM.alertContainer.classList.add('hidden');
}

// Recent search history in localStorage
function saveRecentSearch(cityName) {
  if (!cityName) return;
  let recents = JSON.parse(localStorage.getItem('sky_pulse_recents') || '[]');
  recents = recents.filter(c => c.toLowerCase() !== cityName.toLowerCase());
  recents.unshift(cityName);
  recents = recents.slice(0, 4);
  localStorage.setItem('sky_pulse_recents', JSON.stringify(recents));
  renderRecentSearches();
}

function renderRecentSearches() {
  const recents = JSON.parse(localStorage.getItem('sky_pulse_recents') || '[]');
  if (recents.length === 0) {
    DOM.recentSearchesContainer.classList.add('hidden');
    return;
  }
  DOM.recentSearchesContainer.classList.remove('hidden');
  DOM.recentChipsList.innerHTML = recents.map(city => `
    <button class="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 hover:text-white border border-white/5 transition-colors font-mono text-[11px]" data-city="${city}">
      ${city}
    </button>
  `).join('');
}

// Geolocation
function handleGeolocation() {
  if (!navigator.geolocation) {
    showAlert('Geolocation Unavailable', 'Geolocation is not supported by your current browser.', 'warning');
    return;
  }

  // Clear previous text immediately so search bar reflects locate action
  DOM.cityInput.value = '';
  setLoading(true);
  hideAlert();

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const coords = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      };
      loadWeatherData(coords, true);
    },
    (error) => {
      setLoading(false);
      let message = 'Unable to detect your coordinates.';
      if (error.code === error.PERMISSION_DENIED) {
        message = 'Location access was denied. You can search by city name instead.';
      }
      showAlert('Location Error', message, 'warning');
    },
    { timeout: 8000, enableHighAccuracy: false }
  );
}

// Header Clock
function startClock() {
  const update = () => {
    const now = new Date();
    DOM.localClock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  update();
  setInterval(update, 1000);
}

// Event Listeners
function initializeEvents() {
  DOM.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = DOM.cityInput.value.trim();
    if (!query) return;
    loadWeatherData(query, false);
    DOM.cityInput.blur();
  });

  DOM.geoLocateBtn.addEventListener('click', handleGeolocation);

  DOM.quickChips.addEventListener('click', (e) => {
    const chip = e.target.closest('button[data-city]');
    if (chip) {
      const city = chip.getAttribute('data-city');
      DOM.cityInput.value = city;
      loadWeatherData(city, false);
    }
  });

  DOM.recentChipsList.addEventListener('click', (e) => {
    const chip = e.target.closest('button[data-city]');
    if (chip) {
      const city = chip.getAttribute('data-city');
      DOM.cityInput.value = city;
      loadWeatherData(city, false);
    }
  });

  DOM.unitCelsius.addEventListener('click', () => {
    if (state.unit === 'metric') return;
    state.unit = 'metric';
    localStorage.setItem('sky_pulse_unit', 'metric');
    DOM.unitCelsius.className = 'px-2.5 py-1 text-xs font-semibold rounded-md transition-all bg-sky-500 text-white shadow-sm';
    DOM.unitFahrenheit.className = 'px-2.5 py-1 text-xs font-semibold rounded-md transition-all text-slate-400 hover:text-white';
    if (state.currentWeather && state.forecast) {
      renderDashboard(state.currentWeather, state.forecast);
    }
  });

  DOM.unitFahrenheit.addEventListener('click', () => {
    if (state.unit === 'imperial') return;
    state.unit = 'imperial';
    localStorage.setItem('sky_pulse_unit', 'imperial');
    DOM.unitFahrenheit.className = 'px-2.5 py-1 text-xs font-semibold rounded-md transition-all bg-sky-500 text-white shadow-sm';
    DOM.unitCelsius.className = 'px-2.5 py-1 text-xs font-semibold rounded-md transition-all text-slate-400 hover:text-white';
    if (state.currentWeather && state.forecast) {
      renderDashboard(state.currentWeather, state.forecast);
    }
  });

  DOM.closeAlertBtn.addEventListener('click', hideAlert);
}

// Initial Startup
function init() {
  startClock();
  renderRecentSearches();
  initializeEvents();

  // Load initial city (Chattogram, Bangladesh)
  loadWeatherData(DEFAULT_CITY, false, 'Chattogram');
}

document.addEventListener('DOMContentLoaded', init);
