import React, { useState, useEffect } from 'react';
import { Search, MapPin, Thermometer, Droplets, Wind, Eye, Gauge, Sun, Cloud, CloudRain, CloudSnow, Zap, Calendar, TrendingUp, Settings, Home, Info, ChevronRight } from 'lucide-react';

const WeatherApp = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [city, setCity] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [favorites, setFavorites] = useState(['New Delhi', 'Mumbai', 'London']);
  const [settings, setSettings] = useState({ 
    tempUnit: 'celsius', 
    windUnit: 'kmh',
    theme: 'auto'
  });

  // Enhanced weather data with forecast
  const generateMockWeather = (cityName) => {
    const conditions = [
      { name: 'Clear', icon: Sun, temp: [20, 35], humidity: [30, 50] },
      { name: 'Cloudy', icon: Cloud, temp: [15, 25], humidity: [40, 70] },
      { name: 'Rainy', icon: CloudRain, temp: [10, 20], humidity: [70, 90] },
      { name: 'Snowy', icon: CloudSnow, temp: [-5, 5], humidity: [60, 80] },
      { name: 'Stormy', icon: Zap, temp: [12, 22], humidity: [75, 95] }
    ];
    
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const temp = Math.floor(Math.random() * (condition.temp[1] - condition.temp[0] + 1)) + condition.temp[0];
    const humidity = Math.floor(Math.random() * (condition.humidity[1] - condition.humidity[0] + 1)) + condition.humidity[0];
    
    // Generate 7-day forecast
    const forecast = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
      const forecastCondition = conditions[Math.floor(Math.random() * conditions.length)];
      const baseTemp = temp + Math.floor(Math.random() * 10) - 5;
      forecast.push({
        day: days[(new Date().getDay() + i) % 7],
        condition: forecastCondition.name,
        icon: forecastCondition.icon,
        high: baseTemp + Math.floor(Math.random() * 5),
        low: baseTemp - Math.floor(Math.random() * 8),
      });
    }
    
    return {
      location: cityName,
      temperature: temp,
      condition: condition.name,
      icon: condition.icon,
      humidity: humidity,
      windSpeed: Math.floor(Math.random() * 20) + 5,
      visibility: Math.floor(Math.random() * 10) + 5,
      pressure: Math.floor(Math.random() * 50) + 1000,
      feelsLike: temp + Math.floor(Math.random() * 6) - 3,
      uvIndex: Math.floor(Math.random() * 11),
      timestamp: new Date().toLocaleString(),
      forecast: forecast
    };
  };

  const searchWeather = async (cityName) => {
    if (!cityName.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');
    
    setTimeout(() => {
      const weatherData = generateMockWeather(cityName);
      setWeather(weatherData);
      
      const newHistory = [cityName, ...searchHistory.filter(c => c !== cityName)].slice(0, 5);
      setSearchHistory(newHistory);
      
      setLoading(false);
    }, 1000);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    searchWeather(city);
  };

  const handleHistoryClick = (historyCity) => {
    setCity(historyCity);
    searchWeather(historyCity);
  };

  const addToFavorites = (cityName) => {
    if (!favorites.includes(cityName)) {
      setFavorites([...favorites, cityName]);
    }
  };

  const removeFromFavorites = (cityName) => {
    setFavorites(favorites.filter(fav => fav !== cityName));
  };

  useEffect(() => {
    searchWeather('New Delhi');
  }, []);

  const getBackgroundGradient = () => {
    if (!weather) return 'from-blue-400 to-blue-600';
    
    switch (weather.condition) {
      case 'Clear': return 'from-yellow-400 via-orange-400 to-red-500';
      case 'Cloudy': return 'from-gray-400 via-gray-500 to-gray-700';
      case 'Rainy': return 'from-blue-500 via-blue-600 to-indigo-700';
      case 'Snowy': return 'from-blue-200 via-blue-300 to-blue-500';
      case 'Stormy': return 'from-purple-500 via-purple-600 to-purple-800';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const WeatherIcon = weather?.icon || Sun;

  // Navigation Component
  const Navigation = () => (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 z-50">
      <div className="flex space-x-6">
        {[
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'forecast', icon: Calendar, label: 'Forecast' },
          { id: 'favorites', icon: TrendingUp, label: 'Favorites' },
          { id: 'settings', icon: Settings, label: 'Settings' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setCurrentPage(id)}
            className={`p-3 rounded-full transition-all duration-300 ${
              currentPage === id
                ? 'bg-white/30 text-white scale-110'
                : 'text-white/70 hover:text-white hover:bg-white/20'
            }`}
            title={label}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>
    </nav>
  );

  // Home Page
  const HomePage = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-white mb-3 animate-slide-down">Weather App</h1>
        <p className="text-white/80 animate-slide-up">Get real-time weather information for any city</p>
      </div>

      <div className="mb-8 animate-scale-in">
        <div className="flex gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
              placeholder="Enter city name..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border-0 shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 text-gray-700 transition-all duration-300 focus:scale-105"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm border border-white/20 hover:scale-105 active:scale-95"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {searchHistory.length > 0 && (
        <div className="mb-8 animate-slide-up">
          <div className="flex flex-wrap gap-2 justify-center">
            {searchHistory.map((historyCity, index) => (
              <button
                key={index}
                onClick={() => handleHistoryClick(historyCity)}
                className="px-3 py-1 bg-white/20 text-white rounded-full text-sm hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-105 animate-bounce-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {historyCity}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 text-white rounded-lg text-center backdrop-blur-sm border border-red-500/30 animate-shake">
          {error}
        </div>
      )}

      {weather && !loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in-up">
          <div className="md:col-span-2 lg:col-span-1 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-500 hover:scale-105 animate-float">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5 text-white/70 mr-2 animate-pulse" />
                <h2 className="text-xl font-semibold text-white">{weather.location}</h2>
                <button
                  onClick={() => addToFavorites(weather.location)}
                  className="ml-2 text-white/70 hover:text-white transition-colors duration-300"
                  title="Add to favorites"
                >
                  ❤️
                </button>
              </div>
              
              <div className="mb-4">
                <WeatherIcon className="w-16 h-16 text-white mx-auto mb-2 animate-bounce-slow" />
                <p className="text-white/80 text-lg">{weather.condition}</p>
              </div>
              
              <div className="mb-4">
                <div className="text-6xl font-bold text-white mb-2 animate-pulse-slow">
                  {weather.temperature}°C
                </div>
                <p className="text-white/70">Feels like {weather.feelsLike}°C</p>
              </div>
              
              <div className="text-white/60 text-sm">
                Last updated: {weather.timestamp}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Droplets, label: 'Humidity', value: `${weather.humidity}%` },
              { icon: Wind, label: 'Wind', value: `${weather.windSpeed} km/h` },
              { icon: Eye, label: 'Visibility', value: `${weather.visibility} km` },
              { icon: Gauge, label: 'Pressure', value: `${weather.pressure} mb` },
              { icon: Sun, label: 'UV Index', value: weather.uvIndex },
              { icon: Thermometer, label: 'Temperature', value: `${weather.temperature}°C` }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-105 animate-slide-in-right"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <item.icon className="w-6 h-6 text-white/70 animate-pulse" />
                  <span className="text-white/70 text-sm">{item.label}</span>
                </div>
                <div className="text-2xl font-bold text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-12 animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/80">Loading weather data...</p>
        </div>
      )}
    </div>
  );

  // Forecast Page
  const ForecastPage = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-3 animate-slide-down">7-Day Forecast</h2>
        <p className="text-white/80 animate-slide-up">
          {weather ? `Weather forecast for ${weather.location}` : 'Search for a city to see forecast'}
        </p>
      </div>

      {weather?.forecast ? (
        <div className="grid gap-4">
          {weather.forecast.map((day, index) => {
            const DayIcon = day.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-105 animate-slide-in-left"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-white font-semibold w-12">{day.day}</div>
                    <DayIcon className="w-8 h-8 text-white animate-bounce-slow" />
                    <div className="text-white">{day.condition}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-bold">{day.high}°</span>
                    <span className="text-white/60">{day.low}°</span>
                    <ChevronRight className="w-5 h-5 text-white/40" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 animate-bounce">
          <Calendar className="w-16 h-16 text-white/50 mx-auto mb-4" />
          <p className="text-white/70">Search for a city to see the forecast</p>
        </div>
      )}
    </div>
  );

  // Favorites Page
  const FavoritesPage = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-3 animate-slide-down">Favorite Cities</h2>
        <p className="text-white/80 animate-slide-up">Quick access to your favorite locations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {favorites.map((favorite, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-105 animate-slide-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">{favorite}</h3>
              <button
                onClick={() => removeFromFavorites(favorite)}
                className="text-white/70 hover:text-red-400 transition-colors duration-300"
                title="Remove from favorites"
              >
                ❌
              </button>
            </div>
            <button
              onClick={() => {
                setCity(favorite);
                searchWeather(favorite);
                setCurrentPage('home');
              }}
              className="w-full bg-white/20 text-white py-2 rounded-lg hover:bg-white/30 transition-all duration-300 hover:scale-105"
            >
              View Weather
            </button>
          </div>
        ))}
      </div>

      {favorites.length === 0 && (
        <div className="text-center py-12 animate-bounce">
          <TrendingUp className="w-16 h-16 text-white/50 mx-auto mb-4" />
          <p className="text-white/70">No favorite cities yet</p>
        </div>
      )}
    </div>
  );

  // Settings Page
  const SettingsPage = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-3 animate-slide-down">Settings</h2>
        <p className="text-white/80 animate-slide-up">Customize your weather experience</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-slide-in-left">
          <h3 className="text-white font-semibold mb-4">Temperature Unit</h3>
          <div className="flex space-x-4">
            {['celsius', 'fahrenheit'].map((unit) => (
              <button
                key={unit}
                onClick={() => setSettings({ ...settings, tempUnit: unit })}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  settings.tempUnit === unit
                    ? 'bg-white/30 text-white scale-105'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {unit === 'celsius' ? '°C' : '°F'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-slide-in-right">
          <h3 className="text-white font-semibold mb-4">Wind Speed Unit</h3>
          <div className="flex space-x-4">
            {['kmh', 'mph', 'ms'].map((unit) => (
              <button
                key={unit}
                onClick={() => setSettings({ ...settings, windUnit: unit })}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  settings.windUnit === unit
                    ? 'bg-white/30 text-white scale-105'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {unit.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-slide-in-left">
          <h3 className="text-white font-semibold mb-4">About</h3>
          <div className="text-white/70 space-y-2">
            <p>Weather App v2.0</p>
            <p>Built with React and Tailwind CSS</p>
            <p>Features mock data for demonstration</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} p-4 pb-24 transition-all duration-1000`}>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-down {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-in-left {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-in-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce-in {
          from { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.1); }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes fade-in-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-down { animation: slide-down 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-slide-in-left { animation: slide-in-left 0.6s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.6s ease-out; }
        .animate-slide-in-up { animation: slide-in-up 0.6s ease-out; }
        .animate-scale-in { animation: scale-in 0.6s ease-out; }
        .animate-bounce-in { animation: bounce-in 0.6s ease-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'forecast' && <ForecastPage />}
        {currentPage === 'favorites' && <FavoritesPage />}
        {currentPage === 'settings' && <SettingsPage />}
      </div>

      <Navigation />
    </div>
  );
};

export default WeatherApp;