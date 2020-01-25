import { NodeBuilder, PinType, Pin, Output, Node, Input } from '@bit/szkabaroli.karazann-shared.flow'

export const controlPin = new Pin('flow', PinType.Flow)
export const booleanPin = new Pin('boolean', PinType.Data)
export const textPin = new Pin('text', PinType.Data)
export const numberPin = new Pin('number', PinType.Data)
export const jobPin = new Pin('job', PinType.Data)

export class OnStart extends NodeBuilder {
    constructor() {
        super('OnStart', 'trigger')
    }

    build(node: Node) {
        node.addOutput(new Output('controlOut', 'On Start', controlPin, false))
    }

    async worker(node: Node, inputs: any, outputs: any, control: any) {
        node.processed = true
        control['controlOut']()
    }
}

export class Console extends NodeBuilder {
    constructor() {
        super('Console', 'action')
    }

    build(node: Node) {
        node.addInput(new Input('controlIn', 'In', controlPin))
        node.addInput(new Input('textIn', 'Text to Print', textPin))

        node.addOutput(new Output('controlOut', 'Out', controlPin, false))
    }

    async worker(node: Node, inputs: any, outputs: any, control: any) {
        node.processed = true
        control['controlOut']()
    }
}

export class Branch extends NodeBuilder {
    constructor() {
        super('Branch', 'control')
    }

    build(node: Node) {
        node.addInput(new Input('controlIn', 'In', controlPin))
        node.addInput(new Input('valueIn', 'Value', booleanPin))

        node.addOutput(new Output('controlIf', 'If', controlPin))
        node.addOutput(new Output('controlElse', 'Else', controlPin))
    }

    async worker(node: Node, inputs: any, outputs: any, control: any) {
        node.processed = true
        control['controlElse']()
    }
}

export class All extends NodeBuilder {
    constructor() {
        super('All', 'action')
    }

    build(node: Node) {
        node.addInput(new Input('controlIn', 'In', controlPin))
        node.addInput(new Input('inNumber', 'Number', numberPin))
        node.addInput(new Input('inBoolean', 'Boolean', booleanPin))
        node.addInput(new Input('inText', 'Text', textPin))
        node.addInput(new Input('inJob', 'Job', jobPin))

        node.addOutput(new Output('controlOut', 'Out', controlPin))
        node.addOutput(new Output('outNumber', 'Number', numberPin))
        node.addOutput(new Output('outBoolean', 'Boolean', booleanPin))
        node.addOutput(new Output('outText', 'Text', textPin))
        node.addOutput(new Output('outJob', 'Job', jobPin))
    }

    async worker(node: Node, inputs: any, outputs: any, control: any) {
        node.processed = true
        control['controlOut']()
    }
}

export class Add extends NodeBuilder {
    constructor() {
        super('Add', 'data')
    }

    build(node: Node) {
        node.addInput(new Input('inNumber1', 'InNumber', numberPin))
        node.addInput(new Input('inNumber2', 'InNumber', numberPin))
        node.addOutput(new Output('outNumber1', 'Number', numberPin))
    }

    async worker(node: Node, inputs: any, outputs: any, control: any) {
        node.processed = true
    }
}

export class Cast extends NodeBuilder {
    constructor() {
        super('Cast', 'data')
    }

    build(node: Node) {
        node.addInput(new Input('inNumber1', 'Number', numberPin))
        node.addOutput(new Output('outString1', 'Text', textPin))
    }

    async worker(node: Node, inputs: any, outputs: any, control: any) {
        node.processed = true
    }
}