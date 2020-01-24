import { logLevel } from 'kafkajs'

import { EventConsumer } from './consumers/event.consumer'

import { Trigger } from './entities/trigger.entity'

import { createKafka } from './shared/kafka-decorators/kafka'

import { config } from './utils/config'
import { createDatabase } from './utils/db'
import { Flow } from './entities/flow.entity'

export class FlowProcessorMicroservice {
    async start() {
        const kafkaConfig = config.get('kafka')

        await createDatabase([Trigger, Flow])
        await createKafka({
            kafkaOptions: {
                brokers: kafkaConfig.brokers,
                clientId: 'karazann-flow-processor',
                requestTimeout: 15000,
                logLevel: logLevel.WARN
            },
            consumers: [EventConsumer]
        })
    }
}
