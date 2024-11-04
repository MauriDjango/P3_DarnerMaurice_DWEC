import {
  createWeatherCard,
  fetchHourlyWeatherByLatLng,
  fetchWeatherByLatLng,
  getLatLong,
  fetchDailyWeatherByLatLng,
  parseWeatherData,
} from './api/weatherAPI/weatherAPI.js';
import { deleteMarker, marker } from './api/googleMaps/map.js'
import { hoursLeftInDay, validCity } from './utility.js'


const location = document.querySelector('#location');
const results = document.querySelector('#resultado')
const cityInput = document.querySelector('#ciudad')
const countrySelect = document.querySelector('#pais')
const form = document.querySelector('#formulario')
const tabContents = Array.from(document.querySelectorAll('.tab-content')).reduce((acc, el) => {
  acc[el.id] = el;
  return acc;
}, {});
const timeTabs = Array.from(document.querySelectorAll('.tab-button')).reduce((acc, el) => {
  acc[el.id] = el;
  return acc;
}, {});

const dayCount = 7
const searchData = { city: '', country: ''}
let latLng = { lat: null, lng: null}

// Event Listeners -------------------------------------------------------------

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
    console.log('submit', searchData)
    if (searchData.city && searchData.country) {
      latLng = await getLatLong(searchData.city, searchData.country);
      await handleSubmit(setTabContents, setTabOnClick, results);
      resetFields()
      return
    }
    if (searchData.city && !searchData.country) {
      console.log('Please select country')
      formAlert('All fields are required');
      return
    }
    if (marker.position) {
      latLng = {
        lat: marker.No.lat(),
        lng: marker.No.lng(),
      };
      await handleSubmit(setTabContents, setTabOnClick, results);
      deleteMarker()
    }
  });
}

// Manipulate HTML Element -----------------------------------------------------

function formAlert(message) {
  const alert = createFormAlert(message); // Pass message to createFormAlert
  form.appendChild(alert);
  setTimeout(() => {
    const alertElement = document.getElementById('form-alert');
    alertElement.parentNode.removeChild(alertElement);
  }, 3000);
}

function resetFields() {
  form.reset()
  searchData.city = ''
  searchData.country = ''
}

function handleLoad(spinner, parent, functions) {
  parent.appendChild(spinner);
  setTimeout(() => {
    parent.removeChild(spinner);
    // Execute all provided functions
    functions.forEach(func => {
      if (typeof func === 'function') {
        func(); // Call the function
      }
    });
  }, 1000);
}

function cleanWeatherCard() {
  const weatherCards = document.querySelectorAll('.weather-card')
  weatherCards.forEach(card => {
    card.parentNode.removeChild(card)
  })
}

// Tab Functions ---------------------------------------------------------------

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

async function setTabContents() {
  let rawWeatherData = await fetchWeatherByLatLng(latLng.lat, latLng.lng);
  for (const tab of Object.values(timeTabs)) {
    const view = tab.id.split('-')[0];
    let weatherData;
    if (view === 'hourly') {
      weatherData = (await parseWeatherData(view, rawWeatherData)).slice(0, hoursLeftInDay());
    } else if (view === 'daily') {
      weatherData = (await parseWeatherData(view, rawWeatherData)).slice(0, dayCount);
    } else if (view === 'current') {
      weatherData = await parseWeatherData(view, rawWeatherData);
    }
    if (weatherData) {
      renderTabContent(view, weatherData);
    }
  }
}

function setTabOnClick() {
  for (const tab of Object.values(timeTabs)) {
    tab.addEventListener('click', async (e) => {
      const view = e.target.id.split('-')[0];
      openTab(view);
    });
  }
}

function renderTabContent(view, weatherData) {
  console.log('renderTabContent', weatherData);
  const container = tabContents[`${view}-content`];
  location.innerText = `${weatherData[0].name}, ${weatherData[0].country}`
  container.innerHTML = ''; // Clear existing content
  weatherData.forEach((data) => {
    container.appendChild(createWeatherCard(data));
  });
}

// Event Handlers --------------------------------------------------------------

async function handleSubmit(setTabContents, setTabOnClick, results) {
  try {
    cleanWeatherCard();
    handleLoad(createSpinner(), results, [setTabContents, setTabOnClick]); // Pass functions as an array
  } catch (error) {
    console.error(error);
    formAlert('Error retrieving weather data');
  }
}

// Create HTML Elements --------------------------------------------------------

function createFormAlert(message) {
  const alert = document.createElement('div');
  alert.classList.add('alert');
  alert.id = 'form-alert';

  const alertIcon = document.createElement('span');
  alertIcon.classList.add('alert-icon');

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

