import { describe, expect, it } from 'vitest'
import { arrayShuffler } from './array-shufller'

describe('arrayShuffler', () => {
    it('returns an empty array when given an empty array', () => {
        expect(arrayShuffler([])).toEqual([])
    })

    it('returns the same single-element array unchanged', () => {
        expect(arrayShuffler([42])).toEqual([42])
    })

    it('preserves all elements after shuffle', () => {
        const input = [1, 2, 3, 4, 5]
        const result = arrayShuffler([...input])
        expect(result.sort((a, b) => a - b)).toEqual(input)
    })

    it('mutates and returns the original array reference', () => {
        const input = [1, 2, 3]
        const result = arrayShuffler(input)
        expect(result).toBe(input)
    })

    it('handles arrays with duplicate values', () => {
        const input = [1, 1, 2, 2]
        const result = arrayShuffler([...input])
        expect(result.sort((a, b) => a - b)).toEqual([1, 1, 2, 2])
    })

    it('handles arrays of strings', () => {
        const input = ['a', 'b', 'c']
        const result = arrayShuffler([...input])
        expect(result.sort()).toEqual(['a', 'b', 'c'])
    })
})
