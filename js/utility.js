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
