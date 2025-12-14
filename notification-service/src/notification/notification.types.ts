export interface ScheduleNotificationDto {
  type: 'SCHEDULE_CREATED' | 'SCHEDULE_DELETED';
  customerEmail: string;
  customerName: string;
  doctorName: string;
  scheduledAt: Date;
}