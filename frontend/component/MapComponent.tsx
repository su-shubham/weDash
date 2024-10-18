import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactDOMServer from 'react-dom/server';

import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, HelpCircle, LocateIcon } from 'lucide-react';

interface WeatherData {
  [key: string]: {
    temperature: number;
    description: string;
  };
}

interface MapComponentProps {
  selectedCity: string;
  cities: { value: string; label: string; coordinates: [number, number] }[];
  weatherData: WeatherData | null;
  onCityChange: (city: string) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  selectedCity,
  cities,
  weatherData,
  onCityChange,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(72.8777);
  const [lat, setLat] = useState(19.0760);
  const [zoom, setZoom] = useState(9);

  // Initialize Mapbox map
  useEffect(() => {
    if (map.current) return; // Prevent re-initialization

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    if (!mapboxgl.accessToken) {
      console.error('Mapbox access token is not set');
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on('move', () => {
      if (map.current) {
        setLng(parseFloat(map.current.getCenter().lng.toFixed(4)));
        setLat(parseFloat(map.current.getCenter().lat.toFixed(4)));
        setZoom(parseFloat(map.current.getZoom().toFixed(2)));
      }
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
  }, []);

  // Update markers when city or weather data changes
  useEffect(() => {
    if (!map.current || !weatherData) return;

    // Clear existing markers
    document.querySelectorAll('.mapboxgl-marker').forEach((marker) => marker.remove());

    cities.forEach((city) => {
      const { coordinates, value, label } = city;
      const cityWeather = weatherData[value] || { temperature: 0, description: 'Unknown' };
      console.log(cityWeather)
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <h3>${label}</h3>
        <p>Temperature: ${cityWeather.temperature}°C</p>
        <p>Condition: ${cityWeather.description}</p>
      `);

      const markerElement = document.createElement('div');
      markerElement.className = 'marker';
      markerElement.style.width = '40px';
      markerElement.style.height = '40px';
      markerElement.style.transition = 'transform 0.5s'; // Smooth animation

      // Set the weather icon inside the marker
      const IconComponent = getWeatherIcon(cityWeather.description);
      markerElement.innerHTML = ReactDOMServer.renderToString(IconComponent); // Render icon to HTML string

      // Zoom-in effect on hover
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.5)';
      });
      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)';
      });

      markerElement.addEventListener('click', () => onCityChange(value));

      new mapboxgl.Marker(markerElement)
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [selectedCity, weatherData]); // Update when selected city or weather changes

  // Smooth flyTo animation on city selection
  useEffect(() => {
    const selectedCityData = cities.find((city) => city.value === selectedCity);
    if (selectedCityData && map.current) {
      map.current.flyTo({
        center: selectedCityData.coordinates,
        zoom: 9,
        essential: true, // Ensures animation even if user prefers reduced motion
      });
    }
  }, [selectedCity]);

  return (
    <>
      <style jsx>{`
        @keyframes sunny {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes cloudy {
          0% { transform: translateX(0); }
          50% { transform: translateX(10px); }
          100% { transform: translateX(0); }
        }
        @keyframes rainy {
          0% { transform: translateY(0); }
          50% { transform: translateY(10px); }
          100% { transform: translateY(0); }
        }
        @keyframes snowy {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(10px) rotate(180deg); }
          100% { transform: translateY(0) rotate(360deg); }
        }
        .weather-icon {
          display: inline-block;
        }
        .weather-icon.sunny { animation: sunny 10s linear infinite; }
        .weather-icon.cloudy { animation: cloudy 3s ease-in-out infinite; }
        .weather-icon.rainy { animation: rainy 2s ease-in-out infinite; }
        .weather-icon.snowy { animation: snowy 3s ease-in-out infinite; }
      `}</style>
      <div ref={mapContainer} className="map-container" style={{ height: '100%', width: '100%' }} />
    </>
  );
};

export default MapComponent;

function getWeatherIcon(description: string): JSX.Element {
    const normalizedDescription = description.trim().toLowerCase();
    console.log('Weather description:', normalizedDescription);
  
    const iconMapping: Record<string, JSX.Element> = {
      sunny: <div className="weather-icon sunny"><Sun color="orange" size={30} /></div>,
      clear: <div className="weather-icon sunny"><Sun color="orange" size={30} /></div>,
      'partly cloudy': <div className="weather-icon cloudy"><Cloud color="gray" size={30} /></div>,
      clouds: <div className="weather-icon cloudy"><Cloud color="gray" size={30} /></div>,
      rain: <div className="weather-icon rainy"><CloudRain color="blue" size={30} /></div>,
      'light rain': <div className="weather-icon rainy"><CloudRain color="blue" size={30} /></div>,
      thunderstorm: <div className="weather-icon rainy"><CloudLightning color="purple" size={30} /></div>,
      snow: <div className="weather-icon snowy"><Snowflake color="lightblue" size={30} /></div>,
      'overcast': <div className="weather-icon cloudy"><Cloud color="gray" size={30} /></div>,
      'drizzle': <div className="weather-icon rainy"><CloudRain color="lightblue" size={30} /></div>,
      'fog': <div className="weather-icon"><HelpCircle color="gray" size={30} /></div>,
      'unknown': <div className="weather-icon"><LocateIcon color="red" size={30} /></div>,
    };
  
    if (!(normalizedDescription in iconMapping)) {
      console.warn(`No icon found for weather description: "${normalizedDescription}". Using fallback icon.`);
      return <div className="weather-icon"><HelpCircle color="gray" size={30} /></div>;
    }
  
    return iconMapping[normalizedDescription];
  }
  