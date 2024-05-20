export interface ScheduleTypeEntry {
  id: string;
  title: string;
}

export interface ScheduleTypes {
  [key: string]: ScheduleTypeEntry[];
}
