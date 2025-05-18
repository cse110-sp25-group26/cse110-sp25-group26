/**
 * @description Unit tests for the utilities within utils.js.
 */

import { mock } from 'node:test';
import { Card } from '../Card.js';
import { calculateBlackjackScore, staggered } from '../utils.js';
import { jest } from '@jest/globals';

describe('calculateBlackjackScore', () => {
    test('Calculates score correctly for a hand without Aces', () => {
        const cards = [
            new Card('hearts', '10'),
            new Card('diamonds', 'K'),
            new Card('clubs', '5')
        ];
        expect(calculateBlackjackScore(cards)).toBe(25);
    });

    test('Calculates score correctly for a hand with Aces', () => {
        const cards = [
            new Card('hearts', 'A'),
            new Card('diamonds', 'K'),
            new Card('clubs', '5')
        ];
        expect(calculateBlackjackScore(cards)).toBe(16);
    });

    test('Calculates score correctly for a hand with multiple Aces', () => {
        const cards = [
            new Card('hearts', 'A'),
            new Card('diamonds', 'A'),
            new Card('clubs', '5')
        ];
        expect(calculateBlackjackScore(cards)).toBe(17);
    });

    test('Calculates score correctly for a hand with face cards and Aces', () => {
        const cards = [
            new Card('hearts', 'A'),
            new Card('diamonds', 'K'),
            new Card('clubs', 'Q')
        ];
        expect(calculateBlackjackScore(cards)).toBe(21);
    });

    test('Calculates score correctly for a hand with only face cards', () => {
        const cards = [
            new Card('hearts', 'K'),
            new Card('diamonds', 'Q'),
            new Card('clubs', 'J')
        ];
        expect(calculateBlackjackScore(cards)).toBe(30);
    });

    test('Handles jokers and consumables correctly by skipping them in the score calculation', () => {
        const cards = [
            new Card('joker', 'wildcard'), // Joker
            new Card('hearts', 'A'),       // Ace
            new Card('consumable', 'potion') // Consumable
        ];
        expect(calculateBlackjackScore(cards)).toBe(11); // Only Ace counts
    });
});

describe('staggered', () => {

    // Uses Jest's Fake Timers. https://jestjs.io/docs/timer-mocks
    beforeEach(() => {
        jest.useFakeTimers();
    });
    afterEach(() => {
        jest.useRealTimers();
    });

    test('Calls function with the right time delay', async () => {
        const mockFn = jest.fn();
        const array = [1, 2, 3];
        const delay = 100;

        // Start the function
        const promise = staggered(array, mockFn, delay);

        expect(mockFn).not.toHaveBeenCalled();

        // 1st tick: nothing before 100ms
        jest.advanceTimersByTime(delay - 1);
        expect(mockFn).not.toHaveBeenCalled();

        // Fire the 1st callback
        jest.advanceTimersByTime(1);
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenNthCalledWith(1, 1);

        // 2nd callback at 200ms
        jest.advanceTimersByTime(delay);
        expect(mockFn).toHaveBeenCalledTimes(2);
        expect(mockFn).toHaveBeenNthCalledWith(2, 2);

        // 3rd callback at 300ms
        jest.advanceTimersByTime(delay);
        expect(mockFn).toHaveBeenCalledTimes(3);
        expect(mockFn).toHaveBeenNthCalledWith(3, 3);

        // 🌟 4th tick at 400ms: clearInterval + resolve()
        jest.advanceTimersByTime(delay);
        await promise;
    });

    test('Resolves immediately and never calls the function if the array is empty', async () => {
        const mockFn = jest.fn();
        const promise = staggered([], mockFn, 100);

        jest.advanceTimersByTime(100);
        expect(mockFn).not.toHaveBeenCalled();

        await expect(promise).resolves.toBeUndefined();
    });

    test('Uses default delay=0: fires all callbacks on next tick', async () => {
        const mockFn = jest.fn();
        const array = ['a', 'b', 'c'];

        const promise = staggered(array, mockFn);
        // Advance all pending timers (zero-delay)
        jest.advanceTimersByTime(0);

        expect(mockFn).toHaveBeenCalledTimes(array.length);
        expect(mockFn).toHaveBeenNthCalledWith(1, 'a');
        expect(mockFn).toHaveBeenNthCalledWith(2, 'b');
        expect(mockFn).toHaveBeenNthCalledWith(3, 'c');

        await expect(promise).resolves.toBeUndefined();
    });

    test('Promise resolves to undefined when all items have been processed', async () => {
        const mockFn = jest.fn();
        const array = [1, 2, 3];
        const delay = 100;

        const promise = staggered(array, mockFn, delay);

        jest.advanceTimersByTime(delay * array.length);
        jest.runAllTimers();

        await Promise.resolve();

        await expect(promise).resolves.toBeUndefined();
    });


    test('No extra calls after all items have been processed', async () => {
        const mockFn = jest.fn();
        const arr = [1, 2];
        const delay = 50;

        const promise = staggered(arr, mockFn, delay);

        jest.advanceTimersByTime(delay * (arr.length + 1));
        await promise;

        expect(mockFn).toHaveBeenCalledTimes(arr.length);
        expect(mockFn).toHaveBeenNthCalledWith(1, 1);
        expect(mockFn).toHaveBeenNthCalledWith(2, 2);

        jest.advanceTimersByTime(1000);
        expect(mockFn).toHaveBeenCalledTimes(arr.length);
    });
});
