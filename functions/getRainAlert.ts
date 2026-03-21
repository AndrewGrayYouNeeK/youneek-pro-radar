Deno.serve(async (req) => {
  try {
    const payload = await req.json().catch(() => ({}));
    const hasLatitude = Number.isFinite(Number(payload?.latitude));
    const hasLongitude = Number.isFinite(Number(payload?.longitude));
    const latitude = hasLatitude ? Number(payload.latitude) : 37.1023;
    const longitude = hasLongitude ? Number(payload.longitude) : -85.3061;

    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("current", "rain,precipitation");
    url.searchParams.set("minutely_15", "precipitation");
    url.searchParams.set("forecast_minutely_15", "8");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("timeformat", "unixtime");

    const forecastResponse = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!forecastResponse.ok) {
      return Response.json({ error: "Unable to load rain forecast right now." }, { status: 502 });
    }

    const forecast = await forecastResponse.json();
    const currentRain = Number(forecast?.current?.rain ?? forecast?.current?.precipitation ?? 0);
    const currentTime = Number(forecast?.current?.time ?? Math.floor(Date.now() / 1000));
    const forecastTimes = forecast?.minutely_15?.time || [];
    const precipitationValues = forecast?.minutely_15?.precipitation || [];
    const nextRainIndex = precipitationValues.findIndex((value) => Number(value || 0) > 0.05);

    if (currentRain > 0.05) {
      return Response.json({
        status: "rain_now",
        minutesUntilRain: 0,
        nextRainAt: currentTime,
        usedFallbackLocation: !hasLatitude || !hasLongitude,
      });
    }

    if (nextRainIndex === -1 || !forecastTimes[nextRainIndex]) {
      return Response.json({
        status: "dry",
        minutesUntilRain: null,
        nextRainAt: null,
        usedFallbackLocation: !hasLatitude || !hasLongitude,
      });
    }

    const nextRainAt = Number(forecastTimes[nextRainIndex]);
    const minutesUntilRain = Math.max(0, Math.round((nextRainAt - currentTime) / 60));

    return Response.json({
      status: "rain_soon",
      minutesUntilRain,
      nextRainAt,
      usedFallbackLocation: !hasLatitude || !hasLongitude,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});