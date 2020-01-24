import { Node, InputsData, FlowControls } from '../node'
import { Input } from '../io'
import { PinType } from '../pin'
import { Context } from '../core/context'
import { IData } from '../interfaces'

export class FlowEngine extends Context {
    nodes: Map<number, Node> = new Map()

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
                        console.debug('node not yet porcessed')
                    }
                })
            }
        }
        return inputData
    }

    async startPorcessing(json: IData, nodeId: number, onlyBuild: boolean) {
        console.time('buildFlow')
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
        console.timeEnd('buildFlow')

        console.time('analyzeFlow')
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
        console.timeEnd('analyzeFlow')
        console.debug('triggers:', triggers)
        console.debug('action:', action)
        console.debug('control:', control)
        console.debug('data:', data)


        console.time('processFlow')
        await this.processNode(nodeId)
        console.timeEnd('processFlow')
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

        console.debug(`[Node System]: processing node: ${node.builderName}`)

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
                            console.debug(`[Node System] flowing to: ${nextNodeId}`)
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

        console.debug(`[Node System] working on: ${node.builderName}`)
        // console.debug(inputData, n.outputData)
        await builder.worker(node, inputDatas, node.outputDatas, flowControls)
    }
}
