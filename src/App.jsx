import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Thermometer, Droplets, Wind, Eye, Gauge,
  Sun, Cloud, CloudRain, CloudSnow, Zap, Calendar,
  TrendingUp, Settings as SettingsIcon, Home, Info,
  ChevronRight, Sunrise, Sunset, Navigation as NavIcon,
  Heart, Github, RefreshCw, X, Menu
} from 'lucide-react';
import { fetchWeather, fetchWeatherByCoords, fetchForecast, fetchAirQuality } from './services/weatherService';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind class merging
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const WeatherIcon = ({ condition, className = "w-8 h-8" }) => {
  const icons = {
    Clear: Sun,
    Clouds: Cloud,
    Rain: CloudRain,
    Drizzle: CloudRain,
    Thunderstorm: Zap,
    Snow: CloudSnow,
    Mist: Cloud,
    Smoke: Cloud,
    Haze: Cloud,
    Dust: Cloud,
    Fog: Cloud,
    Sand: Cloud,
    Ash: Cloud,
    Squall: Wind,
    Tornado: Zap,
  };

  const Icon = icons[condition] || Cloud;
  return <Icon className={className} />;
};

const App = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [city, setCity] = useState('');
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('weatherSearchHistory');
    return saved ? JSON.parse(saved) : ['New Delhi', 'London', 'New York'];
  });
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('weatherFavorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentPage, setCurrentPage] = useState('home');
  const [units, setUnits] = useState('metric'); // metric (C) or imperial (F)

  const handleSearch = useCallback(async (searchCity) => {
    if (!searchCity?.trim()) return;
    setLoading(true);
    setError('');
    try {
      const weatherData = await fetchWeather(searchCity, units);
      setWeather(weatherData);

      const forecastData = await fetchForecast(weatherData.coord.lat, weatherData.coord.lon, units);
      setForecast(forecastData);

      const aqiData = await fetchAirQuality(weatherData.coord.lat, weatherData.coord.lon);
      setAqi(aqiData);

      // Update history
      const newHistory = [searchCity, ...searchHistory.filter(c => c.toLowerCase() !== searchCity.toLowerCase())].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('weatherSearchHistory', JSON.stringify(newHistory));

      setCity('');
    } catch (err) {
      setError(err.message || 'Error fetching weather data');
    } finally {
      setLoading(false);
    }
  }, [searchHistory, units]);

  const handleLocationSearch = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const [weatherData, forecastData, aqiData] = await Promise.all([
            fetchWeatherByCoords(latitude, longitude, units),
            fetchForecast(latitude, longitude, units),
            fetchAirQuality(latitude, longitude)
          ]);

          setWeather(weatherData);
          setForecast(forecastData);
          setAqi(aqiData);
        } catch (err) {
          setError('Failed to get weather for your location');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError('Location access denied. Please allow location permissions.');
        setLoading(false);
      }
    );
  }, [units]);

  useEffect(() => {
    // Try to get location on mount
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => handleLocationSearch(),
        () => handleSearch('New Delhi') // Fallback to New Delhi if denied/failed
      );
    } else {
      handleSearch('New Delhi');
    }
  }, []);

  useEffect(() => {
    if (weather) {
      handleSearch(weather.name);
    }
  }, [units]);

  const toggleFavorite = (city) => {
    const newFavorites = favorites.includes(city)
      ? favorites.filter(f => f !== city)
      : [...favorites, city];
    setFavorites(newFavorites);
    localStorage.setItem('weatherFavorites', JSON.stringify(newFavorites));
  };

  const getBgGradient = () => {
    if (!weather) return 'from-slate-900 to-slate-800';
    const condition = weather.weather[0].main;
    switch (condition) {
      case 'Clear': return 'from-blue-400 via-blue-500 to-indigo-600';
      case 'Clouds': return 'from-slate-400 via-slate-500 to-slate-700';
      case 'Rain': case 'Drizzle': return 'from-blue-600 via-indigo-700 to-slate-900';
      case 'Thunderstorm': return 'from-slate-800 via-purple-900 to-black';
      case 'Snow': return 'from-blue-100 via-blue-200 to-slate-400';
      default: return 'from-blue-500 via-blue-600 to-indigo-800';
    }
  };

  return (
    <div className={cn(
      "min-h-screen text-white overflow-x-hidden transition-all duration-1000 bg-gradient-to-br",
      getBgGradient()
    )}>
      {/* Search Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="Search city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(city)}
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all placeholder:text-white/40"
            />
          </div>
          <button
            onClick={handleLocationSearch}
            className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-white/20 transition-all active:scale-95"
          >
            <NavIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-4 max-w-4xl mx-auto space-y-8">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-2xl text-center"
            >
              {error}
              <button onClick={() => setError('')} className="ml-2 hover:text-white/70 font-bold">×</button>
            </motion.div>
          )}

          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <RefreshCw className="w-12 h-12 animate-spin text-white/50" />
              <p className="text-white/50 font-medium">Updating weather...</p>
            </motion.div>
          ) : weather && (
            <motion.div
              key="content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Hero Section */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 opacity-70" />
                  <h1 className="text-3xl font-bold tracking-tight">{weather.name}, {weather.sys.country}</h1>
                  <button onClick={() => toggleFavorite(weather.name)} className="ml-1">
                    <Heart className={cn("w-6 h-6 transition-colors", favorites.includes(weather.name) ? "fill-red-500 text-red-500" : "text-white/50 hover:text-white")} />
                  </button>
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative">
                    <WeatherIcon condition={weather.weather[0].main} className="w-32 h-32 text-white animate-float" />
                    <div className="absolute inset-0 bg-white/20 blur-3xl -z-10 rounded-full" />
                  </div>
                  <div className="text-8xl font-black text-glow tracking-tighter">
                    {Math.round(weather.main.temp)}°
                  </div>
                  <p className="text-xl font-medium text-white/80 capitalize">{weather.weather[0].description}</p>
                </div>

                <div className="flex justify-center gap-4 mt-4">
                  <span className="bg-white/10 px-4 py-1 rounded-full text-sm font-medium border border-white/10">H: {Math.round(weather.main.temp_max)}°</span>
                  <span className="bg-white/10 px-4 py-1 rounded-full text-sm font-medium border border-white/10">L: {Math.round(weather.main.temp_min)}°</span>
                </div>
              </div>

              {/* Quick Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DetailCard icon={Droplets} label="Humidity" value={`${weather.main.humidity}%`} />
                <DetailCard icon={Wind} label="Wind Speed" value={`${weather.wind.speed} m/s`} />
                <DetailCard icon={Thermometer} label="Feels Like" value={`${Math.round(weather.main.feels_like)}°`} />
                <DetailCard icon={Eye} label="Visibility" value={`${(weather.visibility / 1000).toFixed(1)} km`} />
                <DetailCard icon={Gauge} label="Pressure" value={`${weather.main.pressure} hPa`} />
                <DetailCard icon={Sun} label="AQI" value={aqi?.list[0]?.main?.aqi || 'N/A'} subValue={getAQIDescription(aqi?.list[0]?.main?.aqi)} />
              </div>

              {/* Hourly Forecast */}
              {forecast && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Calendar className="w-5 h-5 opacity-70" />
                    Hourly Forecast
                  </h3>
                  <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                    {forecast.list.slice(0, 12).map((item, idx) => (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx}
                        className="flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-28 text-center space-y-2 hover:bg-white/20 transition-all cursor-default"
                      >
                        <p className="text-xs text-white/60 font-medium">
                          {new Date(item.dt * 1000).getHours()}:00
                        </p>
                        <WeatherIcon condition={item.weather[0].main} className="w-8 h-8 mx-auto" />
                        <p className="text-lg font-bold">{Math.round(item.main.temp)}°</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5-Day Forecast */}
              {forecast && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 opacity-70" />
                    Next 5 Days
                  </h3>
                  <div className="space-y-3">
                    {getDailyForecast(forecast.list).map((day, idx) => (
                      <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/15 transition-all">
                        <p className="font-semibold w-24">{day.date}</p>
                        <div className="flex items-center gap-3">
                          <WeatherIcon condition={day.condition} className="w-6 h-6" />
                          <p className="text-sm font-medium w-32 capitalize whitespace-nowrap overflow-hidden text-ellipsis">{day.description}</p>
                        </div>
                        <div className="flex gap-4">
                          <span className="font-bold">{Math.round(day.temp_max)}°</span>
                          <span className="text-white/40">{Math.round(day.temp_min)}°</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Footer */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 glass rounded-full px-6 py-3 flex gap-8 z-50">
        <NavButton active={currentPage === 'home'} onClick={() => setCurrentPage('home')} icon={Home} label="Home" />
        <NavButton active={currentPage === 'favorites'} onClick={() => setCurrentPage('favorites')} icon={Heart} label="Favorites" />
        <NavButton active={currentPage === 'settings'} onClick={() => setCurrentPage('settings')} icon={SettingsIcon} label="Settings" />
      </nav>

      {/* Favorites Sidebar/Overlay */}
      <AnimatePresence>
        {currentPage === 'favorites' && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-xl p-8"
          >
            <div className="max-w-xl mx-auto space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black">Favorites</h2>
                <button onClick={() => setCurrentPage('home')} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-8 h-8" />
                </button>
              </div>
              <div className="grid gap-4">
                {favorites.length > 0 ? favorites.map((fav, idx) => (
                  <div key={idx} className="bg-white/10 p-6 rounded-3xl flex justify-between items-center group">
                    <div>
                      <h3 className="text-xl font-bold">{fav}</h3>
                      <button
                        onClick={() => { handleSearch(fav); setCurrentPage('home'); }}
                        className="text-white/50 text-sm hover:text-white transition-colors"
                      >
                        View Details →
                      </button>
                    </div>
                    <button onClick={() => toggleFavorite(fav)} className="p-2 opacity-0 group-hover:opacity-100 transition-all hover:text-red-500">
                      <Heart className="fill-red-500" />
                    </button>
                  </div>
                )) : (
                  <div className="text-center py-20 opacity-30">
                    <Heart className="w-16 h-16 mx-auto mb-4" />
                    <p>No favorites yet</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Overlay */}
      <AnimatePresence>
        {currentPage === 'settings' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-2xl p-8"
          >
            <div className="max-w-xl mx-auto space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black">Settings</h2>
                <button onClick={() => setCurrentPage('home')} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="glass p-6 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3 text-white/70">
                    <Thermometer className="w-5 h-5" />
                    <span className="font-bold uppercase tracking-wider text-xs">Temperature Units</span>
                  </div>
                  <div className="flex bg-white/5 p-1 rounded-2xl">
                    <button
                      onClick={() => setUnits('metric')}
                      className={cn("flex-1 py-3 rounded-xl transition-all font-bold", units === 'metric' ? "bg-white text-slate-900 shadow-xl" : "text-white/50 hover:text-white")}
                    >
                      Celsius (°C)
                    </button>
                    <button
                      onClick={() => setUnits('imperial')}
                      className={cn("flex-1 py-3 rounded-xl transition-all font-bold", units === 'imperial' ? "bg-white text-slate-900 shadow-xl" : "text-white/50 hover:text-white")}
                    >
                      Fahrenheit (°F)
                    </button>
                  </div>
                </div>

                <div className="glass p-6 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3 text-white/70">
                    <Info className="w-5 h-5" />
                    <span className="font-bold uppercase tracking-wider text-xs">About Weather Pro</span>
                  </div>
                  <div className="space-y-4 text-white/60 leading-relaxed">
                    <p>Weather Pro v3.0 provides real-time weather data, 5-day forecasts, and air quality information powered by OpenWeatherMap.</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">React 19</span>
                      <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">Tailwind 4</span>
                      <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">Framer Motion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailCard = ({ icon: Icon, label, value, subValue }) => (
  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:bg-white/20 transition-all space-y-3">
    <div className="flex items-center gap-2 text-white/50">
      <Icon className="w-4 h-4" />
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </div>
    <div className="space-y-1">
      <div className="text-2xl font-black">{value}</div>
      {subValue && <div className="text-sm font-medium opacity-70">{subValue}</div>}
    </div>
  </div>
);

const NavButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "relative p-2 transition-all transition-colors",
      active ? "text-white" : "text-white/40 hover:text-white/70"
    )}
  >
    <Icon className="w-6 h-6" />
    {active && (
      <motion.div
        layoutId="nav-glow"
        className="absolute -inset-2 bg-white/20 blur-lg rounded-full -z-10"
      />
    )}
  </button>
);

const getDailyForecast = (list) => {
  const daily = [];
  const seenDays = new Set();

  list.forEach(item => {
    const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    if (!seenDays.has(date) && date !== today && daily.length < 5) {
      seenDays.add(date);
      daily.push({
        date,
        temp_max: item.main.temp_max,
        temp_min: item.main.temp_min,
        condition: item.weather[0].main,
        description: item.weather[0].description
      });
    }
  });

  return daily;
};

const getAQIDescription = (aqi) => {
  const levels = {
    1: 'Good',
    2: 'Fair',
    3: 'Moderate',
    4: 'Poor',
    5: 'Very Poor'
  };
  return levels[aqi] || 'Unknown';
};

export default App;