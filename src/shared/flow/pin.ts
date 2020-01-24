/*!
 * Copyright (c) 2019 Roland Sz.Kovács.
 */

export enum PinType {
    Flow,
    Data
}

export class Pin {
    constructor(public name: string, public type: PinType, private compatible: Pin[] = [], private data = {}) {}

    combineWith(pin: Pin): void {
        if (this.type === pin.type) {
            this.compatible.push(pin)
        } else throw new TypeError('The pins you want to combine has different types, which is not allowed!')
    }

    isFlow() {
        return this.type === PinType.Flow
    }

    compatibleWith(pin: Pin): boolean {
        return this === pin || this.compatible.includes(pin)
    }
}
