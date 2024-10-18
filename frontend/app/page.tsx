"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  Cloud,
  Droplets,
  Thermometer,
  Wind,
  Sun,
  CloudRain,
  CloudLightning,
  CloudSnow,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MapComponent from "../component/MapComponent";


interface CurrentWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
}

interface Forecast {
  day: string;
  temp: number;
  humidity: number;
  description: string;
}

interface WeatherData {
  current: CurrentWeather;
  forecast: Forecast[];
}

const cities = [
  { value: "Mumbai", label: "Mumbai", coordinates: [72.8777, 19.0760] }, // [Longitude, Latitude]
  { value: "Bangalore", label: "Bangalore", coordinates: [77.5946, 12.9716] },
  { value: "Chennai", label: "Chennai", coordinates: [80.2707, 13.0827] },
  { value: "Kolkata", label: "Kolkata", coordinates: [88.3639, 22.5726] },
  { value: "Hyderabad", label: "Hyderabad", coordinates: [78.4867, 17.3850] },
  { value: "Delhi", label: "Delhi", coordinates: [77.1025, 28.7041] },
];

const getWeatherIcon = (description: string) => {
  switch (description?.toLowerCase()) {
    case "sunny":
    case "clear":
      return <Sun className="h-6 w-6 text-yellow-500" />;
    case "partly cloudy":
    case "clouds":
      return <Cloud className="h-6 w-6 text-gray-500" />;
    case "rain":
    case "light rain":
      return <CloudRain className="h-6 w-6 text-blue-500" />;
    case "thunderstorm":
      return <CloudLightning className="h-6 w-6 text-yellow-500" />;
    case "snow":
      return <CloudSnow className="h-6 w-6 text-blue-200" />;
    default:
      return <Cloud className="h-6 w-6 text-gray-500" />;
  }
};

// Helper function to format temperature
const formatTemperature = (temp: number) => {
  return Number(temp).toFixed(2);
};

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("Mumbai");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async (city: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://127.0.0.1:8080/weather?city=${city}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: Record<string, any> = await response.json();

      const transformedData: WeatherData = {
        current: {
          temperature: Number(data[city].current_weather.temperature),
          humidity: data[city].current_weather.humidity,
          windSpeed: data[city].current_weather.wind_speed,
          description: data[city].current_weather.condition,
        },
        forecast: data[city].forecast.list.slice(0, 5).map((item: any) => ({
          day: new Date(item.dt * 1000).toLocaleDateString("en-US", { weekday: "short" }),
          temp: Number(item.main.temp),
          humidity: item.main.humidity,
          description: item.weather[0].main,
        })),
      };

      setWeatherData(transformedData);
    } catch (error: any) {
      setError("Error fetching weather data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(selectedCity);

    const interval = setInterval(() => {
      fetchWeatherData(selectedCity);
    }, 300000);

    return () => clearInterval(interval);
  }, [selectedCity]);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl p-6 space-y-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Weather Dashboard</h1>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.value} value={city.value}>
                  {city.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperature</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTemperature(weatherData.current.temperature)}°C</div>
              <p className="text-xs text-muted-foreground">Current temperature</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Humidity</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weatherData.current.humidity}%</div>
              <p className="text-xs text-muted-foreground">Current humidity</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wind Speed</CardTitle>
              <Wind className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weatherData.current.windSpeed} km/h</div>
              <p className="text-xs text-muted-foreground">Current wind speed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Condition</CardTitle>
              {getWeatherIcon(weatherData.current.description)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weatherData.current.description}</div>
              <p className="text-xs text-muted-foreground">Current weather condition</p>
            </CardContent>
          </Card>
        </div>

        <div className="h-[400px] w-full">
          <MapComponent
            selectedCity={selectedCity}
            cities={cities}
            weatherData={weatherData}
            onCityChange={handleCityChange}
          />
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Day</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Temperature</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Humidity</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Condition</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {weatherData.forecast.map((day) => (
              <tr key={day.day} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-900">{day.day}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{day.temp.toFixed(1)}°C</td>
                <td className="px-4 py-2 text-sm text-gray-900">{day.humidity}%</td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  <div className="flex items-center">
                    {getWeatherIcon(day.description)}
                    <span className="ml-2">{day.description}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
