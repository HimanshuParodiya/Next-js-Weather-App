const getDayOrNightIcons = (
  iconName: string,
  dateTimeString: string
): string => {
  const hours = new Date(dateTimeString).getHours(); // get hours from the given date and time
  const isDayTime = hours >= 6 && hours < 18; // consider day time
  return isDayTime ? iconName.replace(/.$/, "d") : iconName.replace(/.$/, "n"); // /.$/ targets the last character in the string.
};

export default getDayOrNightIcons;
