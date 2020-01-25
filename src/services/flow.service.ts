import { Service } from 'typedi'
import { Trigger } from '../entities/trigger.entity'
import { Flow } from '../entities/flow.entity'
import { logger } from '../utils/logger'

import { FlowEngine, INodes, NodeBuilder } from '@bit/szkabaroli.karazann-shared.flow'
import { OnStart, Branch, All, Add, Cast, Console } from '../shared/nodes'

@Service()
export class FlowService {
    private engine: FlowEngine
    
    constructor() { 
        this.engine = new FlowEngine({ logger })
        
        const builders: NodeBuilder[] = [new OnStart(), new Console(), new Branch(), new All(), new Add(), new Cast()]
        builders.forEach((b: NodeBuilder) => {
            this.engine.register(b)
        })
    }
    
    async process(flowId: string) {
        let nodes!: INodes
        
        logger.debug(flowId)
        
        try {
            const flow = await Flow.findOne({ where: { flowId }, select: ['nodes'] })
            if (!flow) throw new Error('Failed to load node data!')
            
            nodes = flow.nodes as INodes
            logger.debug(nodes)
        } catch (e) { 
            logger.error('Database error:', e)
            throw new Error('Database error!')
        }

        try {
            await this.engine.startPorcessing({ nodes }, 3, true)
        } catch (e) { 
            logger.error('Flow error:', e)
            throw new Error('Failed to process node data!')
        }
    }
}