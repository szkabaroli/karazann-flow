import { NodeBuilder } from '../builder'
import { EventEmitter as EE } from 'ee-ts'
import { EventTypes } from '../events'

export class Context extends EE<EventTypes> {
    builders: Map<string, NodeBuilder>

    constructor() {
        super()
        this.builders = new Map()
    }

    register(builder: NodeBuilder) {
        if (this.builders.has(builder.name)) throw new Error(`Builder ${builder.name} already registered`)
        this.builders.set(builder.name, builder)
        this.emit('builderregister', builder)
    }

    destroy(this: Context) {
        this.emit('destroy')
    }
}
