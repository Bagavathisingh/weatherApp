const API_KEY = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;
const BASE_URL = 'https://api.weatherapi.com/v1';

export const fetchWeather = async (city, units = 'metric') => {
    try {
        const response = await fetch(
            `${BASE_URL}/current.json?key=${API_KEY}&q=${city}&aqi=yes`
        );
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();

        // Transform to maintain compatibility with your App.jsx (OpenWeatherMap format)
        return {
            name: data.location.name,
            sys: { country: data.location.country },
            coord: { lat: data.location.lat, lon: data.location.lon },
            main: {
                temp: units === 'metric' ? data.current.temp_c : data.current.temp_f,
                feels_like: units === 'metric' ? data.current.feelslike_c : data.current.feelslike_f,
                temp_min: units === 'metric' ? data.current.temp_c - 2 : data.current.temp_f - 4, // Estimate
                temp_max: units === 'metric' ? data.current.temp_c + 2 : data.current.temp_f + 4, // Estimate
                pressure: data.current.pressure_mb,
                humidity: data.current.humidity,
            },
            weather: [{
                main: data.current.condition.text,
                description: data.current.condition.text
            }],
            wind: { speed: data.current.wind_kph / 3.6 },
            visibility: data.current.vis_km * 1000,
        };
    } catch (error) {
        throw error;
    }
};

export const fetchWeatherByCoords = async (lat, lon, units = 'metric') => {
    return fetchWeather(`${lat},${lon}`, units);
};

export const fetchForecast = async (lat, lon, units = 'metric') => {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=6&aqi=no&alerts=no`
        );
        if (!response.ok) throw new Error('Forecast not available');
        const data = await response.json();

        // Transform forecast to maintain compatibility
        const list = [];
        data.forecast.forecastday.forEach(day => {
            // Add a midday entry for each day to 'list' for the 5-day view
            list.push({
                dt: day.date_epoch,
                main: {
                    temp: units === 'metric' ? day.day.avgtemp_c : day.day.avgtemp_f,
                    temp_max: units === 'metric' ? day.day.maxtemp_c : day.day.maxtemp_f,
                    temp_min: units === 'metric' ? day.day.mintemp_c : day.day.mintemp_f,
                },
                weather: [{
                    main: day.day.condition.text,
                    description: day.day.condition.text
                }],
            });

            // Hourly entries for the hourly bar
            if (day.date === data.forecast.forecastday[0].date) {
                day.hour.forEach(h => {
                    list.push({
                        dt: h.time_epoch,
                        main: { temp: units === 'metric' ? h.temp_c : h.temp_f },
                        weather: [{ main: h.condition.text }]
                    });
                });
            }
        });

        return { list };
    } catch (error) {
        throw error;
    }
};

export const fetchAirQuality = async (lat, lon) => {
    try {
        const response = await fetch(
            `${BASE_URL}/current.json?key=${API_KEY}&q=${lat},${lon}&aqi=yes`
        );
        if (!response.ok) throw new Error('AQI not available');
        const data = await response.json();

        // Map US EPA Index to our existing 1-5 scale
        const epa_index = data.current.air_quality['us-epa-index'] || 1;

        return {
            list: [{
                main: { aqi: epa_index }
            }]
        };
    } catch (error) {
        throw error;
    }
};
