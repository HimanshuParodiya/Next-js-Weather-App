export function meterToKilometers(visibilityInMeter: number): string {
  const visibilityInKilometers = visibilityInMeter / 1000;
  return `${visibilityInKilometers.toFixed(0)}Km`;
}
