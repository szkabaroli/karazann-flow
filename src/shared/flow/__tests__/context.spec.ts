import { Context } from '../core/context'
import { NumberNode, PrintNode } from './testBuilders'
import { NodeBuilder } from '../builder'

describe('Context class', () => {
    let context: Context
    let builder1: NodeBuilder
    let builder2: NodeBuilder

    let mockEmit: jest.Mock

    beforeAll(() => {
        context = new Context()
        builder1 = new NumberNode()
        builder2 = new PrintNode()
        mockEmit = jest.fn()
    })

    beforeEach(() => {
        mockEmit.mockClear()
    })

    it('should register a builder and emit event', () => {
        context.on('builderregister', mockEmit)

        context.register(builder1)
        context.register(builder2)

        const expecting = new Map([
            [builder1.name, builder1],
            [builder2.name, builder2]
        ])

        expect(context.builders).toMatchObject(expecting)
        expect(mockEmit).toBeCalledTimes(2)
    })

    it('should emit event on destroy', () => {
        context.on('destroy', mockEmit)
        context.destroy()
        expect(mockEmit).toBeCalledTimes(1)
    })

    it('it should throw error if already registered', () => {
        expect(() => context.register(builder2)).toThrow()
    })
})
