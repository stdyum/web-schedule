export type DateUnit = () => number

export const dateUnits = {
  second: () => 1000,
  minute: () => dateUnits.second() * 60,
  hour: () => dateUnits.minute() * 60,
  day: () => dateUnits.hour() * 24,
};

export const datesDiff = (date1: Date, date2: Date, unit: DateUnit): number =>
  Math.floor(Math.abs(date1.getTime() - date2.getTime()) / unit());
