function getCurrentPositionAsync() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

export async function fetchLocation() {
  const latLng = {
    lat: null,
    lng: null,
  }
  try {
    const position = await getCurrentPositionAsync();
    latLng.lat = position.coords.latitude;
    latLng.lng = position.coords.longitude;
  } catch (error) {
    console.error("Error getting location:", error.message);
  }
  return latLng;
}
