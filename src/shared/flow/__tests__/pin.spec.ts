import { Pin, PinType } from '../pin'

describe('Pin class', () => {
    it('Pin arguments', () => {
        expect(() => new Pin('ValidPin', PinType.Data)).not.toThrow()
    })

    it('should compatible', () => {
        const pinNumber = new Pin('Number', PinType.Data)
        const pinString = new Pin('String', PinType.Data)
        const pinBoolean = new Pin('Boolean', PinType.Data)

        expect(pinNumber.compatibleWith(pinNumber)).toBe(true)
        expect(pinNumber.compatibleWith(pinString)).toBe(false)
        expect(pinBoolean.compatibleWith(pinNumber)).toBe(false)

        pinBoolean.combineWith(pinNumber)

        expect(pinBoolean.compatibleWith(pinNumber)).toBe(true)
        expect(pinNumber.compatibleWith(pinBoolean)).toBe(false)
        expect(pinBoolean.compatibleWith(pinString)).toBe(false)
    })

    it('should has a correct isFlow() method', () => {
        const pinData = new Pin('Data', PinType.Data)
        const pinFlow = new Pin('Flow', PinType.Flow)

        expect(pinData.isFlow()).toBe(false)
        expect(pinFlow.isFlow()).toBe(true)
    })

    it('should throw error when we want to combine two pin with different type', () => {
        const pinNumber = new Pin('Number', PinType.Data)
        const pinFlow = new Pin('Flow', PinType.Flow)

        expect(() => pinFlow.combineWith(pinNumber)).toThrow(TypeError)
        expect(pinFlow.compatibleWith(pinNumber)).toBe(false)
    })
})
