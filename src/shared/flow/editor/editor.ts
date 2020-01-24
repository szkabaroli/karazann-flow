import { Context } from '../core/context'
import { NodeBuilder, Node, Connection, Input, Output, IO } from '..'
import { IData } from '../interfaces'

export class EditorPin {
    position: [number, number] = [0, 0]
    constructor(public io: IO, public node: EditorNode) {}
}

export class EditorNode {
    editorPins: EditorPin[] = []

    constructor(public node: Node, private builder: NodeBuilder, public editor: Editor) {
        this.buildPins([...node.inputs.values(), ...node.outputs.values()])
    }

    getPinPosition(io: IO) {
        const editorPin = this.editorPins.find(pin => pin.io === io)
        if (!editorPin) throw new Error(`Pin not found for ${io.key}`)

        return editorPin.position
    }

    destroy() {
        console.debug('destroy editor node')
    }

    private buildPins(ios: IO[]) {
        // this.clearSockets()
        ios.forEach(io => {
            this.editorPins.push(new EditorPin(io, this))
        })
    }
}

export class EditorConnection {
    constructor(public connection: Connection, private inputNode: EditorNode, private outputNode: EditorNode) {}

    /*getPoints() {
        const [x1, y1] = this.outputNode.getPinPosition(this.connection.output)
        const [x2, y2] = this.inputNode.getPinPosition(this.connection.input)

        return [x1, y1, x2, y2]
    }*/

    getPoints() {
        const [x1, y1] = this.outputNode.getPinPosition(this.connection.output)
        const [x2, y2] = this.inputNode.getPinPosition(this.connection.input)

        return [x1, y1, x2, y2]
    }
}

interface EditorConnectionObj {
    [key: string]: EditorConnection
}

export class Editor extends Context {
    nodes: Node[] = []

    // View Layer
    editorNodes: EditorNode[] = []
    editorConnections: EditorConnection[] = []

    zoomLevel: number = 1
    area!: SVGElement

    constructor(public root: SVGElement) {
        super()
    }

    toJSON() {
        const data: IData = { nodes: {} }
        this.nodes.forEach(node => data.nodes[node.id] = node.toJSON())
        return data
    }

    addNode(node: Node) {
        this.nodes.push(node)

        // View Layer
        const builder = this.builders.get(node.builderName)
        if (!builder) throw new Error(`Builder ${node.builderName} not found`)

        this.editorNodes.push(new EditorNode(node, builder, this))
    }

    removeNode(node: Node) {
        node.getConnections().forEach((c: Connection) => this.removeConnection(c))

        this.editorNodes = this.editorNodes.filter(enode => enode.node !== node)

        this.nodes.splice(this.nodes.indexOf(node), 1)
    }

    connect(io1: IO, io2: IO) {
        let connection: Connection

        if (io1 instanceof Input && io2 instanceof Input) throw new Error('Cannot connect input to another input')
        if (io1 instanceof Output && io2 instanceof Output) throw new Error('Cannot connect output to another output')

        if (io1 instanceof Input) {
            connection = (io2 as Output).connectTo(io1 as Input)
        } else {
            connection = (io1 as Output).connectTo(io2 as Input)
        }

        this.addConnectionEditor(connection)
    }

    removeConnection(connection: Connection) {
        connection.remove()
    }

    getConnections() {
        return Array.from(this.editorConnections.values())
    }

    getBuilder(name: string) {
        const builder = this.builders.get(name)

        if (!builder) throw new Error(`Builder ${name} not found`)

        return builder
    }

    clear() {
        [...this.nodes].forEach(node => this.removeNode(node))
    }

    private addConnectionEditor(connection: Connection) {
        if (!connection.input.node || !connection.output.node) throw new Error('Connection input or output not added to node')

        const editorInput = this.editorNodes.find(enode => enode.node === connection.input.node)
        const editorOutput = this.editorNodes.find(enode => enode.node === connection.output.node)

        if (!editorInput || !editorOutput) throw new Error('View node not fount for input or output')

        const connView = new EditorConnection(connection, editorInput, editorOutput)
        this.editorConnections.push(connView)
    }
}
