// Built-in API request by city name
const apiKey = '5adb233bac1c83264fd348bdd4813cfb'
const hoursLeftInDay = () => {
  const now = new Date(); // Current date and time
  const endOfDay = new Date(now); // Copy current date
  endOfDay.setHours(23, 59, 59, 999); // Set time to 11:59:59 PM

  const millisecondsLeft = endOfDay - now; // Calculate the difference in milliseconds
   // Convert to hours
  return Math.floor(millisecondsLeft / (1000 * 60 * 60));
}
const dayCount = 7
const weekCount = 7
const getLatLngURL = (city, country) => {
  return `https://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&limit=1&appid=${apiKey}`
}
const getCityCountryURL = (lat, lng) => {
  return `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${apiKey}`
}
const getWeatherURL = (lat, lng) => {
  return `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
}

// API Calls -------------------------------------------------------------------

export function fetchCurrentWeatherByLatLng(lat, lng) {
  return fetch(getWeatherURL(lat, lng)).then(r => {
    return r.json()
  })
  .then(data => {
    return data
  })
  .catch(err => {
    console.error(err)
  })
}

export function fetchHourlyWeatherByLatLng(lat, lng) {
  return fetch(getWeatherURL(lat, lng)).then(r => {
    return r.json()
  })
  .then(data => {
    return data.hourly
  })
  .catch(err => {
    console.error(err)
  })
}

export function fetchDailyWeatherByLatLng(lat, lng) {
  return fetch(getWeatherURL(lat, lng)).then(r => {
    return r.json()
  })
  .then(data => {
    return data.daily
  })
  .catch(err => {
    console.error(err)
  })
}

export async function getCityCountryFromLatLng(lat, lng) {
  const response = await fetch(getCityCountryURL(lat, lng));
  const data = await response.json();

  if (data.length > 0) {
    return {
      city: data[0].name,
      country: data[0].country
    };
  } else {
    throw new Error("Location not found");
  }
}

// HTML ------------------------------------------------------------------------

export function createWeatherCard(parsedWeatherData) {
  const weatherCard = document.createElement('div');
  weatherCard.classList.add('weather-card', parsedWeatherData.weather.main.toLowerCase());

  const location = document.createElement('h2');
  location.classList.add('weather-location');
  location.innerText = `${parsedWeatherData.name}, ${parsedWeatherData.country}`;

  const icon = document.createElement('img');
  icon.classList.add('weather-icon');
  const iconCode = parsedWeatherData.weather.icon;
  icon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  icon.alt = parsedWeatherData.weather.description;

  const condition = document.createElement('p');
  condition.classList.add('weather-condition');
  condition.innerText = parsedWeatherData.weather.description;

  const temperature = document.createElement('p');
  temperature.classList.add('weather-temp');

  // Determine if temp is a number or an object and format accordingly
  const tempData = parsedWeatherData.main.temp;

  if (typeof tempData === 'number') {
    // For current weather
    temperature.innerText = `${Math.round(tempData)}°C`;
  } else if (typeof tempData === 'object' && tempData !== null) {
    // For daily weather (assume temp is an object)
    const nightTemp = Math.round(tempData.night) || 0; // Night temperature
    const eveTemp = Math.round(tempData.eve) || 0; // Evening temperature
    const mornTemp = Math.round(tempData.morn) || 0; // Morning temperature

    temperature.innerText = `Morning: ${mornTemp}°C
     Evening: ${eveTemp}°C
     Night: ${nightTemp}°C
     `;
  } else {
    temperature.innerText = 'Temperature data not available'; // Fallback message
  }

  const humidity = document.createElement('p');
  humidity.classList.add('weather-humidity');
  humidity.innerText = `Humidity: ${parsedWeatherData.main.humidity}%`;

  const wind = document.createElement('p');
  wind.classList.add('weather-wind');
  wind.innerText = `Wind: ${parsedWeatherData.wind.speed} km/h`;

  // Convert UNIX timestamp to a human-readable format
  const dateTime = new Date(parsedWeatherData.dateTime * 1000); // Multiply by 1000 to convert to milliseconds
  const options = { weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false };
  const formattedDateTime = dateTime.toLocaleString('en-US', options);

  const dateTimeElement = document.createElement('p');
  dateTimeElement.classList.add('weather-date-time');
  dateTimeElement.innerText = formattedDateTime; // e.g., "Monday, 15:30"

  weatherCard.appendChild(dateTimeElement); // Append the date and time
  // weatherCard.appendChild(location);
  weatherCard.appendChild(icon);
  weatherCard.appendChild(condition);
  weatherCard.appendChild(temperature);
  weatherCard.appendChild(humidity);
  weatherCard.appendChild(wind);

  return weatherCard;
}



// Utility ---------------------------------------------------------------------

export async function getLatLong(city, country) {
  const response = await fetch(getLatLngURL(city, country));

  if (!response.ok) {
    throw new Error('Error fetching location data');
  }

  const data = await response.json();
  if (data.length === 0) {
    throw new Error('Location not found');
  }

  return {
    lat: data[0].lat,
    lng: data[0].lon
  }
}

export async function parseWeatherData(view, weatherData) {
  const result = [];
  const { city, country } = await getCityCountryFromLatLng(weatherData.lat, weatherData.lon);
  console.log('parseWeatherData weatherData', weatherData, view);

  // Get the dataList based on the view
  const dataList = getDataList(view, weatherData);

  console.log('parseWeatherData dataList', dataList);

  // Map over dataList to create the result array
  return dataList.map((entry) => ({
    name: city,
    country: country,
    weather: {
      description: entry.weather?.[0]?.description || 'No description available',
      main: entry.weather?.[0]?.main || 'N/A',
      icon: entry.weather?.[0]?.icon || '01d', // Default icon if not available
    },
    main: {
      temp: entry.temp, // Use helper function to get temperature
      humidity: entry.humidity || entry.main?.humidity || 0, // Access humidity
    },
    wind: {
      speed: entry.wind_speed || entry.wind?.speed || 0, // Access wind speed
    },
    dateTime: entry.dt,
  }));
}

// Helper function to get the correct dataList based on view
function getDataList(view, weatherData) {
  if (view === 'current') {
    return [weatherData.current]; // Focus on current weather data
  } else if (view === 'hourly') {
    return weatherData.hourly; // Focus on hourly weather data
  } else if (view === 'daily') {
    return weatherData.daily; // Focus on daily weather data
  } else {
    console.warn('Invalid focus specified. Defaulting to current data.');
    return [weatherData.current]; // Fallback to current if invalid focus
  }
}

function getTemperature(temp) {
  if (temp && temp.day) {
    return Math.round(temp.day); }
  else if (temp ) {
    return Math.round(temp); // Return the 'day' temp from daily weather data
  }
  return 0; // Fallback temperature
}