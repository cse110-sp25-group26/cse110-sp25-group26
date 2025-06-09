/**
 * @description Unit tests for the GameHandler class.
 */

import { gameHandler } from "../../backend/gameHandler.js";
import { Card } from "../../backend/Card.js";
import {
	jest,
	beforeAll,
	afterAll,
	expect,
	test,
	describe,
} from "@jest/globals";
import { UIInterface } from "../../backend/UIInterface.js";

// Mock localStorage
const localStorageMock = (() => {
	let store = {};
	return {
		getItem(key) {
			return store[key] || null;
		},
		setItem(key, value) {
			store[key] = value.toString();
		},
		removeItem(key) {
			delete store[key];
		},
		clear() {
			store = {};
		},
	};
})();

// Mock all localStorage for the browser
global.localStorage = localStorageMock;

const originalLog = console.log;
const originalError = console.error;

/**
 * @classdesc Mock implementation of the UIInterface for testing purposes.
 */
class MockUIInterface extends UIInterface {
	/**
	 * @class MockUIInterface
	 * @description A mock implementation of the UIInterface for testing the gameHandler.
	 */
	constructor() {
		super();
	}

	/**
	 * @function createUIel
	 * @description Stub method for creating UI elements.
	 */
	createUIel() {}

	/**
	 * @function moveMultiple
	 * @description Stub method for moving cards.
	 */
	moveMultiple() {}

	/**
	 * @function removeUIel
	 * @description Stub method for removing UI elements.
	 */
	removeUIel() {}

	/**
	 * @function displayLoss
	 * @description Stub method for displaying loss message.
	 */
	displayLoss() {}

	/**
	 * @function exitGame
	 * @description Stub method for exiting the game.
	 */
	exitGame() {}

	/**
	 * @function newGame
	 * @description Stub method for starting a new game.
	 */
	newGame() {}

	/**
	 * @function scoreCard
	 * @description Stub method for scoring a card.
	 */
	scoreCard() {}

	/**
	 * @typedef {object} ScorekeeperData
	 * @property {string} name - The name of the scorekeeper entry.
	 * @property {number} value - The value of the scorekeeper entry.
	 */

	/**
	 * @function updateScorekeeper
	 * @description Stub method for updating the scorekeeper.
	 */
	updateScorekeeper() {}

	/**
	 * @function displayBust
	 * @description Stub method for displaying bust notification.
	 */
	displayBust() {}

	/**
	 * @function displayMoney
	 * @description Stub method for displaying money won.
	 */
	displayMoney() {}

	/**
	 * @function displayWin
	 * @description Stub method for displaying win message.
	 */
	displayWin() {}

	/**
	 * @function promptEndlessMode
	 * @description Stub method for prompting endless mode.
	 * @returns {boolean} - Stub return value.
	 */
	promptEndlessMode() {
		return false;
	}

	/**
	 * @function disallowPlay
	 * @description Stub method for disallowing play.
	 */
	disallowPlay() {}

	/**
	 * @function allowPlay
	 * @description Stub method for allowing play.
	 */
	allowPlay() {}
}

describe("gameHandler", () => {
	beforeAll(() => {
		// Temporarily disable console logs and errors
		console.log = jest.fn();
		console.error = jest.fn();
	});

	afterAll(() => {
		// Restore console logs and errors
		console.log = originalLog;
		console.error = originalError;
	});

	test("dealCards fills the hand correctly", () => {
		// Create a new gameHandler instance
		const handler = new gameHandler(new MockUIInterface());

		// Deal cards
		handler.dealCards();

		// Check if the main hand has the correct number of cards
		expect(handler.state.hands.main.cards.length).toBe(
			handler.state.handSize
		);

		// Check if the deck has the correct number of available cards
		expect(handler.state.deck.availableCards.length).toBe(
			52 - handler.state.handSize
		);
	});

	test("dealCards handles empty deck correctly", () => {
		// Create a new gameHandler instance
		const handler = new gameHandler(new MockUIInterface());

		// Empty the deck
		handler.state.deck.availableCards = [];
		handler.state.deck.usedCards = [];
		handler.state.hands.main.cards = [];

		// Deal cards
		handler.dealCards();

		// Check if the main hand is still empty
		expect(handler.state.hands.main.cards.length).toBe(0);
	});

	test("selectCard toggles card selection correctly", () => {
		// Create a new gameHandler instance
		const handler = new gameHandler(new MockUIInterface());

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
		const handler = new gameHandler(new MockUIInterface());

		// Deal cards
		handler.dealCards();

		// Select an invalid card index
		const selectedCard = handler.selectCard(handler.state.hands.main, -1);
		expect(selectedCard).toBe(false);
	});

	test("discardCards handles no cards selected correctly", () => {
		// Create a new gameHandler instance
		const handler = new gameHandler(new MockUIInterface());

		// Deal cards
		handler.dealCards();

		// Discard without selecting any cards
		handler.discardCards();

		// Check if the main hand is still the same size
		expect(handler.state.hands.main.cards.length).toBe(5);
	});

	test("discardCards handles maximum discards reached correctly", () => {
		// Create a new gameHandler instance
		const handler = new gameHandler(new MockUIInterface());

		// Deal cards
		handler.dealCards();

		// Save original cards for later comparison
		const originalCards = [...handler.state.hands.main.cards];

		// Manually set discardsUsed to maximum
		handler.state.discardsUsed = handler.state.discardCount;

		// Select the first card
		handler.selectCard(handler.state.hands.main, 0);

		// Try to discard when maximum is reached
		handler.discardCards();

		// Verify hand still has 5 cards and nothing was discarded
		expect(handler.state.hands.main.cards.length).toBe(5);
		// Verify the cards are the same objects as before
		expect(handler.state.hands.main.cards).toEqual(originalCards);
	});

	test("discarding all cards empties the hand and deals new cards", () => {
		// Create a new gameHandler instance
		const handler = new gameHandler(new MockUIInterface());

		// Deal cards
		handler.dealCards();

		// Save original cards
		const originalCards = [...handler.state.hands.main.cards];

		// Select all cards in the main hand
		for (let i = 0; i < handler.state.hands.main.cards.length; i++) {
			handler.selectCard(handler.state.hands.main, i);
		}

		// Discard all selected cards
		handler.discardCards();

		// Make sure the main hand was refilled
		expect(handler.state.hands.main.cards.length).toBe(5);

		// Verify new cards are different from original cards
		const newCards = handler.state.hands.main.cards;
		const hasOverlap = newCards.some((newCard) =>
			originalCards.some(
				(oldCard) =>
					oldCard.suit === newCard.suit &&
					oldCard.type === newCard.type
			)
		);

		expect(hasOverlap).toBe(false);
	});

	test("scoreHand calculates score correctly", () => {
		// Create a new gameHandler instance
		const handler = new gameHandler(new MockUIInterface());

		// Set up played cards with 5 aces
		handler.state.hands.played.cards = [
			new Card("clubs", "A"),
			new Card("hearts", "A"),
			new Card("spades", "A"),
			new Card("diamonds", "A"),
			new Card("clubs", "A"),
		];
		handler.state.roundScore = 0;
		handler.scoringHandler.scoreHand();

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
		handler.scoringHandler.scoreHand();
		// Score should be 2 + 3 + 4 + 10 + 11 = 30
		expect(handler.state.roundScore).toBe(30);
	});

	describe("Integration Tests", () => {
		test("Discarding cards modifies internal values as expected", () => {
			// Make a gameHandler
			const handler = new gameHandler(new MockUIInterface());

			// Make sure the deck has 52 cards
			expect(handler.state.deck.availableCards.length).toBe(47);

			// Make sure the main hand is empty
			expect(handler.state.hands.main.cards.length).toBe(5);

			// Save all original cards for comparison
			const originalCards = [...handler.state.hands.main.cards];

			// Select the first card
			const selectedCard = handler.selectCard(
				handler.state.hands.main,
				0
			);
			expect(selectedCard).toBe(true);
			expect(handler.state.hands.main.cards[0].isSelected).toBe(true);

			// Track which cards were not selected
			const nonSelectedCards = originalCards.filter((_, i) => i !== 0);

			// Keep track of the suit/rank of the first card
			const firstCard = handler.state.hands.main.cards[0];
			const firstCardType = [firstCard.suit, firstCard.type];

			// Discard the first card
			handler.discardCards();

			// Make sure the main hand was refilled
			expect(handler.state.hands.main.cards.length).toBe(5);

			// Make sure the first card is no longer in the main hand
			expect(
				handler.state.hands.main.cards.find(
					(card) =>
						card.suit === firstCardType[0] &&
						card.type === firstCardType[1]
				)
			).toBeUndefined();

			// Verify non-selected cards remain unchanged
			for (const nonSelectedCard of nonSelectedCards) {
				expect(
					handler.state.hands.main.cards.some(
						(card) =>
							card.suit === nonSelectedCard.suit &&
							card.type === nonSelectedCard.type
					)
				).toBe(true);
			}

			// Make sure the deck has 52 cards in allCards, 47 in availableCards, and 4 in usedCards
			expect(handler.state.deck.allCards.length).toBe(52);
			expect(handler.state.deck.availableCards.length).toBe(46);
			expect(handler.state.deck.usedCards.length).toBe(6);

			// Discard all cards
			for (let i = 0; i < handler.state.hands.main.cards.length; i++) {
				handler.selectCard(handler.state.hands.main, i);
			}

			// Save cards before full discard
			const beforeFullDiscardCards = [...handler.state.hands.main.cards];

			handler.discardCards();

			// Make sure the main hand has 5 cards
			expect(handler.state.hands.main.cards.length).toBe(5);

			// Verify no overlap between old and new cards (completely new hand)
			const hasOverlap = handler.state.hands.main.cards.some((newCard) =>
				beforeFullDiscardCards.some(
					(oldCard) =>
						oldCard.suit === newCard.suit &&
						oldCard.type === newCard.type
				)
			);
			expect(hasOverlap).toBe(false);

			// Make sure the deck has 41 cards in availableCards, 11 in usedCards, and 52 in allCards
			expect(handler.state.deck.availableCards.length).toBe(41);
			expect(handler.state.deck.usedCards.length).toBe(11);
			expect(handler.state.deck.allCards.length).toBe(52);

			// Currently should be 2 discards remaining
			expect(handler.state.discardsUsed).toBe(2);

			// Run a discard without selecting cards
			const beforeNoSelectionCards = [...handler.state.hands.main.cards];
			handler.discardCards();

			// There should still be 2 discards remaining, no cards were selected
			expect(handler.state.discardsUsed).toBe(2);

			// Verify hand didn't change at all when no cards were selected
			expect(handler.state.hands.main.cards).toEqual(
				beforeNoSelectionCards
			);

			// Select a card
			handler.selectCard(handler.state.hands.main, 0);
			const thirdDiscardSelectedCard = handler.state.hands.main.cards[0];
			const thirdDiscardNonSelectedCards =
				handler.state.hands.main.cards.filter((_, i) => i !== 0);

			// Discard the selected card
			handler.discardCards();

			// Make sure the discardsUsed is now 3
			expect(handler.state.discardsUsed).toBe(3);

			// Make sure the main hand has 5 cards
			expect(handler.state.hands.main.cards.length).toBe(5);

			// Verify selected card was replaced
			expect(
				handler.state.hands.main.cards.find(
					(card) =>
						card.suit === thirdDiscardSelectedCard.suit &&
						card.type === thirdDiscardSelectedCard.type
				)
			).toBeUndefined();

			// Verify non-selected cards remain unchanged
			for (const nonSelectedCard of thirdDiscardNonSelectedCards) {
				expect(
					handler.state.hands.main.cards.some(
						(card) =>
							card.suit === nonSelectedCard.suit &&
							card.type === nonSelectedCard.type
					)
				).toBe(true);
			}

			// Discard all cards
			for (let i = 0; i < handler.state.hands.main.cards.length; i++) {
				handler.selectCard(handler.state.hands.main, i);
			}

			handler.discardCards();

			// Discard one more
			handler.selectCard(handler.state.hands.main, 0);

			// Save the cards before attempting discard past max
			const maxDiscardReachedCards = [...handler.state.hands.main.cards];

			handler.discardCards();

			// Maximum discards reached, that shouldn't work
			expect(handler.state.discardsUsed).toBe(4);
			expect(handler.state.hands.main.cards.length).toBe(5); // no discard

			// Verify the hand contains EXACTLY the same card objects (no changes at all)
			expect(handler.state.hands.main.cards).toEqual(
				maxDiscardReachedCards
			);

			// Final deck state
			expect(handler.state.deck.availableCards.length).toBe(35);
			expect(handler.state.deck.usedCards.length).toBe(17);
			expect(handler.state.deck.allCards.length).toBe(52);
		});
	});
});