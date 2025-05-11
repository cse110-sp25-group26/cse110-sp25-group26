/**
 * @class Card
 * @description Represents a playing card in the game.
 * 
 * @property {boolean} isFlipped - Indicates if the card is flipped.
 * @property {string} suit - The suit of the card (e.g., 'hearts', 'diamonds'). Contains 'joker' or 'consumable' if the card is a joker or consumable.
 * @property {string} type - The rank of the card (e.g., 'A', '2', '3', ..., 'K'). Contains the joker or consumable type if the card is a joker or consumable.
 */
export class Card {
    /**
     * @constructor
     * @param {string} suit - The suit of the card.
     * @param {string} type - The rank of the card.
     */
    constructor(suit, type) {
        this.isFlipped = false;
        this.suit = suit;
        this.type = type;
    }

    /**
     * @method flip
     * @description Flips the card.
     */
    flip() {
        this.isFlipped = !this.isFlipped;
    }
}