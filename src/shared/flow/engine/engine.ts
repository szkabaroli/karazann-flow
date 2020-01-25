import { Node, InputsData, FlowControls } from '../node'
import { Input } from '../io'
import { PinType } from '../pin'
import { Context } from '../core/context'
import { IData } from '../interfaces'

interface ILogger { 
    log(...args:any): any
    debug(...args:any): any
    info(...args:any): any
    error(...args:any): any
    warn(...args:any): any
    emerg(...args: any): any
    profile(...args: any): any
}

interface EngineOptions { 
    logger: ILogger
}

export class FlowEngine extends Context {
    private logger: ILogger
    nodes: Map<number, Node> = new Map()
    
    constructor(private options: EngineOptions) {
        super()
        this.logger = options.logger
    }

    extractInputData(node: Node) {
        const inputData: InputsData = {}

        for (const key of node.inputs.keys()) {
            const input = node.inputs.get(key) as Input
            if (input.pin.type !== PinType.Flow) {
                const conns = input.connections
                conns.forEach(c => {
                    const prevNode = this.nodes.get((c.output.node as Node).id as number) as Node

                    if (prevNode.processed) {
                        const output = prevNode.outputDatas[c.input.key]

                        inputData[c.output.key] = output
                    } else {
                        this.logger.debug('node not yet porcessed')
                    }
                })
            }
        }
        return inputData
    }

    async startPorcessing(json: IData, nodeId: number, onlyBuild: boolean) {
        this.logger.profile('buildFlow')
        // Build the node tree from json representation
        for (const [key, value] of Object.entries(json.nodes)) {
            const b = this.builders.get(value.builderName)!
            const n = Node.fromJSON(value, b)
            this.nodes.set(value.id, n)
        }

        // Build connections
        let cons = 0
        for (const [id, node] of Object.entries(json.nodes)) {
            for (const [key, value] of Object.entries(node.outputs)) {
                value.connections.forEach(c => {
                    cons++
                    const output = this.nodes.get(node.id)?.outputs.get(key)
                    const input = this.nodes.get(c.node)?.inputs.get(c.input)

                    output!.connectTo(input!)
                })
            }
        }
        this.logger.profile('buildFlow')

        this.logger.profile('analyzeFlow')
        let triggers = 0
        let action = 0
        let control = 0
        let data = 0
        
        for (const node of Object.values(json.nodes)) {
            switch (node.metadata.type) { 
                case 'trigger':
                    triggers++ 
                    break
                case 'action':
                    action++
                    break
                case 'control':
                    control++
                    break
                case 'data':
                    data++
                    break
            }
        }
        this.logger.profile('analyzeFlow')
        this.logger.debug(`triggers: ${triggers}`)
        this.logger.debug(`action: ${action}`)
        this.logger.debug(`control: ${control}`)
        this.logger.debug(`data: ${data}`)


        this.logger.profile('processFlow', { level: 'info'})
        await this.processNode(nodeId)
        this.logger.profile('processFlow')
    }

    /*async processUnreachable(): Promise<void> {
        const data = this.data as IFlowData

        for (const i of Object.keys(data.nodes)) {
            // process nodes that have not been reached
            const node = data.nodes[i] as IEngineNode

            if (typeof node.outputData === 'undefined') {
                await this.processNode(node)
                await this.forwardProcess(node)
            }
        }
    }*/

    async processNode(nodeId: number) {
        const node = this.nodes.get(nodeId) as Node
        // Every node need to be processed once
        if (node.processed === true) return

        this.logger.debug(`[Node System]: processing node: ${node.builderName}`)

        // Construct input data form other node outputs
        const inputDatas: InputsData = this.extractInputData(node)

        // Construct outputs
        const flowControls: FlowControls = {}
        node.outputs.forEach(o => {
            if (o.pin.type === PinType.Flow) {
                // Build flow controls
                if (o.hasConnection()) {
                    o.connections.forEach(c => {
                        const nextNodeId = (c.input.node as Node).id as number
                        flowControls[o.key] = async () => {
                            this.logger.debug(`[Node System] flowing to: ${nextNodeId}`)
                            await this.processNode(nextNodeId)
                        }
                    })
                } else {
                    // tslint:disable-next-line: no-empty
                    flowControls[o.key] = () => {}
                }
            } else {
                // Create the output data holder pointers for the node
                node.outputDatas[o.key] = {
                    data: undefined
                }
            }
        })

        // Get the builder for the node
        const builder = this.builders.get(node.builderName)
        if (!builder) throw new Error('Builder not registered')

        this.logger.debug(`[Node System] working on: ${node.builderName}`)
        // console.debug(inputData, n.outputData)
        await builder.worker(node, inputDatas, node.outputDatas, flowControls)
    }
}
