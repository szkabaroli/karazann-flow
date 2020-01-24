import { Kafka, ConsumerConfig, KafkaConfig, EachMessagePayload } from 'kafkajs'
import Container from 'typedi'

interface IEventBusOptions {
    kafkaOptions: KafkaConfig
    consumers: (new () => {})[]
}

let kafka: Kafka

export const createKafka = async (config: IEventBusOptions) => {
    kafka = new Kafka(config.kafkaOptions)

    config.consumers.map(async c => {
        const consumerInstance = Container.get(c)

        const consumerConfig: ConsumerConfig = Reflect.getMetadata('consumer:options', c.constructor)

        const onMessage = Reflect.getMetadata('consumer:onmessage', c)
        const onMessageTopics = Reflect.getMetadata('consumer:onmessage:topics', c)

        const onConnection = Reflect.getMetadata('consumer:onconnection', c)

        const consumer = kafka.consumer(consumerConfig)
        consumer.on('consumer.group_join', onConnection)

        
        try {
            await consumer.connect()
        } catch (e) {
            console.error('Failed to connect:', e)
        }

        await onMessageTopics.map(async (topic: string) => {
            await consumer.subscribe({ topic })
        })

        try {
            await consumer.run({ autoCommit: false, eachMessage: (payload: EachMessagePayload) => onMessage.apply(consumerInstance, [payload, consumer]) })
        } catch (e) {
            console.error(e)
        }
    })
}
