/*!
 * Copyright (c) 2019 Roland Sz.Kovács.
 */

import { Node } from './node'
import { Pin } from './pin'
import { EditorConnection } from '.'
import { IInput, IOutput } from './interfaces'

export class Connection {
    editorConnection!: EditorConnection

    constructor(public output: Output, public input: Input, public data: unknown = {}) {
        this.input.addConnection(this)
    }

    remove(): void {
        this.input.removeConnection(this)
        this.output.removeConnection(this)
    }
}

export class IO {
    node: Node | null = null
    multipleConnections: boolean
    connections: Connection[] = []

    constructor(public key: string, public name: string, public pin: Pin, multiConns: boolean) {
        this.node = null
        this.multipleConnections = multiConns
        this.connections = []
    }

    hasConnection(): boolean {
        return this.connections.length > 0
    }

    removeConnection(connection: Connection): void {
        this.connections.splice(this.connections.indexOf(connection), 1)
    }

    removeConnections(): void {
        this.connections.forEach(connection => this.removeConnection(connection))
    }
}

export class Input extends IO {
    constructor(key: string, name: string, pin: Pin, multiConns: boolean = false) {
        super(key, name, pin, multiConns)
    }

    addConnection(connection: Connection): void {
        if (!this.multipleConnections && this.hasConnection()) throw new Error('Multiple connections not allowed')
        this.connections.push(connection)
    }

    toJSON(): IInput {
        return {
            connections: this.connections.map(c => {
                if (!c.output.node) throw new Error('Node not added to Output')

                return {
                    node: c.output.node.id,
                    output: c.output.key,
                    data: c.data
                }
            })
        }
    }
}

export class Output extends IO {
    constructor(key: string, name: string, pin: Pin, multiConns: boolean = true) {
        super(key, name, pin, multiConns)
    }

    connectTo(input: Input): Connection {
        if (!this.pin.compatibleWith(input.pin)) throw new Error('Sockets not compatible')
        if (!input.multipleConnections && input.hasConnection()) throw new Error('Input already has one connection')
        if (!this.multipleConnections && this.hasConnection()) throw new Error('Output already has one connection')

        const connection = new Connection(this, input)

        this.connections.push(connection)
        return connection
    }

    connectedTo(input: Input): boolean {
        return this.connections.some(item => {
            return item.input === input
        })
    }

    toJSON(): IOutput {
        return {
            connections: this.connections.map(c => {
                if (!c.input.node) throw new Error('Node not added to Input')

                return {
                    node: c.input.node.id,
                    input: c.input.key,
                    data: c.data
                }
            })
        }
    }
}
