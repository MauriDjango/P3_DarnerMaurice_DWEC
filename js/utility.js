const cityRegex = /^[a-zA-Z\s\-]{2,50}$/;


// Utility Functions -----------------------------------------------------------

export function validCity(str) {
  return cityRegex.test(str) ?
      str :
      ''
}
