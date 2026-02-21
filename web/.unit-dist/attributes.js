import { DEFAULT_ATTRS } from "./constants";
export class AttributeSet {
    attrs;
    constructor(base) {
        this.attrs = {
            str: DEFAULT_ATTRS.str,
            dex: DEFAULT_ATTRS.dex,
            con: DEFAULT_ATTRS.con,
            int: DEFAULT_ATTRS.int,
            wis: DEFAULT_ATTRS.wis,
            chr: DEFAULT_ATTRS.chr,
            ...base,
        };
    }
    get(attr) {
        return this.attrs[attr];
    }
    modify(attr, amount) {
        this.attrs[attr] += Math.floor(amount);
    }
    modifier(attr) {
        return Math.floor((this.get(attr) - 10) / 2);
    }
    clone() {
        return new AttributeSet({ ...this.attrs });
    }
    toObject() {
        return { ...this.attrs };
    }
}
