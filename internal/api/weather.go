package api

import (
    "encoding/json"
    "fmt"
    "net/http"
)

type WeatherResponse struct {
    Main struct {
        Temp      float64 `json:"temp"`
        FeelsLike float64 `json:"feels_like"`
        Humidity  int     `json:"humidity"`
    } `json:"main"`
    Weather []struct {
        Main string `json:"main"`
    } `json:"weather"`
    Wind struct {
        Speed float64 `json:"speed"`
    } `json:"wind"`
    Dt int64 `json:"dt"`
}

type ForecastResponse struct {
    List []struct {
        Main struct {
            Temp     float64 `json:"temp"`
            Humidity int     `json:"humidity"`
        } `json:"main"`
        Weather []struct {
            Main string `json:"main"`
        } `json:"weather"`
        Wind struct {
            Speed float64 `json:"speed"`
        } `json:"wind"`
        Dt int64 `json:"dt"`
    } `json:"list"`
}

// FetchWeatherData fetches current weather data for a given city
func FetchWeatherData(apiKey, city string) (WeatherResponse, error) {
    url := fmt.Sprintf("https://api.openweathermap.org/data/2.5/weather?q=%s&appid=%s", city, apiKey)
    resp, err := http.Get(url)
    if err != nil {
        return WeatherResponse{}, err
    }
    defer resp.Body.Close()

    var weatherResp WeatherResponse
    if err := json.NewDecoder(resp.Body).Decode(&weatherResp); err != nil {
        return WeatherResponse{}, err
    }

    // Convert Kelvin to Celsius
    weatherResp.Main.Temp -= 273.15
    weatherResp.Main.FeelsLike -= 273.15

    return weatherResp, nil
}

// FetchForecastData fetches 5-day weather forecast data for a given city
func FetchForecastData(apiKey, city string) (ForecastResponse, error) {
    url := fmt.Sprintf("https://api.openweathermap.org/data/2.5/forecast?q=%s&appid=%s", city, apiKey)
    resp, err := http.Get(url)
    if err != nil {
        return ForecastResponse{}, err
    }
    defer resp.Body.Close()

    var forecastResp ForecastResponse
    if err := json.NewDecoder(resp.Body).Decode(&forecastResp); err != nil {
        return ForecastResponse{}, err
    }

    // Convert temperatures from Kelvin to Celsius
    for i := range forecastResp.List {
        forecastResp.List[i].Main.Temp -= 273.15
    }

    return forecastResp, nil
}
