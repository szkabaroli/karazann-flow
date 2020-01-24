import { Service } from 'typedi'
import { Trigger } from '../entities/trigger.entity'
import { Flow } from '../entities/flow.entity'
import { logger } from '../utils/logger'


import { IData } from '@bit/szkabaroli.karazann-shared.flow'

@Service()
export class FlowService {
    async process(trigger: Trigger) {
        const flowId = trigger.flowId
        try {
            const flow = await Flow.findOne({ where: { flowId }, select: ['nodes'] })
            if (flow) { 
                const nodes = flow.nodes as IData
            }
        } catch (e) { 
            logger.error('Database error:', e)
        }

        console.log(trigger)
    }
}