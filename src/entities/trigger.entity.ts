import { Entity, PrimaryGeneratedColumn, BaseEntity, Column } from 'typeorm'

@Entity('triggers')
export class Trigger extends BaseEntity {
    // The unique id of this trigger
    @PrimaryGeneratedColumn('uuid', { name: 'trigger_id' })
    triggerId: string

    // The Id of the flow containing this trigger
    @Column({ type: 'text', name: 'flow_id' })
    flowId: string

    // This is the event when this trigger is getting invoked. Ex.: JobApplyEvent, ButtinClickEvent
    @Column({ type: 'text', name: 'event_type' })
    eventType: string

    // This is the event when this trigger is getting invoked
    @Column({ type: 'jsonb', name: 'event_payload' })
    eventPayload: string
}