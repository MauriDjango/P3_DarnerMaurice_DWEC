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
const weekCount = 7
const currentWeatherURL = (lat, lng) => {
  return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
}
const hourlyWeatherURL = (lat, lng) => {
  return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&cnt=3&appid=${apiKey}`
}
const dailyWeatherURL = (lat, lng) => {
  return `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lng}&cnt=${weekCount}&appid=${apiKey}&units=metric`
}
const getLatLngURL = (city, country) => {
  return `https://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&limit=1&appid=${apiKey}`
}
const getCityCountryURL = (lat, lng) => {
  return `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${apiKey}`
}

// API Calls -------------------------------------------------------------------

export function fetchCurrentWeatherByLatLng(lat, lng) {
  return fetch(currentWeatherURL(lat, lng)).then(r => {
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
  return fetch(hourlyWeatherURL(lat, lng)).then(r => {
    return r.json()
  })
  .then(data => {
    return data
  })
  .catch(err => {
    console.error(err)
  })
}

export function fetchDailyWeatherByLatLng(lat, lng) {
  return fetch(dailyWeatherURL(lat, lng)).then(r => {
    return r.json()
  })
  .then(data => {
    return data
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
  temperature.innerText = `${parsedWeatherData.main.temp}°C`;

  const humidity = document.createElement('p');
  humidity.classList.add('weather-humidity');
  humidity.innerText = `Humidity: ${parsedWeatherData.main.humidity}%`;

  const wind = document.createElement('p');
  wind.classList.add('weather-wind');
  wind.innerText = `Wind: ${parsedWeatherData.wind.speed} km/h`;

  weatherCard.appendChild(location);
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

export function parseWeatherData(weatherData) {
  const result = [];
  const dataList = weatherData.list || [weatherData];

  console.log('paresWeatherData', weatherData)

  dataList.forEach((entry) => {
    result.push({
      name: weatherData.city?.name || entry.name,
      country: weatherData.city?.country || entry.sys.country,
      weather: {
        main: entry.weather[0].main,
        description: entry.weather[0].description,
        icon: entry.weather[0].icon,
      },
      main: {
        temp: entry.main.temp,
        humidity: entry.main.humidity,
      },
      wind: {
        speed: entry.wind.speed,
      },
      dateTime: entry.dt,
    });
  });

  return result;
}


export function parseHourlyWeatherData(weatherData) {
  return weatherData.list.map((entry) => ({
    name: weatherData.city.name,
    country: weatherData.city.country,
    weather: {
      main: entry.weather[0].main,
      description: entry.weather[0].description,
      icon: entry.weather[0].icon
    },
    main: {
      temp: entry.main.temp,
      humidity: entry.main.humidity
    },
    wind: {
      speed: entry.wind.speed
    },
    dateTime: entry.dt
  }))
}
