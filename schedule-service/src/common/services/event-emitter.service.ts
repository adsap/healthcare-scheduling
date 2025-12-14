import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventEmitterService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitScheduleCreated(data: {
    customerId: string;
    customerEmail: string;
    customerName: string;
    doctorId: string;
    doctorName: string;
    scheduledAt: Date;
  }) {
    this.eventEmitter.emit('schedule.created', data);
  }

  emitScheduleDeleted(data: {
    customerId: string;
    customerEmail: string;
    customerName: string;
    doctorId: string;
    doctorName: string;
    scheduledAt: Date;
  }) {
    this.eventEmitter.emit('schedule.deleted', data);
  }
}
