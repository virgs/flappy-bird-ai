import { describe, expect, it } from 'vitest'
import { sleep } from './sleep'

describe('sleep', () => {
    it('resolves after the specified delay', async () => {
        await expect(sleep(0)).resolves.toBeUndefined()
    })

    it('returns a Promise', () => {
        const result = sleep(0)
        expect(result).toBeInstanceOf(Promise)
    })
})
