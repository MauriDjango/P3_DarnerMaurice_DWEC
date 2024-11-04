const cityRegex = /^[a-zA-Z\s\-]{2,50}$/;


// Utility Functions -----------------------------------------------------------

export function validCity(str) {
  return cityRegex.test(str) ?
      str :
      ''
}

export const hoursLeftInDay = () => {
  const now = new Date(); // Get the current date and time
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // Set the time to midnight of the next day
  const hoursLeft = (midnight - now) / (1000 * 60 * 60); // Calculate the difference in hours
  return Math.ceil(hoursLeft); // Return the number of hours left
};

// Create HTML Elements --------------------------------------------------------


export function createFormAlert(message) {
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

export function createSpinner() {
  const spinner = document.createElement('span')
  spinner.classList.add('loader')
  return spinner
}
