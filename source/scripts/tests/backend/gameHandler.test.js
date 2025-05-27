/**
 * @description Unit tests for the GameHandler class.
 */

import { gameHandler } from "../../backend/gameHandler.js";
import { Card } from "../../backend/Card.js";
import { Hand } from "../../backend/Hand.js";
import { Deck } from "../../backend/Deck.js";
import { afterAll, jest } from "@jest/globals";

const originalLog = console.log;
const originalError = console.error;

describe("gameHandler", () => {
  beforeAll(() => {
    // Temporarily disable console logs and errors
    // console.log = jest.fn();
    // console.error = jest.fn();
  });

  afterAll(() => {
    // Restore console logs and errors
    console.log = originalLog;
    console.error = originalError;
  });

  test("dealCards fills the hand correctly", () => {
    // Create a new gameHandler instance
    const handler = new gameHandler();

    // Deal cards
    handler.dealCards();

    // Check if the main hand has the correct number of cards
    expect(handler.state.hands.main.cards.length).toBe(handler.state.handSize);

    // Check if the deck has the correct number of available cards
    expect(handler.state.deck.availableCards.length).toBe(
      52 - handler.state.handSize
    );
  });

  test("dealCards handles empty deck correctly", () => {
    // Create a new gameHandler instance
    const handler = new gameHandler();

    // Empty the deck
    handler.state.deck.availableCards = [];
    handler.state.deck.usedCards = [];

    // Deal cards
    handler.dealCards();

    // Check if the main hand is still empty
    expect(handler.state.hands.main.cards.length).toBe(0);
  });

  test("selectCard toggles card selection correctly", () => {
    // Create a new gameHandler instance
    const handler = new gameHandler();

    // Deal cards
    handler.dealCards();

    // Select the first card
    const selectedCard = handler.selectCard(handler.state.hands.main, 0);
    expect(selectedCard).toBe(true);
    expect(handler.state.hands.main.cards[0].isSelected).toBe(true);

    // Deselect the first card
    const deselectedCard = handler.selectCard(handler.state.hands.main, 0);
    expect(deselectedCard).toBe(false);
    expect(handler.state.hands.main.cards[0].isSelected).toBe(false);
  });

  test("selectCard handles invalid index correctly", () => {
    // Create a new gameHandler instance
    const handler = new gameHandler();

    // Deal cards
    handler.dealCards();

    // Select an invalid card index
    const selectedCard = handler.selectCard(handler.state.hands.main, -1);
    expect(selectedCard).toBe(false);
  });

  test("discardCards handles no cards selected correctly", () => {
    // Create a new gameHandler instance
    const handler = new gameHandler();

    // Deal cards
    handler.dealCards();

    // Discard without selecting any cards
    handler.discardCards();

    // Check if the main hand is still the same size
    expect(handler.state.hands.main.cards.length).toBe(5);
  });

  test("discardCards handles maximum discards reached correctly", () => {
    // Create a new gameHandler instance
    const handler = new gameHandler();

    // Deal cards
    handler.dealCards();

    // Select all cards in the main hand
    for (let i = 0; i < handler.state.hands.main.cards.length; i++) {
      handler.selectCard(handler.state.hands.main, i);
    }

    // Discard all selected cards
    handler.discardCards();

    // Check if the main hand is empty
    expect(handler.state.hands.main.cards.length).toBe(0);
  });

  // TODO: Scoring tests

  test("scoreHand calculates score correctly", () => {
    // Create a new gameHandler instance
    const handler = new gameHandler();

    // Set up played cards with 5 aces
    handler.state.hands.played.cards = [
      new Card("clubs", "A"),
      new Card("hearts", "A"),
      new Card("spades", "A"),
      new Card("diamonds", "A"),
      new Card("clubs", "A"),
    ];
    handler.state.roundScore = 0;
    handler.scoreHand();

    // Score should be 5 * 11 = 55
    expect(handler.state.roundScore).toBe(55);

    // Set up played cards with 3 numbered, 1 face, and 1 ace
    handler.state.hands.played.cards = [
      new Card("clubs", "2"),
      new Card("hearts", "3"),
      new Card("spades", "4"),
      new Card("diamonds", "J"),
      new Card("clubs", "A"),
    ];
    handler.state.roundScore = 0;
    handler.scoreHand();
    // Score should be 2 + 3 + 4 + 10 + 11 = 30
    expect(handler.state.roundScore).toBe(30);
  });

  describe("Integration Tests", () => {
    test("Discarding cards modifies internal values as expected", () => {
      // Make a gameHandler
      const handler = new gameHandler();

      // Make sure the deck has 52 cards
      expect(handler.state.deck.availableCards.length).toBe(52);

      // Make sure the main hand is empty
      expect(handler.state.hands.main.cards.length).toBe(0);

      // Deal cards
      handler.dealCards();
      // Make sure the main hand has 5 cards
      expect(handler.state.hands.main.cards.length).toBe(5);

      // Select the first card
      const selectedCard = handler.selectCard(handler.state.hands.main, 0);
      expect(selectedCard).toBe(true);
      expect(handler.state.hands.main.cards[0].isSelected).toBe(true);

      // Keep track of the suit/rank of the first card
      const firstCard = handler.state.hands.main.cards[0];
      const firstCardType = [firstCard.suit, firstCard.type];

      // Discard the first card
      handler.discardCards();

      // Make sure the main hand has 4 cards
      expect(handler.state.hands.main.cards.length).toBe(4);

      // Make sure the first card is no longer in the main hand
      expect(
        handler.state.hands.main.cards.find(
          (card) =>
            card.suit === firstCardType[0] && card.type === firstCardType[1]
        )
      ).toBeUndefined();

      // Make sure the deck has 52 cards in allCards, 47 in availableCards, and 4 in usedCards
      expect(handler.state.deck.allCards.length).toBe(52);
      expect(handler.state.deck.availableCards.length).toBe(47);
      expect(handler.state.deck.usedCards.length).toBe(5);

      // Deal cards again
      handler.dealCards();

      // Make sure the main hand has 5 cards
      expect(handler.state.hands.main.cards.length).toBe(5);

      // Make sure the deck has 46 cards in availableCards, 5 in usedCards, and 52 in allCards
      expect(handler.state.deck.availableCards.length).toBe(46);
      expect(handler.state.deck.usedCards.length).toBe(6);
      expect(handler.state.deck.allCards.length).toBe(52);

      // Discard all cards
      for (let i = 0; i < handler.state.hands.main.cards.length; i++) {
        handler.selectCard(handler.state.hands.main, i);
      }
      handler.discardCards();
      // Make sure the main hand is empty
      expect(handler.state.hands.main.cards.length).toBe(0);

      // Make sure the deck hasn't changed
      expect(handler.state.deck.allCards.length).toBe(52);
      expect(handler.state.deck.availableCards.length).toBe(46);
      expect(handler.state.deck.usedCards.length).toBe(6);

      // Deal cards again
      handler.dealCards();
      // Make sure the main hand has 5 cards
      expect(handler.state.hands.main.cards.length).toBe(5);

      // Make sure the deck has 41 cards in availableCards, 11 in usedCards, and 52 in allCards
      expect(handler.state.deck.availableCards.length).toBe(41);
      expect(handler.state.deck.usedCards.length).toBe(11);
      expect(handler.state.deck.allCards.length).toBe(52);

      // Currently should be 2 discards remaining
      expect(handler.state.discardsUsed).toBe(2);

      // Run a discard
      handler.discardCards();
      // There should still be 2 discards remaining, no cards were selected
      expect(handler.state.discardsUsed).toBe(2);

      // Select a card
      handler.selectCard(handler.state.hands.main, 0);
      // Discard the selected card
      handler.discardCards();

      // Make sure the main hand has 4 cards
      expect(handler.state.hands.main.cards.length).toBe(4);
      // Make sure the deck has 41 cards in availableCards, 11 in usedCards, and 52 in allCards
      expect(handler.state.deck.availableCards.length).toBe(41);
      expect(handler.state.deck.usedCards.length).toBe(11);
      expect(handler.state.deck.allCards.length).toBe(52);

      // Make sure the discardsUsed is now 3
      expect(handler.state.discardsUsed).toBe(3);

      // Deal cards again
      handler.dealCards();

      // Make sure the main hand has 5 cards
      expect(handler.state.hands.main.cards.length).toBe(5);

      // Discard all cards
      for (let i = 0; i < handler.state.hands.main.cards.length; i++) {
        handler.selectCard(handler.state.hands.main, i);
      }

      handler.discardCards();
      // Make sure the main hand is empty
      expect(handler.state.hands.main.cards.length).toBe(0);

      // Discard one more
      handler.dealCards();
      handler.selectCard(handler.state.hands.main, 0);
      handler.discardCards();

      // Maximum discards reached, that shouldn't work
      expect(handler.state.discardsUsed).toBe(4);
      expect(handler.state.hands.main.cards.length).toBe(5); // no discard

      // Final deck state
      expect(handler.state.deck.availableCards.length).toBe(35);
      expect(handler.state.deck.usedCards.length).toBe(17);
      expect(handler.state.deck.allCards.length).toBe(52);
    });
  });
});
