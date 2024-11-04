const apiKey = '5adb233bac1c83264fd348bdd4813cfb';

// API URLS --------------------------------------------------------------------
const getLatLngURL = (city, country) =>
  `https://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&limit=1&appid=${apiKey}`;

const getCityCountryURL = (lat, lng) =>
  `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${apiKey}`;

const getWeatherURL = (lat, lng) =>
  `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;

// API Calls -------------------------------------------------------------------
export async function fetchWeatherByLatLng(lat, lng) {
  try {
    const response = await fetch(getWeatherURL(lat, lng));
    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    return await response.json();
  } catch (err) {
    console.error('Error fetching weather:', err);
    throw err; // Rethrow error for higher-level handling
  }
}

export async function getCityCountryFromLatLng(lat, lng) {
  try {
    const response = await fetch(getCityCountryURL(lat, lng));
    const data = await response.json();

    if (data.length === 0) throw new Error("Location not found");

    const { name: city, country } = data[0];
    return { city, country };
  } catch (err) {
    console.error('Error fetching city/country:', err);
    throw err;
  }
}

export async function getLatLong(city, country) {
  try {
    const response = await fetch(getLatLngURL(city, country));
    if (!response.ok) throw new Error('Error fetching location data');
    const data = await response.json();

    if (data.length === 0) throw new Error('Location not found');

    const { lat, lon } = data[0];
    return { lat, lon };
  } catch (err) {
    console.error('Error fetching lat/long:', err);
    throw err;
  }
}

// HTML ------------------------------------------------------------------------
export function createWeatherCard(parsedWeatherData) {
  const weatherCard = document.createElement('div');
  const { weather, name, country, main, wind, dateTime } = parsedWeatherData;
  weatherCard.classList.add('weather-card', weather.main.toLowerCase());

  const location = document.createElement('h2');
  location.classList.add('weather-location');
  location.innerText = `${name}, ${country}`;

  const icon = document.createElement('img');
  icon.classList.add('weather-icon');
  icon.src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
  icon.alt = weather.description;

  const condition = document.createElement('p');
  condition.classList.add('weather-condition');
  condition.innerText = weather.description;

  const temperature = document.createElement('p');
  temperature.classList.add('weather-temp');
  temperature.innerText = formatTemperature(main.temp);

  const humidity = document.createElement('p');
  humidity.classList.add('weather-humidity');
  humidity.innerText = `Humidity: ${main.humidity}%`;

  const windSpeed = document.createElement('p');
  windSpeed.classList.add('weather-wind');
  windSpeed.innerText = `Wind: ${wind.speed} km/h`;

  const formattedDateTime = formatDateTime(dateTime);
  const dateTimeElement = document.createElement('p');
  dateTimeElement.classList.add('weather-date-time');
  dateTimeElement.innerText = formattedDateTime;

  weatherCard.append(location, icon, condition, temperature, humidity, windSpeed, dateTimeElement);
  return weatherCard;
}

function formatTemperature(tempData) {
  if (typeof tempData === 'number') return `${Math.round(tempData)}°C`;

  if (typeof tempData === 'object' && tempData !== null) {
    const { morn, eve, night } = tempData;
    return `Morning: ${Math.round(morn)}°C\nEvening: ${Math.round(eve)}°C\nNight: ${Math.round(night)}°C`;
  }

  return 'Temperature data not available';
}

function formatDateTime(timestamp) {
  const date = new Date(timestamp * 1000);
  const options = { weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false };
  return date.toLocaleString('en-US', options);
}

// Utility ---------------------------------------------------------------------
export async function parseWeatherData(view, weatherData) {
  const { city, country } = await getCityCountryFromLatLng(weatherData.lat, weatherData.lon);
  const dataList = getDataList(view, weatherData);

  return dataList.map(entry => ({
    name: city,
    country,
    weather: {
      description: entry.weather?.[0]?.description || 'No description available',
      main: entry.weather?.[0]?.main || 'N/A',
      icon: entry.weather?.[0]?.icon || '01d',
    },
    main: {
      temp: entry.temp,
      humidity: entry.humidity || entry.main?.humidity || 0,
    },
    wind: {
      speed: entry.wind_speed || entry.wind?.speed || 0,
    },
    dateTime: entry.dt,
  }));
}

// Helper function to get the correct dataList based on view
function getDataList(view, weatherData) {
  if (view === 'current') return [weatherData.current];
  if (view === 'hourly') return weatherData.hourly;
  if (view === 'daily') return weatherData.daily;

  console.warn('Invalid focus specified. Defaulting to current data.');
  return [weatherData.current];
}
