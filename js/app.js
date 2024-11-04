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

const results = document.querySelector('#resultado')
const cityInput = document.querySelector('#ciudad')
const countrySelect = document.querySelector('#pais')
const container =  document.querySelector('.container')
const form = document.querySelector('#formulario')
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

  /*mapSubmit.addEventListener('click', async () => {
    latLng = {
      lat: marker.No.lat(),
      lng: marker.No.lng()
    };
  })*/
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

function handleLoad(loading, parent) {
  parent.appendChild(loading)
  setTimeout(() => {
    parent.removeChild(loading)
    setTabs()
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

function loadSpinner() {
  const spinner = createSpinner()
  container.appendChild(spinner)

  setTimeout(() => {
    const spinnerElement = document.querySelector('.loader')
    spinnerElement.parentNode.removeChild(spinnerElement)
  }, 1000)
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

function setTabContent(view, weatherData) {
  const container = tabContents[`${view}-content`]
  console.log('setTabContent', view, weatherData)
  weatherData.forEach((data) => {
    container.appendChild(createWeatherCard(data))
  })
}

function setTabs() {
  console.log('setTabs', )
  let weatherData = null
  for (const tab of Object.values(timeTabs)) {
    tab.addEventListener('click', async (e) => {
      const view = e.target.id.split('-')[0]
      switch (view) {
        case 'hourly':
          weatherData = parseWeatherData(
              await fetchHourlyWeatherByLatLng(latLng.lat, latLng.lng)
          )

          setTabContent(view, weatherData)
          break
        case 'daily':
          weatherData = parseWeatherData(
              await fetchDailyWeatherByLatLng(latLng.lat, latLng.lng)
          )

          setTabContent(view, weatherData)
          break
        case 'current':
          weatherData = parseWeatherData(
              await fetchCurrentWeatherByLatLng(latLng.lat, latLng.lng)
          )
          setTabContent(view, weatherData)
          break
      }
      openTab(view)
    })
  }
}

// Event Handlers --------------------------------------------------------------

async function handleWeatherFetch() {
  try {
    console.log('handleWeatherFetch', latLng.lat, latLng.lng)

    /*if (weatherData.cod === "404") {
      formAlert(weatherData.message);
    } else {*/
      cleanWeatherCard();
      handleLoad(
          createSpinner(),
          results
      );
    // }
  } catch (error) {
    console.error(error);
    formAlert('Error retrieving weather data');
  }
}
