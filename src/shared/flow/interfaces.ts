import { PinType } from '.'

/** Data interfaces */

export interface IConnection {
    node: number
}

export type IInputConnection = IConnection & {
    output: string
}

export type IOutputConnection = IConnection & {
    input: string
}

export interface IInput {
    connections: IInputConnection[]
}

export interface IOutput {
    connections: IOutputConnection[]
}

export interface IInputs {
    [key: string]: IInput
}

export interface IOutputs {
    [key: string]: IOutput
}

export interface INode {
    id: number
    builderName: string
    // inputs: IInputs
    outputs: IOutputs
    metadata: {
        [key: string]: any
    }
}

export interface INodes {
    [id: string]: INode
}

export interface IData {
    nodes: INodes
}