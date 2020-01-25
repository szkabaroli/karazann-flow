import { Inject, Service } from 'typedi'
import { KafkaConsumer, OnConnection, OnEachMessage } from '../shared/kafka-decorators/decorators'
import { Consumer, EachMessagePayload } from 'kafkajs'
import { logger } from '../utils/logger'
import { EventService } from '../services/event.service'
import { FlowService } from '../services/flow.service'

interface IOutboxEventValue {
    payload: any
    eventType: string
}

@KafkaConsumer({ groupId: 'karazann-flow-processor' })
export class EventConsumer {
    @Inject()
    eventService: EventService

    @Inject()
    flowService: FlowService

    @OnConnection()
    onConnect() {
        logger.info('consumer group member connected')
    }

    @OnEachMessage(['outbox.event.Flow'])
    async message(payload: EachMessagePayload, consumer: Consumer) {
        const { message, topic, partition } = payload

        const parsedKey = JSON.parse(message.key.toString()).payload
        const parsedValue: IOutboxEventValue = JSON.parse(message.value.toString()).payload

        // Stage #1: Check is trigger exist
        const trigger = await this.eventService.getTrigger(parsedValue.eventType, JSON.parse(parsedValue.payload).ref)
        
        // Stage #2: If exist process the flow
        if (trigger) this.flowService.process(trigger[0].flowId)

        // Stage #3: Commit the offset. The event is processed. Regardles this is a trrigger or not.
        await consumer.commitOffsets([{ topic, partition, offset: `${Number(message.offset) + 1}` }])
    }
}
