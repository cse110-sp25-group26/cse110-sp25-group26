/**
 * @description Unit tests for the Card class.
 */

import { Card } from '../../backend/Card.js';

describe('Card', () => {
    test('Card constructor initializes properties correctly', () => {
        const card = new Card('hearts', 'A');
        expect(card.isFlipped).toBe(false);
        expect(card.suit).toBe('hearts');
        expect(card.type).toBe('A');
    });

    test('Card flip method toggles isFlipped property', () => {
        const card = new Card('hearts', 'A');
        expect(card.isFlipped).toBe(false);
        card.flip();
        expect(card.isFlipped).toBe(true);
        card.flip();
        expect(card.isFlipped).toBe(false);
    });
});