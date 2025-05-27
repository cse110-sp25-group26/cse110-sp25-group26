import { Hand } from "../../backend/Hand.js";
import { Card } from "../../backend/Card.js";
import { jest } from "@jest/globals";

describe("Hand", () => {
  test("Constructor initializes properties correctly", () => {
    const hand = new Hand();
    expect(hand.cards).toEqual([]);
    expect(hand.sortMethod).toBeNull();
  });

  test("sortBySuit sorts cards by suit then value", () => {
    const hand = new Hand();
    hand.addCard(new Card("clubs", "A"));
    hand.addCard(new Card("hearts", "2"));
    hand.addCard(new Card("spades", "K"));
    hand.addCard(new Card("diamonds", "10"));
    hand.sortBySuit();
    expect(hand.sortMethod).toBe("suit");
    expect(hand.cards[0].suit).toBe("hearts");
    expect(hand.cards[1].suit).toBe("diamonds");
    expect(hand.cards[2].suit).toBe("clubs");
    expect(hand.cards[3].suit).toBe("spades");
  });

  test("sortByValue sorts cards by value then suit", () => {
    const hand = new Hand();
    hand.addCard(new Card("clubs", "A"));
    hand.addCard(new Card("hearts", "2"));
    hand.addCard(new Card("spades", "K"));
    hand.addCard(new Card("diamonds", "10"));
    hand.sortByValue();
    expect(hand.sortMethod).toBe("value");
    expect(hand.cards[0].type).toBe("2");
    expect(hand.cards[1].type).toBe("10");
    expect(hand.cards[2].type).toBe("K");
    expect(hand.cards[3].type).toBe("A");
  });

  test("addCard without index inserts in sorted position", () => {
    const hand = new Hand();
    hand.sortByValue();
    hand.addCard(new Card("hearts", "5")); // first card
    hand.addCard(new Card("hearts", "2")); // should insert before '5'
    expect(hand.cards.map((c) => c.type)).toEqual(["2", "5"]);
  });

  test("addCard with index inserts at correct position and disables sorting", () => {
    const hand = new Hand();
    hand.addCard(new Card("diamonds", "K"));
    hand.addCard(new Card("clubs", "3"));
    hand.sortBySuit();
    hand.addCard(new Card("spades", "A"), 1);
    expect(hand.sortMethod).toBeNull();
    expect(hand.cards[1].type).toBe("A");
  });

  test("removeCard returns the correct card and removes it from the hand", () => {
    const hand = new Hand();
    hand.addCard(new Card("hearts", "9"));
    hand.addCard(new Card("hearts", "J"));
    const removed = hand.removeCard(0);
    expect(removed.type).toBe("9");
    expect(hand.cards.length).toBe(1);
  });

  test("moveCard changes the card position and disables sorting", () => {
    const hand = new Hand();
    hand.addCard(new Card("hearts", "Q"));
    hand.addCard(new Card("clubs", "5"));
    hand.addCard(new Card("spades", "A"));
    const success = hand.moveCard(0, 2);
    expect(success).toBe(true);
    expect(hand.sortMethod).toBeNull();
    expect(hand.cards.map((c) => c.type)).toEqual(["5", "A", "Q"]);
  });

  test("getInsertIndex returns correct position based on sorting method", () => {
    const hand = new Hand();
    hand.sortByValue();
    hand.addCard(new Card("hearts", "2"));
    hand.addCard(new Card("clubs", "5"));
    expect(hand.getInsertIndex(new Card("diamonds", "3"))).toBe(1);
    expect(hand.getInsertIndex(new Card("spades", "K"))).toBe(2);
  });

  test("getInsertIndex with empty hand returns 0", () => {
    const hand = new Hand();
    hand.sortByValue();
    expect(hand.getInsertIndex(new Card("hearts", "3"))).toBe(0);
  });

  test("removeCard with invalid index returns null", () => {
    const hand = new Hand();
    hand.addCard(new Card("hearts", "9"));
    hand.addCard(new Card("hearts", "J"));
    expect(hand.removeCard(-1)).toBeNull();
    expect(hand.removeCard(2)).toBeNull();
    expect(hand.cards.length).toBe(2);
  });

  test("removeCard from empty hand returns null", () => {
    const hand = new Hand();
    expect(hand.removeCard(0)).toBeNull();
    expect(hand.cards.length).toBe(0);
  });

  test("moveCard with invalid indices returns false", () => {
    const hand = new Hand();
    hand.addCard(new Card("hearts", "Q"));

    // Temporarily disable console.error to avoid cluttering test output
    const originalError = console.error;
    console.error = jest.fn();

    expect(hand.moveCard(-1, 0)).toBe(false);
    expect(hand.moveCard(0, -1)).toBe(false);
    expect(hand.moveCard(1, 0)).toBe(false);
    expect(hand.moveCard(0, 1)).toBe(false);

    // Restore console.error
    console.error = originalError;
  });

  test("sortBySuit handles secondary sort by value correctly", () => {
    const hand = new Hand();
    hand.addCard(new Card("hearts", "K"));
    hand.addCard(new Card("hearts", "2"));
    hand.addCard(new Card("clubs", "A"));
    hand.addCard(new Card("clubs", "5"));
    hand.sortBySuit();

    // Hearts should come first, then diamonds, then clubs, then spades
    // Within each suit, cards should be sorted by value
    expect(hand.cards[0].suit).toBe("hearts");
    expect(hand.cards[0].type).toBe("2");
    expect(hand.cards[1].suit).toBe("hearts");
    expect(hand.cards[1].type).toBe("K");
    expect(hand.cards[2].suit).toBe("clubs");
    expect(hand.cards[2].type).toBe("5");
    expect(hand.cards[3].suit).toBe("clubs");
    expect(hand.cards[3].type).toBe("A");
  });

  test("sortByValue handles secondary sort by suit correctly", () => {
    const hand = new Hand();
    hand.addCard(new Card("hearts", "10"));
    hand.addCard(new Card("clubs", "10"));
    hand.addCard(new Card("diamonds", "10"));
    hand.addCard(new Card("spades", "10"));
    hand.sortByValue();

    // All cards have the same value '10'
    // Should be sorted by suit: hearts, diamonds, clubs, spades
    expect(hand.cards[0].type).toBe("10");
    expect(hand.cards[0].suit).toBe("hearts");
    expect(hand.cards[1].type).toBe("10");
    expect(hand.cards[1].suit).toBe("diamonds");
    expect(hand.cards[2].type).toBe("10");
    expect(hand.cards[2].suit).toBe("clubs");
    expect(hand.cards[3].type).toBe("10");
    expect(hand.cards[3].suit).toBe("spades");
  });

  test("adding multiple cards maintains correct sorting", () => {
    const hand = new Hand();
    hand.sortByValue();
    hand.addCard(new Card("hearts", "K"));
    hand.addCard(new Card("clubs", "2"));
    hand.addCard(new Card("spades", "10"));
    hand.addCard(new Card("diamonds", "5"));
    hand.addCard(new Card("hearts", "3"));

    expect(hand.cards.map((c) => c.type)).toEqual(["2", "3", "5", "10", "K"]);
  });

  test("various interactions with sorting methods, card addition, and removal", () => {
    const hand = new Hand();
    hand.addCard(new Card("hearts", "A"));
    hand.addCard(new Card("clubs", "K"));
    hand.addCard(new Card("spades", "2"));
    hand.sortBySuit();

    expect(hand.cards[0].suit).toBe("hearts");
    expect(hand.cards[1].suit).toBe("clubs");
    expect(hand.cards[2].suit).toBe("spades");

    hand.removeCard(1);
    expect(hand.cards.length).toBe(2);

    hand.sortByValue();
    expect(hand.cards[0].type).toBe("2");
    expect(hand.cards[1].type).toBe("A");
  });
});
