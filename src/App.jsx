import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

  const getWeather = async () => {
    if (city.trim() === '') return
    setLoading(true)
    setError('')
  
    try {
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      )
  
      if (!currentResponse.ok) {
        throw new Error('City not found')
      }
  
      const currentData = await currentResponse.json()

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
      )

      const forecastData = await forecastResponse.json()

      setWeather({
        name: currentData.name,
        temp: Math.round(currentData.main.temp),
        feelsLike: Math.round(currentData.main.feels_like),  // FIXED: Added this line
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon,
        humidity: currentData.main.humidity,
        windSpeed: currentData.wind.speed,  
        pressure: currentData.main.pressure
      })

      const dailyForecast = forecastData.list.filter(item => 
        item.dt_txt.includes("12:00:00")
      ).slice(0, 5)

      setForecast(dailyForecast.map(item => ({
        date: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon,
        description: item.weather[0].description,
      })))      

    } catch (err) {
      setError(err.message)
      setWeather(null)
      setForecast(null)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if(e.key === 'Enter') {
      getWeather()
    }
  }

  // Function to determine background theme based on weather and time
  const getWeatherTheme = () => {
    if (!weather) return ''

    const currentHour = new Date().getHours()
    const isNight = currentHour < 6 || currentHour > 20

    if (isNight) return 'night'

    const description = weather.description.toLowerCase()

    if (description.includes('rain') || description.includes('drizzle') || description.includes('thunderstorm')) {
      return 'rainy'
    } else if (description.includes('cloud') || description.includes('mist') || description.includes('fog')) {
      return 'cloudy'
    } else {
      return 'sunny'
    }
  }

  // Update body class when weather changes
  useEffect(() => {
    const theme = getWeatherTheme()
    document.body.className = theme

    return () => {
      document.body.className = ''
    }
  }, [weather])

  return (
    <div className={`app-container ${weather ? 'expanded' : ''}`}>
      <h1>Weather App</h1>
      <div className="search-container">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Enter city name"
        />
        <button onClick={getWeather} disabled={loading}>
          {loading ? 'Loading...' : 'Get Weather'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-wrapper">
          <div className="weather-display">
            <h2>{weather.name}</h2>
            <img 
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.description}
            />
            <p className="temp">{weather.temp}°C</p>
            <p className="description">{weather.description}</p>
            
            <div className='weather-details'>
              <div className="detail-item">
                <span className="detail-label">Feels Like</span>
                <span className="detail-value">{weather.feelsLike}°C</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Humidity</span>
                <span className="detail-value">{weather.humidity}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Wind Speed</span>
                <span className="detail-value">{weather.windSpeed} m/s</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Pressure</span>
                <span className="detail-value">{weather.pressure} hPa</span>
              </div>
            </div>
          </div>

          {forecast && (
            <div className="forecast-container">
              <h3>5-Day Forecast</h3>
              <div className="forecast-grid">
                {forecast.map((day, index) => (
                  <div key={index} className="forecast-item">
                    <p className="forecast-date">{day.date}</p>
                    <img 
                      src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                      alt={day.description}
                    />
                    <p className="forecast-temp">{day.temp}°C</p>
                    <p className="forecast-desc">{day.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
