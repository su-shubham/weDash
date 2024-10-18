package main

import (
    "encoding/json"
    "fmt"
    "io/ioutil"
    "log"
    "net/http"
    "os"
    "sync"
    "time"
    "weather-monitoring/internal/alerts"
    "weather-monitoring/internal/api"
    "weather-monitoring/internal/storage"

    "gopkg.in/yaml.v2"
    "github.com/gorilla/handlers" // Importing gorilla/handlers for CORS
    "github.com/joho/godotenv"     // Importing godotenv to load .env file
)

// Config structure for application configuration
type Config struct {
    APIKey             string   `yaml:"openweather_api_key"`
    PollInterval       int      `yaml:"poll_interval"`
    DBPath             string   `yaml:"db_path"`
    AlertTempThreshold float64  `yaml:"alert_temp_threshold"`
    AlertConsecutive   int      `yaml:"alert_consecutive_updates"`
    Cities             []string `yaml:"cities"`
}

// WeatherData structure for storing weather information
type WeatherData struct {
    City        string  `json:"city"`
    Temperature float64 `json:"temperature"`
    Condition   string  `json:"condition"`
    Humidity    int     `json:"humidity"`
    WindSpeed   float64 `json:"wind_speed"`
}

var (
    weatherCache = make(map[string]WeatherData)
    mu           sync.Mutex // Protect access to weatherCache
    config       Config     // Global config variable
)

// Load configuration from YAML file
func loadConfig() (Config, error) {
    var config Config

    // Load environment variables from .env file
    err := godotenv.Load()
    if err != nil {
        log.Println("Error loading .env file")
    }

    data, err := ioutil.ReadFile("config/config.yaml")
    if err != nil {
        return config, err
    }
    err = yaml.Unmarshal(data, &config)
    if err != nil {
        log.Println("Failed to parse config.yaml:", err)
    }

    // Set API Key from environment variable
    config.APIKey = os.Getenv("OPENWEATHER_API_KEY")
    if config.APIKey == "" {
        return config, fmt.Errorf("OPENWEATHER_API_KEY is not set in the environment")
    }

    return config, err
}

// Monitor weather for a specific city
func monitorWeather(city string) {
    // Fetch initial weather data
    weatherData, err := api.FetchWeatherData(config.APIKey, city)
    if err != nil {
        log.Printf("Error fetching weather data for %s: %v", city, err)
        return
    }

    // Update the cache with initial weather data
    mu.Lock()
    weatherCache[city] = WeatherData{
        City:        city,
        Temperature: weatherData.Main.Temp,
        Condition:   weatherData.Weather[0].Main,
        Humidity:    weatherData.Main.Humidity,
        WindSpeed:   weatherData.Wind.Speed,
    }
    mu.Unlock()

    // Check for alerts
    alerts.CheckAndAlert(city, weatherData.Main.Temp, config.AlertTempThreshold, config.AlertConsecutive)

    // Set up periodic fetching of weather data
    ticker := time.NewTicker(time.Duration(config.PollInterval) * time.Minute)

    for range ticker.C {
        weatherData, err := api.FetchWeatherData(config.APIKey, city)
        if err != nil {
            log.Printf("Error fetching weather data for %s: %v", city, err)
            continue
        }

        // Update the cache with latest weather data
        mu.Lock()
        weatherCache[city] = WeatherData{
            City:        city,
            Temperature: weatherData.Main.Temp,
            Condition:   weatherData.Weather[0].Main,
            Humidity:    weatherData.Main.Humidity,
            WindSpeed:   weatherData.Wind.Speed,
        }
        mu.Unlock()

        // Check for alerts
        alerts.CheckAndAlert(city, weatherData.Main.Temp, config.AlertTempThreshold, config.AlertConsecutive)
    }
}

// HTTP handler to serve weather and forecast data
func weatherHandler(w http.ResponseWriter, r *http.Request) {
    mu.Lock()
    defer mu.Unlock()

    w.Header().Set("Content-Type", "application/json")

    combinedWeatherData := make(map[string]interface{})

    for city, weather := range weatherCache {
        // Fetch forecast data for the city
        forecastData, err := api.FetchForecastData(config.APIKey, city) // Use global config here
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }

        // Prepare combined data
        combinedWeatherData[city] = map[string]interface{}{
            "current_weather": weather,
            "forecast":        forecastData,
        }
    }

    if err := json.NewEncoder(w).Encode(combinedWeatherData); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
    }
}

// Main function to start the application
func main() {
    var err error
    config, err = loadConfig() // Load config and assign to global variable
    if err != nil {
        log.Fatalf("Error loading config: %v", err)
    }

    db, err := storage.InitDB(config.DBPath)
    if err != nil {
        log.Fatalf("Error initializing database: %v", err)
    }
    defer db.Close()

    log.Printf("Monitoring weather for cities: %v", config.Cities)

    // Start monitoring weather for each city in a separate goroutine
    for _, city := range config.Cities {
        go monitorWeather(city) // No need to pass config here
    }

    // Start the HTTP server with CORS enabled
    http.HandleFunc("/weather", weatherHandler)
    log.Println("Starting HTTP server on :8080")

    // Setting up CORS for the server
    allowedOrigins := handlers.AllowedOrigins([]string{"*"}) // Change to your allowed origins
    allowedMethods := handlers.AllowedMethods([]string{"GET", "POST", "OPTIONS"})
    allowedHeaders := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})

    log.Fatal(http.ListenAndServe(":8080", handlers.CORS(allowedOrigins, allowedMethods, allowedHeaders)(http.DefaultServeMux)))
}
