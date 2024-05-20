export interface ScheduleLesson {
  id: string;
  studyPlaceId: string;
  type: 'current' | 'general';
  group: {
    id: string;
    name: string;
  };
  room: {
    id: string;
    name: string;
  };
  subject: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    name: string;
  };
  startTime: Date;
  endTime: Date;
  lessonIndex: number;
  primaryColor: string;
  secondaryColor: string;
}

export interface ScheduleGeneralLesson {
  id?: string;
  studyPlaceId?: string;
  primaryColor: string;
  secondaryColor?: string;
  endTime: Date;
  startTime: Date;
  dayIndex: number;
  lessonIndex: number;
  subject: {
    id: string;
    name: string;
  };
  group: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    name: string;
  };
  room: {
    id: string;
    name: string;
  };
}

export interface ScheduleInfo {
  studyPlaceId: string;
  column: string;
  columnId: string;
  columnName: string;
  startDate: Date;
  endDate: Date;
}

export interface GeneralScheduleInfo {
  studyPlaceId: string;
  column: string;
  columnId: string;
  columnName: string;
}

export interface Schedule {
  lessons: ScheduleLesson[];
  info: ScheduleInfo;
}

export interface GeneralSchedule {
  lessons: ScheduleGeneralLesson[];
  info: GeneralScheduleInfo;
}
