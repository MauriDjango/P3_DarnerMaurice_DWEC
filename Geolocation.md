[Back to Readme](Readme.md)

# Summary of Changes

## 1. Function to Get Current Position
- **`getCurrentPositionAsync()`**:
    - This function returns a Promise that wraps the `navigator.geolocation.getCurrentPosition()` method, allowing for asynchronous retrieval of the user's current geographical location.
    - It resolves with the current position or rejects with an error if the position cannot be retrieved.

## 2. Location Fetching Function
- **`fetchLocation()`**:
    - An asynchronous function that attempts to fetch the user's current geographical coordinates (latitude and longitude).
    - Initializes a `latLng` object to store the latitude and longitude values, initially set to `null`.
    - Uses `await` to call `getCurrentPositionAsync()` and updates `latLng` with the retrieved coordinates.
    - Implements error handling to catch and log any errors that occur during the location retrieval process.
    - Returns the `latLng` object containing the latitude and longitude values.
