import { ConsumerConfig } from 'kafkajs'

export function KafkaConsumer(options: ConsumerConfig) {
    return (target: any) => {
        Reflect.defineMetadata('consumer:options', options, target.constructor)
    }
}

export function OnEachMessage(topics: string[]) {
    return function (this: any, target: any, name: any, descriptor: any) {
        const fn = descriptor.value
        Reflect.defineMetadata('consumer:onmessage', fn, target.constructor)
        Reflect.defineMetadata('consumer:onmessage:topics', topics, target.constructor)
    }
}

export function OnConnection() {
    return function (this: any, target: any, name: any, descriptor: any) {
        const fn = descriptor.value
        Reflect.defineMetadata('consumer:onconnection', fn, target.constructor)
    }
}