export function arrayShuffler<T>(array: T[]): T[] {
    var tmp,
        current,
        top = array.length

    if (top)
        while (--top) {
            current = Math.floor(Math.random() * (top + 1))
            tmp = array[current]
            array[current] = array[top]
            array[top] = tmp
        }

    return array
}
