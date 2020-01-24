import { Node } from '../node'
import { Output, Input } from '../io'
import { NumberNode, PrintNode, pinNumber, pinFlow } from './testBuilders'

describe('NodeBuilder class', () => {
    const numberBuilder = new NumberNode()
    const printBuilder = new PrintNode()

    let nodeInstance1: Node
    let nodeInstance2: Node

    describe('instance', () => {
        it.todo('should build correctly')
    })

    describe('Nodes', () => {
        nodeInstance1 = numberBuilder.createNode()
        nodeInstance2 = printBuilder.createNode()

        it('should created by builder correctly', () => {
            expect(nodeInstance1).toBeDefined()
            expect(nodeInstance2).toBeDefined()
        })

        it('should have corerct builderName', () => {
            expect(nodeInstance1.builderName).toBe(numberBuilder.name)
            expect(nodeInstance2.builderName).toBe(printBuilder.name)
        })

        it('should have correct incremented ids', () => {
            expect(nodeInstance1.id).toBe(1)
            expect(nodeInstance2.id).toBe(2)
        })

        it('should have correct io', () => {
            // Number Node
            expect(nodeInstance1.outputs.get('number')).toBeInstanceOf(Output)
            expect((nodeInstance1.outputs.get('number') as Output).pin).toBe(pinNumber)
            // Print Node
            expect(nodeInstance2.inputs.get('text')).toBeInstanceOf(Input)
            expect((nodeInstance2.inputs.get('text') as Input).pin).toBe(pinNumber)

            expect(nodeInstance2.inputs.get('control')).toBeInstanceOf(Input)
            expect((nodeInstance2.inputs.get('control') as Input).pin).toBe(pinFlow)

            expect(nodeInstance2.outputs.get('control')).toBeInstanceOf(Output)
            expect((nodeInstance2.outputs.get('control') as Output).pin).toBe(pinFlow)
        })

        it('should connect correctly', () => {
            const numberNodeOut = nodeInstance1.outputs.get('number') as Output
            const printNodeIn = nodeInstance2.inputs.get('text') as Input

            numberNodeOut.connectTo(printNodeIn)

            expect((nodeInstance1.outputs.get('number') as Output).connections).toHaveLength(1)
            expect((nodeInstance2.inputs.get('text') as Input).connections).toHaveLength(1)

            // We are expecting the connection instance to be the same
            expect((nodeInstance1.outputs.get('number') as Output).connections[0]).toBe((nodeInstance2.inputs.get('text') as Input).connections[0])
        })

        it.todo('shhould run the worker correctly if input and output correct')
    })
})
