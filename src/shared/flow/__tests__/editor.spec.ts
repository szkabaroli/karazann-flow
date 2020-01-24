/**
 * @jest-environment jsdom
 */

import { NumberNode, PrintNode } from './testBuilders'
import { Node, NodeBuilder, Output, Input, Editor } from '..'

describe('Editor class', () => {
    let editor: Editor
    let builders: NodeBuilder[]
    let nodes: Node[]

    const mockCreated = jest.fn()
    const mockRemoved = jest.fn()
    const mockConnectionCreated = jest.fn()
    const mockConnectionRemoved = jest.fn()

    beforeEach(() => {
        const par = document.createElement('div') as HTMLElement
        const root = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGElement
        par.appendChild(root)

        editor = new Editor(root)

        builders = [new NumberNode(), new PrintNode()]
        builders.forEach(b => editor.register(b))

        const node1 = builders[0].createNode()
        const node2 = builders[1].createNode()
        nodes = [node1, node2]

        mockCreated.mockClear()
        mockRemoved.mockClear()
        mockConnectionCreated.mockClear()
        mockConnectionRemoved.mockClear()
    })

    /*it('should register buidlers correctly', () => {
        const builder = new NumberNode()

        expect(() => editor.getComponent('Number')).toThrow()
        editor.register(builder)
        expect(() => editor.getComponent('Number')).not.toThrow()
    })*/

    it('should add and remove node properly and emit events', () => {
        editor.on('nodecreated', mockCreated)

        expect(editor.nodes).toHaveLength(0)
        editor.addNode(nodes[0])
        expect(editor.nodes).toHaveLength(1)

        expect(mockCreated).toBeCalledTimes(1)
        expect(mockCreated).toBeCalledWith(nodes[0])

        editor.addNode(nodes[1])
        expect(editor.nodes).toHaveLength(2)

        editor.removeNode(nodes[0])
        expect(editor.nodes).toHaveLength(1)
        editor.removeNode(nodes[1])
        expect(editor.nodes).toHaveLength(0)
    })

    it('should connect nodes properly and emit events', () => {
        editor.on('connectioncreated', mockConnectionCreated)
        editor.on('connectionremoved', mockConnectionRemoved)

        const output = nodes[0].outputs.get('number') as Output
        const input = nodes[1].inputs.get('text') as Input

        // Create
        expect(() => editor.connect(output, input)).not.toThrow()
        expect(nodes[0].getConnections()).toHaveLength(1)
        expect(nodes[1].getConnections()).toHaveLength(1)

        expect(mockConnectionCreated).toBeCalledTimes(1)
        expect(mockConnectionCreated).toBeCalledWith(nodes[0].getConnections()[0])

        // Remove
        expect(() => editor.removeConnection(nodes[0].getConnections()[0])).not.toThrow()
        expect(nodes[0].getConnections()).toHaveLength(0)
        expect(nodes[1].getConnections()).toHaveLength(0)

        expect(mockConnectionRemoved).toBeCalledTimes(1)
    })
})
