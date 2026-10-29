const RAIN_THRESHOLD_MM = 0.05;
const FALLBACK_LATITUDE = 37.1023;
const FALLBACK_LONGITUDE = -85.3061;

function toCoordinate(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

/**
 * Load a short-range rain timing forecast for a coordinate pair.
 * Missing coordinates fall back to a default point in south-central Kentucky.
 * @param {{ latitude?: number, longitude?: number }} [coords]
 */
export async function fetchRainAlert(coords) {
  const latitude = coords?.latitude;
  const longitude = coords?.longitude;
  const hasLatitude = Number.isFinite(Number(latitude));
  const hasLongitude = Number.isFinite(Number(longitude));
  const resolvedLatitude = toCoordinate(latitude, FALLBACK_LATITUDE);
  const resolvedLongitude = toCoordinate(longitude, FALLBACK_LONGITUDE);
  const usedFallbackLocation = !hasLatitude || !hasLongitude;

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(resolvedLatitude));
  url.searchParams.set("longitude", String(resolvedLongitude));
  url.searchParams.set("current", "rain,precipitation");
  url.searchParams.set("minutely_15", "precipitation");
  url.searchParams.set("forecast_minutely_15", "8");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("timeformat", "unixtime");

  const forecastResponse = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!forecastResponse.ok) {
    throw new Error("Unable to load rain forecast right now.");
  }

  const forecast = await forecastResponse.json();
  const currentRain = Number(forecast?.current?.rain ?? forecast?.current?.precipitation ?? 0);
  const currentTime = Number(forecast?.current?.time ?? Math.floor(Date.now() / 1000));
  const forecastTimes = forecast?.minutely_15?.time || [];
  const precipitationValues = forecast?.minutely_15?.precipitation || [];
  const nextRainIndex = precipitationValues.findIndex((value) => Number(value || 0) > RAIN_THRESHOLD_MM);

  if (currentRain > RAIN_THRESHOLD_MM) {
    return {
      status: "rain_now",
      minutesUntilRain: 0,
      nextRainAt: currentTime,
      usedFallbackLocation,
    };
  }

  if (nextRainIndex === -1 || !forecastTimes[nextRainIndex]) {
    return {
      status: "dry",
      minutesUntilRain: null,
      nextRainAt: null,
      usedFallbackLocation,
    };
  }

  const nextRainAt = Number(forecastTimes[nextRainIndex]);
  const minutesUntilRain = Math.max(0, Math.round((nextRainAt - currentTime) / 60));

  return {
    status: "rain_soon",
    minutesUntilRain,
    nextRainAt,
    usedFallbackLocation,
  };
}
