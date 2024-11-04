[Back to Readme](Readme.md)

# Summary of Changes

## 1. API Key Configuration
- An API key variable (`apiKey`) is defined at the top of the file for authentication with the OpenWeatherMap API.

## 2. API URL Functions
- Three functions were created to construct API URLs for:
    - **Getting Latitude and Longitude**:
        - `getLatLngURL(city, country)`: Constructs a URL to retrieve latitude and longitude for a given city and country.
    - **Getting City and Country from Coordinates**:
        - `getCityCountryURL(lat, lng)`: Constructs a URL to reverse geocode latitude and longitude into city and country names.
    - **Fetching Weather Data**:
        - `getWeatherURL(lat, lng)`: Constructs a URL to get weather data using latitude and longitude.

## 3. API Call Functions
- **`fetchWeatherByLatLng(lat, lng)`**:
    - Fetches weather data based on latitude and longitude, returning the data as JSON.
- **`getCityCountryFromLatLng(lat, lng)`**:
    - Asynchronously retrieves city and country names from coordinates. If no data is found, an error is thrown.
- **`getLatLong(city, country)`**:
    - Asynchronously fetches latitude and longitude for a specified city and country. It includes error handling for unsuccessful requests and no location results.

## 4. HTML Creation Functionality
- **`createWeatherCard(parsedWeatherData)`**:
    - Creates a weather card element dynamically using the weather data passed to it. It includes:
        - Display of location, weather icon, description, temperature, humidity, wind speed, and formatted date and time.
        - Conditional handling for current temperature or temperature ranges for daily forecasts.

## 5. Utility Functionality
- **`parseWeatherData(view, weatherData)`**:
    - Parses the weather data based on the specified view (current, hourly, or daily) and constructs a structured result with relevant details.
- **`getDataList(view, weatherData)`**:
    - A helper function that returns the appropriate weather data list based on the requested view, with a fallback to current weather data.

## Additional Improvements
- **Error Handling**: Enhanced error handling for API requests, providing clear messages when data cannot be found.
- **Dynamic Temperature Handling**: Implemented logic to manage both current temperature and temperature data for daily forecasts, including fallback messages.
- **Formatted Date and Time**: Added a conversion of UNIX timestamps to a human-readable date and time format for better user experience.
