import 'reflect-metadata'
import { FlowProcessorMicroservice } from './server'
import { createConfig } from './utils/config'

const boot = async () => {
    createConfig()
    const microservice = new FlowProcessorMicroservice()
    await microservice.start()
}

boot()