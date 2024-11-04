import {
  createWeatherCard,
  fetchWeatherByLatLng,
  getLatLong,
  parseWeatherData,
} from './api/weatherAPI/weatherAPI.js';
import { deleteMarker, marker } from './api/googleMaps/map.js'
import {
  createFormAlert,
  createSpinner,
  hoursLeftInDay,
  validCity,
} from './utility.js'
import {
  fetchLocation,
} from './api/geolocation/geolocation.js'


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

document.addEventListener('DOMContentLoaded', async () => {
  loadEventListeners()
  resetFields()
  await loadLocalWeather()
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

async function loadLocalWeather () {
  const spinner = createSpinner();
  results.appendChild(spinner)
  latLng = await fetchLocation()
  results.removeChild(spinner)

  await handleSubmit(setTabContents, setTabOnClick, results);
}

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

// Helper Functions for Each View
async function getHourlyData(rawWeatherData) {
  const hourlyData = await parseWeatherData('hourly', rawWeatherData);
  return hourlyData.slice(0, hoursLeftInDay());
}

async function getDailyData(rawWeatherData) {
  const dailyData = await parseWeatherData('daily', rawWeatherData);
  return dailyData.slice(0, dayCount);
}

async function getCurrentData(rawWeatherData) {
  return await parseWeatherData('current', rawWeatherData);
}

// Mapping Object
const viewDataFetchers = {
  hourly: getHourlyData,
  daily: getDailyData,
  current: getCurrentData,
};

// Refactored setTabContents Function
async function setTabContents() {
  const rawWeatherData = await fetchWeatherByLatLng(latLng.lat, latLng.lng);

  for (const tab of Object.values(timeTabs)) {
    const view = tab.id.split('-')[0];
    const fetchViewData = viewDataFetchers[view]; // Select the appropriate function

    if (fetchViewData) {
      const weatherData = await fetchViewData(rawWeatherData); // Fetch data using the helper function
      if (weatherData) {
        renderTabContent(view, weatherData);
      }
    } else {
      console.warn(`No data fetcher function found for view: ${view}`);
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


