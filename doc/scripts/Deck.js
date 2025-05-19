import { Card } from './Card.js';

/**
 * @classdesc Represents a deck of cards in the game.
 *
 * @property {Card[]} availableCards - The cards available in the deck.
 * @property {Card[]} usedCards - The cards that have been used from the deck.
 * @property {Card[]} allCards - All cards in the deck, including available and used cards.
 * @property {HTMLElement} container - The DOM element containing the deck's UI.
 */
export class Deck {
  /**
   * @class Deck
   * @description Creates a new deck of cards.
   * @param {Card[]} cards - The cards to be included in the deck.
   * @param {string} containerId - The ID of the DOM element to contain the deck's UI.
   */
  constructor(cards, containerId) {
    this.availableCards = cards;
    this.usedCards = [];
    this.allCards = [...cards];
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Deck container with ID ${containerId} not found`);
    }
    this.shuffle();
  }

  /**
   * @function createUICard
   * @description Creates a UI element for a card and adds it to the deck's container.
   * @param {Card} card - The card to create a UI element for.
   * @returns {HTMLElement} - The created UI element.
   */
  createUICard(card) {
    if (!(card instanceof Card)) {
      throw new Error('Invalid Card object');
    }
    if (!this.allCards.includes(card)) {
      this.addCard(card); // Ensure card is in deck
    }
    const cardElement = card.createUIElement();
    cardElement.style.left = '0px';
    cardElement.style.top = '0px';
    card.UIel = cardElement; // <-- Add this line
    this.container.appendChild(cardElement);
    return cardElement;
  }

  /**
   * @function shuffle
   * @description Shuffles the deck of cards using the Fisher-Yates algorithm.
   */
  shuffle() {
    for (let i = this.availableCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.availableCards[i], this.availableCards[j]] = [
        this.availableCards[j],
        this.availableCards[i]
      ];
    }
  }

  /**
   * @function drawCard
   * @description Draws a card from the deck and creates its UI element.
   * @returns {Card|null} - The drawn card or null if no cards are available.
   */
  drawCard() {
    if (this.availableCards.length === 0) {
      return null;
    }
    const card = this.availableCards.pop();
    this.usedCards.push(card);
    this.createUICard(card); // Create UI element when drawn
    return card;
  }

  /**
   * @function returnCard
   * @description Returns a card to the deck.
   * @param {Card} card - The card to be returned.
   */
  returnCard(card) {
    const index = this.usedCards.indexOf(card);
    if (index !== -1) {
      this.usedCards.splice(index, 1);
      this.availableCards.push(card);
    }
  }

  /**
   * @function resetDeck
   * @description Resets the deck to its original state and clears UI elements.
   */
  resetDeck() {
    this.availableCards = [...this.allCards];
    this.usedCards = [];
    this.container.innerHTML = ''; // Clear UI elements
    this.shuffle();
  }

  /**
   * @function addCard
   * @description Adds a new card to the deck and shuffles the deck.
   * @param {Card} card - The card to be added.
   * @returns {boolean} - Returns true if the card was added successfully, false if the card already exists in the deck.
   */
  addCard(card) {
    if (this.allCards.includes(card)) {
      console.error('Deck::addCard - Card already exists in the deck.');
      return false;
    }
    this.allCards.push(card);
    this.availableCards.push(card);
    this.shuffle();
    return true;
  }

  /**
   * @function removeCard
   * @description Removes a card from the deck and its UI element.
   * @param {Card} card - The card to be removed.
   * @returns {boolean} - Returns true if the card was removed successfully, false if the card does not exist in the deck.
   */
  removeCard(card) {
    const index = this.allCards.indexOf(card);
    if (index === -1) {
      console.error('Deck::removeCard - Card does not exist in the deck.');
      return false;
    }
    this.allCards.splice(index, 1);
    const availableIndex = this.availableCards.indexOf(card);
    if (availableIndex !== -1) {
      this.availableCards.splice(availableIndex, 1);
    }
    if (card.UIel && card.UIel.parentElement === this.container) {
      this.container.removeChild(card.UIel);
    }
    return true;
  }
}