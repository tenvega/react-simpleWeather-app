import { useState } from 'react'
import './App.css'

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const API_KEY = '9014ae8a0d144222c10e8ba4a2aeb610'

  const getWeather = async () => {
    if (city.trim() === '') return
    setLoading(true)
    setError('')
  
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      )
  
      if (!response.ok) {
        throw new Error('City not found')
      }
  
      const data = await response.json()

      setWeather({
        name: data.name,
        temp: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon
          })
    } catch (err) {
      setError(err.message)
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if(e.key === 'Enter') {
      getWeather()
    }
  }

  return (
    <div className="app-container">
      <h1>Weather App</h1>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Enter city name"
      />
      <button onClick={getWeather} disabled={loading}>
        {loading ? 'Loading...' : 'Get Weather'}</button>

        {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-display">
          <h2>{weather.name}</h2>
          <img 
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={weather.description}
          />
          <p className="temp">{weather.temp}°C</p>
          <p className="description">{weather.description}</p>
        </div>
      )}
    </div>
        
  )
}

export default App
