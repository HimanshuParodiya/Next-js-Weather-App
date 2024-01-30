const convertWindSpeed = (speedInMetersPerSecond: number) => {
  const speedInKiloMetersPerHour = speedInMetersPerSecond * 3.6;
  return `${speedInKiloMetersPerHour.toFixed(0)}Km/h`;
};

export default convertWindSpeed;
