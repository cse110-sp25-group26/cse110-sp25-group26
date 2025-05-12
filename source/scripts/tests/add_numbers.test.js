/**
 * @descriptionUnit tests for the addNumbers function.
 */

import { addNumbers } from '../add_numbers.js';

describe('addNumbers', () => {
    test('adds two positive numbers', () => {
        expect(addNumbers(2, 3)).toBe(5);
    });

    test('adds a positive and a negative number', () => {
        expect(addNumbers(-1, 1)).toBe(0);
    });

    test('adds two negative numbers', () => {
        expect(addNumbers(-2, -3)).toBe(-5);
    });

    test('adds zero to a number', () => {
        expect(addNumbers(0, 5)).toBe(5);
    });

    test('adds two floating point numbers', () => {
        expect(addNumbers(0.1, 0.2)).toBeCloseTo(0.3);
    });

    test('adds a number and a string', () => {
        expect(addNumbers('2', 3)).toBe(5);
    });
});