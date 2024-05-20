export interface ScheduleAddLessonFormData {
  subjectId?: string | null;
  teacherId?: string | null;
  groupId?: string | null;
  roomId?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  lessonIndex?: number | null;
  startTime?: Date | null;
  endTime?: Date | null;
}
