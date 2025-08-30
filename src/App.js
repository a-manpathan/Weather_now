import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiThunderstorm, WiFog } from 'react-icons/wi';
import { FiSearch, FiWind, FiCalendar, FiMapPin, FiTrendingUp, FiBarChart2, FiPieChart, FiActivity } from 'react-icons/fi';
import { Typewriter } from 'react-simple-typewriter';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeChart, setActiveChart] = useState('temperature');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getWeatherIcon = (condition) => {
    const iconClass = "text-8xl";
    switch (condition?.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return <WiDaySunny className={`${iconClass} text-amber-400`} />;
      case 'clouds':
      case 'cloudy':
        return <WiCloudy className={`${iconClass} text-slate-400`} />;
      case 'rain':
      case 'drizzle':
        return <WiRain className={`${iconClass} text-blue-400`} />;
      case 'snow':
        return <WiSnow className={`${iconClass} text-blue-300`} />;
      case 'thunderstorm':
        return <WiThunderstorm className={`${iconClass} text-indigo-400`} />;
      case 'mist':
      case 'fog':
        return <WiFog className={`${iconClass} text-slate-300`} />;
      default:
        return <WiDaySunny className={`${iconClass} text-amber-400`} />;
    }
  };

  const getWeatherIconSmall = (condition) => {
    const iconClass = "text-3xl";
    switch (condition?.toLowerCase()) {
      case 'clear':
        return <WiDaySunny className={`${iconClass} text-amber-400`} />;
      case 'clouds':
        return <WiCloudy className={`${iconClass} text-slate-400`} />;
      case 'rain':
        return <WiRain className={`${iconClass} text-blue-400`} />;
      case 'snow':
        return <WiSnow className={`${iconClass} text-blue-300`} />;
      case 'thunderstorm':
        return <WiThunderstorm className={`${iconClass} text-indigo-400`} />;
      case 'fog':
        return <WiFog className={`${iconClass} text-slate-300`} />;
      default:
        return <WiDaySunny className={`${iconClass} text-amber-400`} />;
    }
  };

  const getWeatherCondition = (weathercode) => {
    if (weathercode === 0) return 'Clear';
    if (weathercode >= 1 && weathercode <= 3) return 'Clouds';
    if (weathercode >= 51 && weathercode <= 67) return 'Rain';
    if (weathercode >= 71 && weathercode <= 77) return 'Snow';
    if (weathercode >= 80 && weathercode <= 82) return 'Rain';
    if (weathercode >= 95 && weathercode <= 99) return 'Thunderstorm';
    if (weathercode >= 45 && weathercode <= 48) return 'Fog';
    return 'Clear';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatDateForChart = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSearch = async () => {
    if (!city.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:5000/weather?city=${encodeURIComponent(city)}`);
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'City not found. Please try again.');
        setWeather(null);
      } else {
        setWeather({
          city: data.city,
          temperature: Math.round(data.current_weather.temperature_c),
          condition: data.current_weather.condition,
          windSpeed: Math.round(data.current_weather.windspeed_kmh),
          humidity: data.current_weather.humidity_percent,
          activitySuggestion: data.current_weather.activity_suggestion,
          latitude: data.latitude,
          longitude: data.longitude,
          dailyForecast: [...data.past_weather, ...data.daily_weather]
        });
        setError('');
      }
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      setWeather(null);
    }
    
    setLoading(false);
  };

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch (err) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCity(value);
    
    // Debounce suggestions
    clearTimeout(window.suggestionTimeout);
    window.suggestionTimeout = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSuggestionClick = async (suggestion) => {
    setCity(suggestion.name);
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Auto-fetch weather data
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:5000/weather?city=${encodeURIComponent(suggestion.name)}`);
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'City not found. Please try again.');
        setWeather(null);
      } else {
        setWeather({
          city: `${data.city}, ${suggestion.admin1 || ''}, ${suggestion.country || ''}`.replace(', , ', ', ').replace(/^, |, $/g, ''),
          temperature: Math.round(data.current_weather.temperature_c),
          condition: data.current_weather.condition,
          windSpeed: Math.round(data.current_weather.windspeed_kmh),
          humidity: data.current_weather.humidity_percent,
          activitySuggestion: data.current_weather.activity_suggestion,
          latitude: data.latitude,
          longitude: data.longitude,
          dailyForecast: [...data.past_weather, ...data.daily_weather]
        });
        setError('');
      }
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      setWeather(null);
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Prepare chart data
  const chartData = weather?.dailyForecast?.map(day => ({
    date: formatDateForChart(day.date),
    maxTemp: day.max_temp_c,
    minTemp: day.min_temp_c,
    avgTemp: Math.round((day.max_temp_c + day.min_temp_c) / 2),
    windSpeed: day.max_windspeed_kmh,
    condition: getWeatherCondition(day.weathercode)
  })) || [];

  // Weather condition distribution for pie chart
  const conditionCounts = chartData.reduce((acc, day) => {
    acc[day.condition] = (acc[day.condition] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(conditionCounts).map(([condition, count]) => ({
    name: condition,
    value: count
  }));

  const pieColors = {
    'Clear': '#f59e0b',
    'Clouds': '#94a3b8',
    'Rain': '#3b82f6',
    'Snow': '#93c5fd',
    'Thunderstorm': '#6366f1',
    'Fog': '#cbd5e1'
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/50">
          <p className="font-medium text-slate-700 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.name.includes('Temp') ? '°C' : entry.name === 'Wind Speed' ? ' km/h' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartTypes = [
    { id: 'temperature', name: 'Temperature Trend', icon: FiTrendingUp },
    { id: 'wind', name: 'Wind Speed', icon: FiBarChart2 },
    { id: 'conditions', name: 'Weather Conditions', icon: FiPieChart },
    { id: 'overview', name: 'Weather Overview', icon: FiActivity }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover"
        style={{ minWidth: '100%', minHeight: '100%' }}
      >
        <source src="https://cdn.pixabay.com/video/2024/09/21/232408_large.mp4" type="video/mp4" />
      </video>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 pt-8">
            <h1 className="text-5xl font-bold text-blue-300 mb-3 tracking-wide">
              <Typewriter
                words={['Weather Analytics']}
                loop={1}
                cursor={false}
                typeSpeed={100}
                deleteSpeed={50}
                delaySpeed={1000}
              />
            </h1>
            <p className="text-blue-300 text-lg font-bold">
              Beautiful weather insights with interactive visualizations
            </p>
          </div>

          {/* Search Card */}
          <div className="max-w-md mx-auto mb-12 relative">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <FiMapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={city}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter city name..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 bg-slate-50/50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-4 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 rounded-2xl transition-all duration-300 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FiSearch className="text-xl" />
                </button>
              </div>
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 z-[9999] max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-3 hover:bg-blue-50/70 cursor-pointer transition-colors duration-200 border-b border-slate-100 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl"
                    >
                      <div className="flex items-center gap-3">
                        <FiMapPin className="text-slate-400 text-sm" />
                        <div>
                          <p className="text-slate-700 font-medium">{suggestion.name}</p>
                          <p className="text-slate-500 text-sm">{suggestion.display}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="max-w-md mx-auto">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-white/50 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mx-auto mb-6"></div>
                <p className="text-slate-600 text-lg font-light">Fetching weather data...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="max-w-md mx-auto">
              <div className="bg-red-50/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-red-100 text-center">
                <p className="text-red-600 text-lg font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Weather Dashboard */}
          {weather && !loading && (
            <div className="space-y-8 animate-fade-in-up">
              {/* Weather Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Current Weather */}
                <div className="lg:col-span-1 h-full">
                  <div className="bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60 text-center transform transition-all duration-500 hover:shadow-2xl h-full flex flex-col justify-between">
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <FiMapPin className="text-slate-500" />
                      <h2 className="text-2xl font-light text-slate-700">{weather.city}</h2>
                    </div>
                    
                    <div className="flex justify-center mb-8">
                      {getWeatherIcon(weather.condition)}
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <p className="text-6xl font-extralight text-slate-700 mb-3">
                          {weather.temperature}°
                        </p>
                        <p className="text-slate-500 text-xl font-light capitalize">
                          {weather.condition}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-200">
                        <FiWind className="text-slate-400 text-xl" />
                        <span className="text-slate-600 text-lg font-light">
                          {weather.windSpeed} km/h
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-200">
                        <span className="text-slate-400 text-sm">Humidity:</span>
                        <span className="text-slate-600 text-lg font-light">
                          {weather.humidity}%
                        </span>
                      </div>
                      
                      <div className="mt-6 p-4 bg-blue-50/70 rounded-2xl">
                        <p className="text-slate-600 text-sm font-light leading-relaxed">
                          {weather.activitySuggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weather Averages */}
                <div className="lg:col-span-1 h-full">
                  <div className="bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60 text-center transform transition-all duration-500 hover:shadow-2xl h-full flex flex-col justify-center">
                    <h3 className="text-2xl font-light text-slate-700 mb-8">Weather Averages</h3>
                    
                    <div className="space-y-8">
                      <div>
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <WiDaySunny className="text-4xl text-amber-500" />
                          <span className="text-slate-600 font-light">Avg Temperature</span>
                        </div>
                        <p className="text-4xl font-extralight text-slate-700">
                          {weather.dailyForecast ? Math.round(weather.dailyForecast.reduce((sum, day) => sum + (day.max_temp_c + day.min_temp_c) / 2, 0) / weather.dailyForecast.length) : 0}°C
                        </p>
                      </div>
                      
                      <div className="pt-6 border-t border-slate-200">
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <FiWind className="text-4xl text-blue-500" />
                          <span className="text-slate-600 font-light">Avg Wind Speed</span>
                        </div>
                        <p className="text-4xl font-extralight text-slate-700">
                          {weather.dailyForecast ? Math.round(weather.dailyForecast.reduce((sum, day) => sum + day.max_windspeed_kmh, 0) / weather.dailyForecast.length) : 0} km/h
                        </p>
                      </div>
                      
                      <div className="pt-6 border-t border-slate-200">
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <FiMapPin className="text-4xl text-green-500" />
                          <span className="text-slate-600 font-light">Coordinates</span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-light text-slate-700">
                            Lat: {weather.latitude?.toFixed(4)}°
                          </p>
                          <p className="text-lg font-light text-slate-700">
                            Lon: {weather.longitude?.toFixed(4)}°
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 14-Day Forecast */}
                <div className="lg:col-span-1 h-full">
                  <div className="bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                      <FiCalendar className="text-slate-500 text-xl" />
                      <h3 className="text-2xl font-light text-slate-700">14-Day Forecast</h3>
                    </div>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                      {weather.dailyForecast && weather.dailyForecast.map((day, index) => {
                        const condition = getWeatherCondition(day.weathercode);
                        const isToday = index === weather.dailyForecast.length - 1;
                        
                        return (
                          <div 
                            key={day.date} 
                            className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 hover:bg-blue-50/70 ${
                              isToday ? 'bg-blue-100/80 border border-blue-200/60 shadow-sm' : 'bg-slate-50/50 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              {getWeatherIconSmall(condition)}
                              <div>
                                <p className={`font-medium ${
                                  isToday ? 'text-slate-700' : 'text-slate-600'
                                }`}>
                                  {formatDate(day.date)}
                                </p>
                                <p className="text-slate-400 text-sm capitalize font-light">
                                  {condition}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className={`font-medium text-lg ${
                                  isToday ? 'text-slate-700' : 'text-slate-600'
                                }`}>
                                  {Math.round(day.max_temp_c)}°
                                </p>
                                <p className="text-slate-400 text-sm font-light">
                                  {Math.round(day.min_temp_c)}°
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2 text-slate-400 min-w-[60px]">
                                <FiWind className="text-sm" />
                                <span className="text-sm font-light">
                                  {Math.round(day.max_windspeed_kmh)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Selection */}
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/60">
                <div className="flex flex-wrap gap-3 mb-6">
                  {chartTypes.map((chart) => {
                    const Icon = chart.icon;
                    return (
                      <button
                        key={chart.id}
                        onClick={() => setActiveChart(chart.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300 ${
                          activeChart === chart.id
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Icon className="text-sm" />
                        <span className="text-sm font-medium">{chart.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="h-96">
                  {activeChart === 'temperature' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="maxTempGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="minTempGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="maxTemp"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          fill="url(#maxTempGradient)"
                          name="Max Temp"
                        />
                        <Area
                          type="monotone"
                          dataKey="minTemp"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          fill="url(#minTempGradient)"
                          name="Min Temp"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  {activeChart === 'wind' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="windSpeed"
                          fill="#3b82f6"
                          name="Wind Speed"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {activeChart === 'conditions' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          innerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                          label={({name, value}) => `${name}: ${value}`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[entry.name] || '#94a3b8'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}

                  {activeChart === 'overview' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                        <YAxis yAxisId="temp" orientation="left" stroke="#64748b" fontSize={12} />
                        <YAxis yAxisId="wind" orientation="right" stroke="#64748b" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          yAxisId="temp"
                          type="monotone"
                          dataKey="avgTemp"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                          name="Avg Temp"
                        />
                        <Line
                          yAxisId="wind"
                          type="monotone"
                          dataKey="windSpeed"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          name="Wind Speed"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(148, 163, 184, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;