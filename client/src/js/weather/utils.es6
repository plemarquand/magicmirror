const iconTable = {
  '01d': 'wi-day-sunny',
  '02d': 'wi-day-cloudy',
  '03d': 'wi-cloudy',
  '04d': 'wi-cloudy-windy',
  '09d': 'wi-showers',
  '10d': 'wi-rain',
  '11d': 'wi-thunderstorm',
  '13d': 'wi-snow',
  '50d': 'wi-fog',
  '01n': 'wi-night-clear',
  '02n': 'wi-night-cloudy',
  '03n': 'wi-night-cloudy',
  '04n': 'wi-night-cloudy',
  '09n': 'wi-night-showers',
  '10n': 'wi-night-rain',
  '11n': 'wi-night-thunderstorm',
  '13n': 'wi-night-snow',
  '50n': 'wi-night-alt-cloudy-windy'
};

const beafortSpeeds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 1000];

export const weatherIcon = (weather) => iconTable[weather.weather[0].icon];
export const sunrise = (weather) => new Date(weather.sys.sunrise * 1000).toTimeString().substring(0, 5);
export const sunset = (weather) => new Date(weather.sys.sunset * 1000).toTimeString().substring(0, 5);
export const kmh2beafort = (weather) => {
  const kmh = weather.wind.speed;
  for (var beafort in beafortSpeeds) {
    const speed = beafortSpeeds[beafort];
    if (speed > kmh) {
      return beafort;
    }
  }
  return 12;
}
export const windDirectionIcon = (weather) => {
  const deg = weather.wind.deg - (weather.wind.deg % 15);
  return `wi-wind-default _${deg}-deg`;
}
export const beafortIcon = (weather) => 'wi-beafort-' + kmh2beafort(weather);