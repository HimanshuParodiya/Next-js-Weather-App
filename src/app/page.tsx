"use client";
import Container from "@/components/Container";
import ForecastWeatherDetail from "@/components/ForcastWeatherDetail";
import Navbar from "@/components/Navbar";
import WeatherDetails from "@/components/WeatherDetails";
import WeatherIcon from "@/components/WeatherIcon";
import convertKelvinToCelsius from "@/utils/convertKelvinToCelsius";
import convertWindSpeed from "@/utils/convertWindSpeed";
import getDayOrNightIcons from "@/utils/getDayOrNightIcons";
import { meterToKilometers } from "@/utils/metersToKilometers";
import axios from "axios";
import { format, fromUnixTime, parseISO } from "date-fns";
import { useQuery } from "react-query";

//
// WeatherTypes.ts

type WeatherData = {
  cod: string;
  message: number;
  cnt: number;
  list: Forecast[];
  city: City;
};

type Forecast = {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: WeatherDescription[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
};

type WeatherDescription = {
  id: number;
  main: string;
  description: string;
  icon: string;
};

type City = {
  id: number;
  name: string;
  coord: {
    lat: number;
    lon: number;
  };
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
};

export default function Home() {
  const { data, isLoading, error } = useQuery<WeatherData>(
    "repoData",
    async () => {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=delhi&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=56`
      );
      return data;
    }
  );
  console.log(data);

  const firstData = data?.list[0]; // it will return data instead of day so we are using date-fns library to convert it

  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    ),
  ];

  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6;
    });
  });

  if (isLoading) {
    return (
      <div className="flex items-center min-h-screen justify-center">
        <p className="animate-bounce">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen rounded-scrollbar">
      <Navbar />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {/* today's data  */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="flex gap-1 text-2xl items-end">
              <p>{format(parseISO(firstData?.dt_txt ?? ""), "EEEE")}</p>
              <p className="text-lg">
                ({format(parseISO(firstData?.dt_txt ?? ""), "dd.MM.yyyy")})
              </p>
            </h2>
            <Container className="gap-10 px-6 items-center">
              <div className="flex flex-col px-4">
                <span className="text-5xl">
                  {convertKelvinToCelsius(firstData?.main?.temp ?? 297.37)}°
                </span>
                <p className="text-xs space-x-1 whitespace-nowrap">
                  <span>Feels like</span>
                  <span>
                    {convertKelvinToCelsius(firstData?.main?.temp ?? 0)}°
                  </span>
                </p>
                <p className="text-xs space-x-2">
                  <span>
                    {convertKelvinToCelsius(firstData?.main?.temp_min ?? 0)} °↓
                  </span>
                  <span>
                    {convertKelvinToCelsius(firstData?.main?.temp_max ?? 0)}°↑
                  </span>
                </p>
              </div>
              {/* time and weather icon */}
              <div className=" flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                {data?.list.map((eachData, index) => (
                  <div
                    key={index}
                    className="flex flex-col justify-between gap-2 items-center text-sm font-semibold"
                  >
                    <p className="whitespace-nowrap">
                      {format(parseISO(eachData.dt_txt), "h:mm a")}
                    </p>
                    {/* <WeatherIcon iconName={eachData.weather[0].icon} /> */}
                    <WeatherIcon
                      iconName={getDayOrNightIcons(
                        eachData.weather[0].icon,
                        eachData.dt_txt
                      )}
                    />

                    <p>{convertKelvinToCelsius(eachData?.main.temp ?? 0)}°</p>
                  </div>
                ))}
              </div>
            </Container>
          </div>
          <div className="flex gap-4">
            {/* left  */}
            <Container className="w-fit justify-center flex-col px-4 items-center">
              <p className="capitalize text-center">
                {firstData?.weather[0].description}
              </p>
              <WeatherIcon
                iconName={getDayOrNightIcons(
                  firstData?.weather[0].icon ?? "",
                  firstData?.dt_txt ?? ""
                )}
              />
            </Container>
            <Container className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto">
              <WeatherDetails
                visibility={meterToKilometers(firstData?.visibility ?? 1000)}
                airPressure={`${firstData?.main.pressure} hpa`}
                humidity={`${firstData?.main.humidity}%`}
                sunrise={format(
                  fromUnixTime(data?.city.sunrise ?? 1702949452),
                  "H:mm"
                )}
                sunset={format(
                  fromUnixTime(data?.city.sunset ?? 1702517657),
                  "H:mm"
                )}
                windSpeed={convertWindSpeed(firstData?.wind.speed ?? 1.64)}
              />
            </Container>
            {/* right */}
          </div>
        </section>

        {/* next 7 days data  */}
        <section className="flex w-full flex-col gap-4">
          <p className="text-2xl">Forecast (7days)</p>
          {firstDataForEachDate.map((d, index) => (
            <ForecastWeatherDetail
              key={index}
              description={d?.weather[0].description ?? ""}
              weatherIcon={d?.weather[0].icon ?? "01d"}
              date={format(parseISO(d?.dt_txt ?? ""), "dd.MM")}
              day={format(parseISO(d?.dt_txt ?? ""), "EEEE")}
              feels_like={d?.main.feels_like ?? 0}
              temp={d?.main.temp ?? 0}
              temp_max={d?.main.temp_max ?? 0}
              temp_min={d?.main.temp_min ?? 0}
              airPressure={`${d?.main.pressure} hPa `}
              humidity={`${d?.main.humidity}% `}
              sunrise={format(
                fromUnixTime(data?.city.sunrise ?? 1702517657),
                "H:mm"
              )}
              sunset={format(
                fromUnixTime(data?.city.sunset ?? 1702517657),
                "H:mm"
              )}
              visibility={`${meterToKilometers(d?.visibility ?? 10000)} `}
              windSpeed={`${convertWindSpeed(d?.wind?.speed ?? 1.64)} `}
            />
          ))}
        </section>
      </main>
    </div>
  );
}
