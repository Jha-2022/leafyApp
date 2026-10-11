/**
 * Real-Time Weather Service for Botanical Care
 * Fetches live weather conditions via Open-Meteo API (free, no API key required)
 * and translates atmospheric metrics into actionable plant care insights.
 */

export const PRESET_CITIES = [
  { name: 'Auto-detect Location', lat: null, lon: null },
  { name: 'Mumbai', lat: 19.0748, lon: 72.8856 },
  { name: 'New Delhi', lat: 28.6139, lon: 77.209 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Hyderabad', lat: 17.385, lon: 78.4867 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
];

const WMO_WEATHER_MAP = {
  0: { label: 'Clear Sky', dayIcon: '☀️', nightIcon: '🌙' },
  1: { label: 'Mainly Clear', dayIcon: '🌤️', nightIcon: '🌙' },
  2: { label: 'Partly Cloudy', dayIcon: '⛅', nightIcon: '☁️' },
  3: { label: 'Overcast', dayIcon: '☁️', nightIcon: '☁️' },
  45: { label: 'Foggy', dayIcon: '🌫️', nightIcon: '🌫️' },
  48: { label: 'Depositing Rime Fog', dayIcon: '🌫️', nightIcon: '🌫️' },
  51: { label: 'Light Drizzle', dayIcon: '🌦️', nightIcon: '🌧️' },
  53: { label: 'Moderate Drizzle', dayIcon: '🌦️', nightIcon: '🌧️' },
  55: { label: 'Dense Drizzle', dayIcon: '🌧️', nightIcon: '🌧️' },
  61: { label: 'Slight Rain', dayIcon: '🌧️', nightIcon: '🌧️' },
  63: { label: 'Moderate Rain', dayIcon: '🌧️', nightIcon: '🌧️' },
  65: { label: 'Heavy Rain', dayIcon: '⛈️', nightIcon: '⛈️' },
  71: { label: 'Slight Snow', dayIcon: '🌨️', nightIcon: '❄️' },
  73: { label: 'Moderate Snow', dayIcon: '❄️', nightIcon: '❄️' },
  75: { label: 'Heavy Snow', dayIcon: '❄️', nightIcon: '❄️' },
  80: { label: 'Slight Rain Showers', dayIcon: '🌦️', nightIcon: '🌧️' },
  81: { label: 'Moderate Showers', dayIcon: '🌧️', nightIcon: '🌧️' },
  82: { label: 'Violent Showers', dayIcon: '⛈️', nightIcon: '⛈️' },
  95: { label: 'Thunderstorm', dayIcon: '⛈️', nightIcon: '⛈️' },
  96: { label: 'Thunderstorm with Hail', dayIcon: '⛈️', nightIcon: '⛈️' },
  99: { label: 'Severe Thunderstorm', dayIcon: '⛈️', nightIcon: '⛈️' },
};

/**
 * Derives a dynamic botanical care advisory from live weather metrics.
 */
function getBotanicalAdvisory(temp, humidity, isRaining) {
  if (isRaining) {
    return 'Rainy today: skip outdoor watering and check indoor humidity to avoid fungal mildew.';
  }
  if (temp >= 33) {
    return 'High heat alert: water evaporates quickly. Check soil moisture and shield delicate leaves from scorching sun.';
  }
  if (temp >= 26) {
    if (humidity >= 65) {
      return 'Warm & humid: tropical paradise for Monstera & Pothos. Normal watering schedule.';
    }
    return 'Warm & dry: soil dries out faster. Consider a light foliage misting for tropical plants.';
  }
  if (temp >= 18) {
    if (humidity < 45) {
      return 'Mild but dry air: group plants together or use a pebble tray to maintain healthy humidity.';
    }
    return 'Ideal temperate climate: optimal indoor comfort for steady foliage growth.';
  }
  return 'Cool conditions: plant metabolism slows. Reduce watering frequency to safeguard against root rot.';
}

/**
 * Fetches real-time weather information and botanical context.
 *
 * @param {string} [cityName='Auto-detect Location'] - Selected city name.
 * @returns {Promise<object>} Current real-time weather & plant care insights.
 */
export async function fetchLiveWeather(cityInput = 'Auto-detect Location') {
  let lat = null;
  let lon = null;
  let resolvedCity = 'Local Area';
  let targetName = '';

  if (cityInput && typeof cityInput === 'object') {
    if (cityInput.lat !== undefined && cityInput.lat !== null && cityInput.lon !== undefined && cityInput.lon !== null) {
      lat = cityInput.lat;
      lon = cityInput.lon;
      resolvedCity = cityInput.name || 'Selected City';
    } else {
      targetName = cityInput.name || '';
    }
  } else if (typeof cityInput === 'string') {
    targetName = cityInput.trim();
  }

  // Resolve coordinates from preset if not already specified
  if (lat === null && targetName && targetName.toLowerCase() !== 'auto-detect location') {
    const matchedPreset = PRESET_CITIES.find(
      (c) => c.name.toLowerCase() === targetName.toLowerCase() && c.lat !== null
    );

    if (matchedPreset) {
      lat = matchedPreset.lat;
      lon = matchedPreset.lon;
      resolvedCity = matchedPreset.name;
    }
  }

  // If still unassigned coordinates, auto-detect location via GeoJS IP lookup
  if (lat === null || lon === null) {
    try {
      const geoRes = await fetch('https://get.geojs.io/v1/ip/geo.json');
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.latitude && geoData.longitude) {
          lat = parseFloat(geoData.latitude);
          lon = parseFloat(geoData.longitude);
          resolvedCity = geoData.city || 'Local Area';
        }
      }
    } catch (e) {
      // Fallback below
    }
  }

  // Final fallback if IP lookup failed
  if (lat === null || lon === null) {
    lat = 19.0748;
    lon = 72.8856;
    resolvedCity = 'Mumbai';
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Weather service HTTP ${res.status}`);
    }

    const data = await res.json();
    const current = data.current || {};

    const temp = Math.round(current.temperature_2m ?? 28);
    const apparentTemp = Math.round(current.apparent_temperature ?? temp);
    const humidity = Math.round(current.relative_humidity_2m ?? 60);
    const windSpeed = Math.round(current.wind_speed_10m ?? 8);
    const precipitation = current.precipitation ?? 0;
    const isDay = Boolean(current.is_day);
    const code = current.weather_code ?? 0;

    const weatherMeta = WMO_WEATHER_MAP[code] || {
      label: 'Clear',
      dayIcon: '☀️',
      nightIcon: '🌙',
    };
    const condition = weatherMeta.label;
    const icon = isDay ? weatherMeta.dayIcon : weatherMeta.nightIcon;
    const isRaining = precipitation > 0 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code);

    const botanicalAdvice = getBotanicalAdvisory(temp, humidity, isRaining);

    return {
      success: true,
      city: resolvedCity,
      latitude: lat,
      longitude: lon,
      temperature: temp,
      apparentTemperature: apparentTemp,
      humidity,
      windSpeed,
      precipitation,
      condition,
      icon,
      isDay,
      weatherCode: code,
      botanicalAdvice,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
    };
  } catch (err) {
    // Return structured offline fallback
    return {
      success: false,
      city: resolvedCity,
      temperature: 28,
      apparentTemperature: 30,
      humidity: 62,
      windSpeed: 10,
      precipitation: 0,
      condition: 'Partly Sunny',
      icon: '🌤️',
      isDay: true,
      weatherCode: 1,
      botanicalAdvice: 'Pleasant conditions: steady hydration and moderate sunlight recommended.',
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      error: err.message,
    };
  }
}
