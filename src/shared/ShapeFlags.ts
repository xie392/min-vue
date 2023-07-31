export enum ShapeFlags {
    ELEMENT = 1, // 0000
    STATEFUL_COMPONENT = 1 << 1, // 0010
    TEXT_CHILDREN = 1 << 2, // 0100
    ARRAY_CHILDREN = 1 << 3, // 1000
    SLOTS_CHILDREN = 1 << 4, // 10000
}
