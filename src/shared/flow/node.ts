import { Input, Output, Connection } from './io'
import { INode, IOutputs, IInputs } from './interfaces'
import { NodeBuilder } from '.'

interface IOData {
    data: any
}

export interface OutputsData {
    [key: string]: IOData
}

export interface InputsData {
    [key: string]: IOData
}

export interface FlowControls {
    [key: string]: () => void | Promise<void>
}


export interface NodeMetadata {
    position?: [number, number]
    type?: string
    [key: string]: unknown
}

export class Node {
    private static latestId = 0

    private static incrementId(): number {
        if (!this.latestId) this.latestId = 1
        else this.latestId++
        return this.latestId
    }

    id!: number
    builderName!: string
    processed: boolean = false
    
    metadata: NodeMetadata = {}

    inputs = new Map<string, Input>()
    outputs = new Map<string, Output>()

    outputDatas: OutputsData = {}

    constructor() {
        this.id = Node.incrementId()
    }

    addInput(input: Input): Node {
        this._add(this.inputs, input, 'node')
        return this
    }

    removeInput(input: Input): void {
        input.removeConnections()
        input.node = null

        this.inputs.delete(input.key)
    }

    addOutput(output: Output): Node {
        this._add(this.outputs, output, 'node')
        return this
    }

    removeOutput(output: Output): void {
        output.removeConnections()
        output.node = null

        this.outputs.delete(output.key)
    }

    getConnections() {
        const ios = [...this.inputs.values(), ...this.outputs.values()]
        const connections = ios.reduce((arr, io) => {
            return [...arr, ...io.connections]
        }, [] as Connection[])

        return connections
    }

    toJSON(): INode {
        const reduceIO = <T extends any>(list: Map<string, Input | Output>) => {
            return Array.from(list).reduce<T>((obj, [key, io]) => {
                obj[key] = io.toJSON()
                return obj
            }, {} as any)
        }

        return {
            id: this.id,
            // inputs: reduceIO<IInputs>(this.inputs),
            outputs: reduceIO<IOutputs>(this.outputs),
            metadata: this.metadata,
            builderName: this.builderName
        }
    }

    static fromJSON(json: INode, b: NodeBuilder) {
        const node = b.createNode()
        
        node.id = json.id
        node.metadata = json.metadata
        node.builderName = json.builderName
        Node.latestId = Math.max(node.id, Node.latestId)

        return node
    }

    private _add<T extends any>(list: Map<string, T>, item: T, prop: string): void {
        if (list.has(item.key)) throw new Error(`Item with key '${item.key}' already been added to the node`)
        if (item[prop] !== null) throw new Error('Item has already been added to some node')

        item[prop] = this
        list.set(item.key, item)
    }
}
