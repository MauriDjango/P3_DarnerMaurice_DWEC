import {
  createWeatherCard,
  fetchHourlyWeatherByLatLng,
  fetchCurrentWeatherByLatLng,
  getLatLong,
  fetchDailyWeatherByLatLng,
  parseWeatherData,
} from './api/weatherAPI/weatherAPI.js';
import {marker} from './api/googleMaps/map.js';
import {validCity} from './utility.js';

const location = document.querySelector('#location');
const results = document.querySelector('#resultado')
const cityInput = document.querySelector('#ciudad')
const countrySelect = document.querySelector('#pais')
const container =  document.querySelector('.container')
const form = document.querySelector('#formulario')
const hoursLeftInDay = () => {
  const now = new Date(); // Get the current date and time
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // Set the time to midnight of the next day
  const hoursLeft = (midnight - now) / (1000 * 60 * 60); // Calculate the difference in hours
  return Math.ceil(hoursLeft); // Return the number of hours left
};
const tabContents = Array.from(document.querySelectorAll('.tab-content')).reduce((acc, el) => {
  acc[el.id] = el;
  return acc;
}, {});
const timeTabs = Array.from(document.querySelectorAll('.tab-button')).reduce((acc, el) => {
  acc[el.id] = el;
  return acc;
}, {});
const searchData = {
  city: '',
  country: ''
}
const view = {
  hourly: 'hourly',
  daily: 'daily',
  weekly: 'weekly',
}
let latLng = {
  lat: null,
  lng: null,
}

document.addEventListener('DOMContentLoaded', (e) => {
  loadEventListeners()
  resetFields()
})

function loadEventListeners() {
  cityInput.addEventListener('input', (e) => {
    searchData.city = validCity(e.target.value.trim())
  })

  countrySelect.addEventListener('change', (e) => {
    searchData.country = e.target.value
  })

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (searchData.city === '' || searchData.country === '')
    {
      if (marker.position) {
        latLng = {
          lat: marker.No.lat(),
          lng: marker.No.lng()
        }
        console.log('Submit with marker position', latLng)
        await handleWeatherFetch()
      }
    }
    else if (searchData.city && searchData.country === '')
    {
      formAlert('All fields are required');
    } else if (searchData.city && searchData.country)
    {
      latLng = await getLatLong(searchData.city, searchData.country)
      console.log('submit with fields', latLng)
      await handleWeatherFetch()
    }
  });
}

// Create HTML Elements --------------------------------------------------------

function createFormAlert(message) {
  const alert = document.createElement('div');
  alert.classList.add('alert');
  alert.id = 'form-alert';

  const alertIcon = document.createElement('span');
  alertIcon.classList.add('alert-icon');
  alertIcon.innerHTML = '&#9888;'; // Use innerHTML to render the HTML entity correctly

  const alertMessage = document.createElement('p');
  alertMessage.classList.add('alert-message');
  alertMessage.innerText = message; // Set the alert message text

  alert.appendChild(alertIcon);
  alert.appendChild(alertMessage);

  return alert;
}

function createSpinner() {
  const spinner = document.createElement('span')
  spinner.classList.add('loader')
  return spinner
}

// Manipulate HTML Element -----------------------------------------------------

function handleLoad(loading, mainFunc, parent) {
  parent.appendChild(loading)
  setTimeout(() => {
    parent.removeChild(loading)
    mainFunc()
  }, 1000)
}

function cleanWeatherCard() {
  const weatherCards = document.querySelectorAll('.weather-card')
  weatherCards.forEach(card => {
    card.parentNode.removeChild(card)
  })
}

function formAlert() {
  const alert = createFormAlert()
  form.appendChild(alert)

  setTimeout(() => {
    const alertElement = document.getElementById('form-alert')
    alertElement.parentNode.removeChild(alertElement)
  }, 3000)
}

function resetFields() {
  form.reset()
  searchData.city = ''
  searchData.country = ''
}

function openTab(view) {
  for (const tab of Object.values(tabContents)) {
  tab.style.display = 'none'
  }
  tabContents[`${view}-content`].style.display = 'flex';

  for (const button of Object.values(timeTabs)) {
    button.classList.remove('active')
  }
  timeTabs[`${view}-button`].classList.add('active');
}

async function setTabs () {
  let weatherData = null
  let rawWeatherData = await fetchCurrentWeatherByLatLng(latLng.lat, latLng.lng)

  for (const tab of Object.values(timeTabs)) {
    tab.addEventListener('click', async (e) => {
      const view = e.target.id.split('-')[0]
      switch (view) {
        case 'hourly':
          weatherData = (await parseWeatherData(view, rawWeatherData)).slice(0, hoursLeftInDay())
          setTabContent(view, weatherData)
          break
        case 'daily':
          weatherData = (await parseWeatherData(view, rawWeatherData)).slice(0, 7)
          setTabContent(view, weatherData)
          break
        case 'current':
          weatherData = await parseWeatherData(view, rawWeatherData)
          setTabContent(view, weatherData)
          break
      }
      openTab(view)
    })
  }
}

function setTabContent(view, weatherData) {
  const container = tabContents[`${view}-content`]
  container.innerHTML = ''; // Clear existing content
  weatherData.forEach((data) => {
    container.appendChild(createWeatherCard(data))
  })
}

// Event Handlers --------------------------------------------------------------

async function handleWeatherFetch() {
  try {
    cleanWeatherCard();
    handleLoad(
        createSpinner(),
        setTabs,
        results
    );
  } catch (error) {
    console.error(error);
    formAlert('Error retrieving weather data');
  }
}
