import { DEFAULT_ATTRS } from "./constants";

export type AttributeName = "str" | "dex" | "con" | "int" | "wis" | "chr";

export type AttributesRecord = Record<AttributeName, number>;

export class AttributeSet {
  private readonly attrs: AttributesRecord;

  constructor(base?: Partial<AttributesRecord>) {
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

  get(attr: AttributeName): number {
    return this.attrs[attr];
  }

  modify(attr: AttributeName, amount: number): void {
    this.attrs[attr] += Math.floor(amount);
  }

  modifier(attr: AttributeName): number {
    return Math.floor((this.get(attr) - 10) / 2);
  }

  clone(): AttributeSet {
    return new AttributeSet({ ...this.attrs });
  }

  toObject(): AttributesRecord {
    return { ...this.attrs };
  }
}
