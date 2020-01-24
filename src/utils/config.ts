import convict from 'convict'
import { safeLoad as parseYaml } from 'js-yaml'
import path from 'path'

convict.addParser({ extension: ['yml', 'yaml'], parse: parseYaml })

const configSchema = convict({
    application: {
        env: {
            format: ['production', 'development', 'test'],
            default: 'development',
            env: 'NODE_ENV'
        }
    },
    postgres: {
        database: {
            format: String,
            default: 'postgres'
        },
        host: {
            format: 'url',
            default: '127.0.0.1'
        },
        port: {
            format: Number,
            default: 3306
        },
        user: {
            format: String,
            default: 'postgres'
        },
        password: {
            format: String,
            default: 'root'
        },
        cloud_sql_connection_name: {
            format: String,
            default: ''
        }
    },
    kafka: {
        brokers: {
            format: Array,
            default: ['localhost:9092']
        }
    }
})

export let config: typeof configSchema

export const createConfig = () => {
    config = configSchema.loadFile(path.join(__dirname, '../config/config.yml')).validate()
}
