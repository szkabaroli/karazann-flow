import { createConnection, getConnection, ConnectionOptions, Connection, EntitySchema } from 'typeorm'
import { config } from './config'
import { logger } from './logger'

const dbOptions = (entities: EntitySchema<any>[]): ConnectionOptions => {
    const dbConfig = config.get('postgres')
    const appConfig = config.get('application')

    return {
        /** Defaults */
        name: 'default',
        type: 'postgres',
        host: dbConfig.host,
        port: dbConfig.port,
        entities,
        database: dbConfig.database,
        username: dbConfig.user,
        password: dbConfig.password,
        synchronize: true,
        cache: true,
        logging: false,

        /** Development Config */
        ...(appConfig.env === 'development' && {
            dropSchema: false,
            logging: false
        }),

        /** Testing Config */
        ...(appConfig.env === 'test' && {
            dropSchema: true
        }),

        /** Production Config */
        ...(appConfig.env === 'production' && {
            synchronize: false,
            extra: {
                host: `/cloudsql/${dbConfig.cloud_sql_connection_name}`
            }
        })
    }
}

export const createDatabase = async (entities: any[]) => {
    let connection: Connection | null = null

    try {
        connection = getConnection(dbOptions(entities).name)
        logger.notice('DB connection found.')
    } catch (e) {
        try {
            logger.notice('DB connection not found creating new one.')
            connection = await createConnection(dbOptions(entities))
            logger.notice('DB connection created.')
        } catch (e) {
            logger.emerg(`Failed to create connection as user: ${process.env.DB_USER}`)
            logger.error(e.message)
        }
    }

    return connection
}
