import requests


def get_weather():
    latitude = 22.57
    longitude = 88.36

    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,weather_code",
        "timezone": "auto"
    }

    try:
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()

        data = response.json()

        temperature = data["current"]["temperature_2m"]
        weather_code = data["current"]["weather_code"]

        descriptions = {
            0: "clear skies",
            1: "mainly clear",
            2: "partly cloudy",
            3: "overcast",
            45: "foggy",
            48: "foggy",
            51: "light drizzle",
            53: "moderate drizzle",
            55: "heavy drizzle",
            61: "light rain",
            63: "moderate rain",
            65: "heavy rain",
            80: "rain showers",
            81: "rain showers",
            82: "heavy rain showers",
            95: "a thunderstorm"
        }

        description = descriptions.get(
            weather_code,
            "unknown conditions"
        )

        return f"It is {temperature} degrees Celsius with {description}."

    except Exception:
        return "I couldn't retrieve the weather right now."