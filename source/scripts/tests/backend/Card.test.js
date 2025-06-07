/**
 * @description Unit tests for the Card class.
 */

import { Card } from '../../backend/Card.js';

describe('Card', () => {

    // Constructor
    test('Card constructor initializes properties correctly', () => {
        const card = new Card('hearts', 'A');
        expect(card.isFlipped).toBe(false);
        expect(card.suit).toBe('hearts');
        expect(card.type).toBe('A');
    });

    // flip
    test('Card flip method toggles isFlipped property', () => {
        const card = new Card('hearts', 'A');
        expect(card.isFlipped).toBe(false);
        card.flip();
        expect(card.isFlipped).toBe(true);
        card.flip();
        expect(card.isFlipped).toBe(false);
    });

    // toggleSelect
    test('Card toggleSelect method toggles isSelected property', () => {
        const card = new Card('hearts', 'A');
        expect(card.isSelected).toBe(false);
        const newState = card.toggleSelect();
        expect(card.isSelected).toBe(true);
        expect(newState).toBe(true);

        const newState2 = card.toggleSelect();
        expect(card.isSelected).toBe(false);
        expect(newState2).toBe(false);
    });

    // addProperty
    test('Card addProperty method adds property correctly', () => {
        const card = new Card('hearts', 'A');
        expect(card.addProperty('seal_gold')).toBe(true);
        expect(card.properties).toContain('seal_gold');
        expect(card.addProperty('seal_gold')).toBe(false);
        expect(card.properties.length).toBe(1);
    });

    test('Card addProperty method does not add duplicate properties', () => {
        const card = new Card('hearts', 'A');
        expect(card.addProperty('holo')).toBe(true);
        expect(card.addProperty('holo')).toBe(false);
        expect(card.properties).toContain('holo');
        expect(card.properties.length).toBe(1);
    });

    // removeProperty
    test('Card removeProperty method removes property correctly', () => {
        const card = new Card('hearts', 'A');
        card.addProperty('holo');
        expect(card.removeProperty('holo')).toBe(true);
        expect(card.properties).not.toContain('holo');
        expect(card.removeProperty('holo')).toBe(false);
    });

    test('Card removeProperty method does not remove non-existing properties (1)', () => {
        const card = new Card('hearts', 'A');
        expect(card.removeProperty('non_existing_property')).toBe(false);
    });

    test('Card removeProperty method does not remove non-existing properties (2)', () => {
        const card = new Card('hearts', 'A');
        card.addProperty('holo');
        expect(card.removeProperty('non_existing_property')).toBe(false);
        expect(card.properties).toContain('holo');
    });

    // hasProperty
    test('Card hasProperty method checks for existing properties', () => {
        const card = new Card('hearts', 'A');
        card.addProperty('holo');
        expect(card.hasProperty('holo')).toBe(true);
        expect(card.hasProperty('non_existing_property')).toBe(false);
    });

    test('Card hasProperty method checks for non-existing properties', () => {
        const card = new Card('hearts', 'A');
        expect(card.hasProperty('non_existing_property')).toBe(false);
    });
});