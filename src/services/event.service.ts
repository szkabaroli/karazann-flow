import { Service } from 'typedi'
import { logger } from '../utils/logger'
import { Trigger } from '../entities/trigger.entity'
import { getConnection, Equal, Raw } from 'typeorm'

@Service()
export class EventService {
    constructor() {
        logger.info('created')
    }

    async getTrigger(eventType: string, reference: string) {
        logger.debug(eventType, reference)
        try {
            return await getConnection()
                .getRepository(Trigger)
                .find({
                    eventType: Equal(eventType),
                    eventPayload: Raw(alias => `event_payload->>'ref' = '${reference}'`)
                })
        } catch (e) {
            logger.error('Database error:', e)
            throw new Error('Database error')
        }
    }
}
