import { Card } from "./Card.js";
import { calculateBlackjackScore } from "./utils.js";

/**
 * @typedef {module:scripts/backend/gameHandler.gameHandler} gameHandler
 * @typedef {module:scripts/backend/scoringHandler.scoringHandler} scoringHandler
 */

/**
 * @typedef {object} JokerParams
 * @property {Card} card - The card associated with the joker.
 * @property {number} cardIdx - The index of the card in the hand.
 * @property {number} jokerIdx - The index of the joker in the hand.
 * @property {number} score - The current score of the hand.
 * @property {scoringHandler} scoringHandler - The scoring handler for the game.
 * @property {gameHandler} gameHandler - The game handler for the game.
 */

/**
 * Formats special sequences in joker descriptions:
 * !<c(+X)!> for chips - displays in bold blue
 * !<t(+X)!> for multiplier - displays in bold red
 * @param {string} text - The text with special sequences
 * @returns {string} Formatted HTML text
 */
export function formatJokerDescription(text) {
	return text
		.replace(/!<c\(([^)]+)\)!>/g, '<span style="color:blue;font-weight:bold">$1 chips</span>')
		.replace(/!<t\(([^)]+)\)!>/g, '<span style="color:red;font-weight:bold">$1x mult</span>');
}

/**
 * @classdesc Represents a Joker in the game.
 * 
 * @property {Map<string, Joker>} jokerTypes - A map of registered joker types.
 */
export class Joker extends Card {
	static jokerTypes = new Map();

	/**
	 * Creates a new Joker instance based on the provided name.
	 * @param {string} name - The name of the joker type.
	 * @returns {Joker} An instance of the specified joker type.
	 * @throws {Error} If the joker type is not registered.
	 */
	static newJoker(name) {
		const JokerClass = Joker.jokerTypes.get(name);
		if (!JokerClass) {
			throw new Error(`Unknown joker type: ${name}`);
		}
		return new JokerClass();
	}

	/**
	 * Registers a new joker type.
	 * @param {string} name - The name of the joker type.
	 * @param {Joker} jokerClass - The class of the joker type.
	 * @throws {Error} If the joker type is already registered.
	 */
	static registerJoker(name, jokerClass) {
		Joker.jokerTypes.set(name, jokerClass);
	}

	/**
	 * Retrieves all registered joker names.
	 * @returns {Array<string>} An array of all registered joker names.
	 */
	static getJokerTypes() {
		return Array.from(Joker.jokerTypes.keys());
	}

	/**
	 * Returns a joker at a specific index relative to the current joker.
	 * @param {JokerParams} params - The parameters for the joker event.
	 * @param {number} delta - The index offset from the current joker.
	 * @returns {Joker|null} The joker at the specified index, or null if out of bounds.
	 */
	static getJokerAt(params, delta) {
		const jokerIdx = params.jokerIdx + delta;
		if (jokerIdx < 0 || jokerIdx >= params.gameHandler.state.hands.joker.cards.length) {
			return null;
		}
		return params.gameHandler.state.hands.joker.cards[jokerIdx];

	}

	/**
	 * @class Joker
	 * @description Represents a Joker in the game.
	 * @param {string} name - The name of the joker.
	 */
	constructor(name) {
		super("joker", name);
		this.state = {};
	}

	/**
	 * Returns a formatted description of this joker
	 * @returns {string} HTML-formatted description
	 */
	getDescription() {
		// Default description, individual jokers should override this
		try {
			return `<b>${this.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</b><br>${this.description || "No description available."}`;
		} catch {
			if (this.constructor.name) {
				return `<b>${this.constructor.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</b><br>${this.description || "No description available."}`;
			}
			return `<b>Joker</b><br>Loading description...`;
		}
	}

	/* eslint-disable no-unused-vars */
	/**
	 * Called when a round starts.
	 * @param {JokerParams} params - The parameters for the joker event.
	 */
	onRoundStart(params) { }


	/**
	 * Called when the blind phase starts.
	 * @param {JokerParams} params - The parameters for the joker event.
	 */
	onBlindStart(params) { }

	/**
	 * Called when a card is drawn.
	 * @param {JokerParams} params - The parameters for the joker event.
	 */
	onDraw(params) { }

	/**
	 * Called when a joker is added to play.
	 * @param {JokerParams} params - The parameters for the joker event.
	 */
	onJokerEnter(params) { }
	/**
	 * Called when a joker is removed from play.
	 * @param {JokerParams} params - The parameters for the joker event.
	 */
	onJokerLeave(params) { }

	/**
	 * Called when the scoring phase starts.
	 * @param {JokerParams} params - The parameters for the joker event.
	 */
	onScoringStart(params) { }
	/**
	 * Called when the scoring phase ends.
	 * @param {JokerParams} params - The parameters for the joker event.
	 */
	onScoringEnd(params) { }

	/**
	 * Called when a card is scored.
	 * @param {JokerParams} params - The parameters for the joker event.
	 */
	onCardScore(params) { }
	/* eslint-enable no-unused-vars */

	static jokerMethods = [
		"onRoundStart",
		"onBlindStart",
		"onDraw",
		"onJokerEnter",
		"onJokerLeave",
		"onScoringEnd",
		"onCardScore",
		"onScoringStart"
	];
}

/**
 * @classdesc Lucky Rabbit, adds 2 chips per card drawn.
 * @augments Joker
 */
class LuckyRabbit extends Joker {
	/** @class */
	constructor() {
		super("lucky_rabbit");
	}

	/** @inheritdoc */
	onDraw(params) {
		params.gameHandler.gameStorage.updateStat("totalJokersUsed", 1);
		params.scoringHandler.addChips(params, 2);
	}

	/** @inheritdoc */
	getDescription() {
		return `<b>Lucky Rabbit</b><br>When you draw a card, gain !<c(+2)!>.`;
	}
}
Joker.registerJoker("lucky_rabbit", LuckyRabbit);

/**
 * @classdesc Stick Shift, adds 1 discard per round.
 * @augments Joker
 */
class StickShift extends Joker {
	/** @class */
	constructor() {
		super("stick_shift");
	}

	/** @inheritdoc */
	onJokerEnter(params) {
		params.gameHandler.gameStorage.updateStat("totalJokersUsed", 1);
		params.gameHandler.state.discardCount += 1;
	}

	/** @inheritdoc */
	onJokerLeave(params) {
		params.gameHandler.state.discardCount -= 1;
	}

	/** @inheritdoc */
	getDescription() {
		return `<b>Stick Shift</b><br>Gain +1 discards per round.`;
	}
}
Joker.registerJoker("stick_shift", StickShift);

/**
 * @classdesc Piggy Bank, increases interest cap by 1.
 * @augments Joker
 */
class PiggyBank extends Joker {
	/** @class */
	constructor() {
		super("piggy_bank");
	}

	/** @inheritdoc */
	onJokerEnter(params) {
		params.gameHandler.gameStorage.updateStat("totalJokersUsed", 1);
		params.gameHandler.state.interestCap += 1;
	}

	/** @inheritdoc */
	onJokerLeave(params) {
		params.gameHandler.state.interestCap -= 1;
	}

	/** @inheritdoc */
	getDescription() {
		return `<b>Piggy Bank</b><br>Increase interest cap by 1.`;
	}
}
Joker.registerJoker("piggy_bank", PiggyBank);

/**
 * @classdesc Even Steven, adds a multiplier if score is even.
 * @augments Joker
 */
class EvenSteven extends Joker {
	/** @class */
	constructor() {
		super("even_steven");
	}

	/** @inheritdoc */
	onScoringEnd(params) {
		if (params.score % 2 == 0) {
			params.gameHandler.gameStorage.updateStat("totalJokersUsed", 1);
			params.scoringHandler.addMult(params, 0.2);
		}
	}

	/** @inheritdoc */
	getDescription() {
		return `<b>Even Steven</b><br>If your score is even, gain !<t(+0.2)!>.`;
	}
}
Joker.registerJoker("even_steven", EvenSteven);

/**
 * @classdesc Odd Rod, adds a multiplier if score is odd.
 * @augments Joker
 */
class OddRod extends Joker {
	/** @class */
	constructor() {
		super("odd_rod");
	}

	/** @inheritdoc */
	onScoringEnd(params) {
		if (params.score % 2 == 1) {
			params.gameHandler.gameStorage.updateStat("totalJokersUsed", 1);
			params.scoringHandler.addMult(params, 0.2);
		}
	}

	/** @inheritdoc */
	getDescription() {
		return `<b>Odd Rod</b><br>If your score is odd, gain !<t(+0.2)!>.`;
	}
}
Joker.registerJoker("odd_rod", OddRod);

// TODO: Softie needs a way to detect soft aces

/**
 * @classdesc Mirror Mask, copies the effect of the Joker to its left.
 * @augments Joker
 */
class MirrorMask extends Joker {
	/** @class */
	constructor() {
		super("mirror_mask");
		// Create a proxy to intercept all method calls
		return new Proxy(this, {
			get(target, prop, receiver) {
				// Get the original property/method
				const value = Reflect.get(target, prop, receiver);

				// Make sure the property is a function and valid joker method
				if (typeof value === 'function' && Joker.jokerMethods.includes(prop)) {

					// Return a new function that forwards the call
					return function (...args) {
						const params = args[0]; // First argument should be the params object
						const leftJoker = Joker.getJokerAt(params, -1);

						if (leftJoker && typeof leftJoker[prop] === 'function') {
							// Forward the call to the joker
							return leftJoker[prop](...args);
						}

						// Fallback to the original if not found
						return value.apply(target, args);
					};
				}

				// Not a function or not a joker method, return the original value
				return value;
			}
		});
	}

	/** @inheritdoc */
	getDescription() {
		return `<b>Mirror Mask</b><br>Copies the effect of the Joker to its left.`;
	}
}
Joker.registerJoker("mirror_mask", MirrorMask);

// TODO: Bust Insurance needs a way to check for and cancel a Bust

/**
 * @classdesc Stacked Deck, draws a card at the start of each round.
 * @augments Joker
 */
class StackedDeck extends Joker {
	/** @class */
	constructor() {
		super("stacked_deck");
	}

	/** @inheritdoc */
	onRoundStart(params) {
		const card = params.gameHandler.state.deck.drawCard();
		if (card) {
			params.gameHandler.gameStorage.updateStat("totalJokersUsed", 1);
			params.gameHandler.state.hands.main.addCard(card);
			params.gameHandler.uiInterface.createUIel(card);
			params.gameHandler.moveMultiple([card], "deck", "handMain", 0);
		}
	}
}
Joker.registerJoker("stacked_deck", StackedDeck);

/**
 * @classdesc Card Counter, counts unique cards scored this round.
 * @augments Joker
 * @property {Set<string>} seen - A set to track unique cards scored.
 */
class CardCounter extends Joker {
	/** @class */
	constructor() {
		super("card_counter");
		this.seen = new Set();
	}

	/* eslint-disable no-unused-vars */
	/** @inheritdoc */
	onBlindStart(params) {
		this.seen.clear();
	}
	/* eslint-enable no-unused-vars */

	/** @inheritdoc */
	onCardScore(params) {
		const card = params.card;
		if (!this.seen.has(card.type + ' of ' + card.suit)) {
			this.seen.add(card.type + ' of ' + card.suit);
			params.gameHandler.gameStorage.updateStat("totalJokersUsed", 1);
			params.scoringHandler.addMult(params, 0.1);
		}
	}

	/** @inheritdoc */
	getDescription() {
		return `<b>Card Counter</b><br>Gain !<t(+0.1)!> for each unique card scored this round.<br>Current unique cards: ${this.seen.size}`;
	}
}
Joker.registerJoker("card_counter", CardCounter);

/**
 * @classdesc Face Value, adds chips for scoring face cards.
 * @augments Joker
 */
class FaceValue extends Joker {
	/** @class */
	constructor() {
		super("face_value");
	}

	/** @inheritdoc */
	onCardScore(params) {
		const type = params.card.type;
		if (type == "A" || type == "J" || type == "Q" || type == "K") {
			params.gameHandler.gameStorage.updateStat("totalJokersUsed", 1);
			params.scoringHandler.addChips(params, 1);
		}
	}

	/** @inheritdoc */
	getDescription() {
		return `<b>Face Value</b><br>When you score a face card (A, J, Q, K), gain !<c(+1)!>.`;
	}
}
Joker.registerJoker("face_value", FaceValue);

/**
 * @classdesc Twenty-Oneder, adds a multiplier for scoring exactly 21.
 * @augments Joker
 */
class TwentyOneder extends Joker {
	/** @class */
	constructor() {
		super("twenty_oneder");
	}

	/** @inheritdoc */
	onScoringEnd(params) {
		if (params.score == 21 && calculateBlackjackScore(params.gameHandler.state.hands.main.cards) == 21) {
			params.gameHandler.gameStorage.updateStat("totalJokersUsed", 1);
			params.scoringHandler.addMult(params, 0.5);
		}
	}

	/** @inheritdoc */
	getDescription() {
		return `<b>Twenty-Oneder</b><br>If your score is exactly 21, gain !<t(+0.5)!>.`;
	}
}
Joker.registerJoker("twenty_oneder", TwentyOneder);

/**
 * @classdesc Blueprint, copies the effects of all Jokers to the left.
 * @augments Joker
 */
class Blueprint extends Joker {
	/** @class */
	constructor() {
		super("blueprint");

		// Create a proxy to intercept all method calls
		return new Proxy(this, {
			get(target, prop, receiver) {
				// Get the original property/method
				const value = Reflect.get(target, prop, receiver);

				// Make sure the property is a function and valid joker method
				if (typeof value === 'function' && Joker.jokerMethods.includes(prop)) {

					// Return a new function that forwards the call
					return function (...args) {
						const params = args[0]; // First argument should be the params object
						let offset = -1;
						let leftJoker = Joker.getJokerAt(params, offset);

						while (leftJoker && typeof leftJoker[prop] === 'function') {
							leftJoker[prop](...args);
							offset--;
							leftJoker = Joker.getJokerAt(params, offset);
						}

						// Fallback to the original if not found
						return value.apply(target, args);
					};
				}

				// Not a function or not a joker method, return the original value
				return value;
			}
		});
	}

	/** @inheritdoc */
	getDescription() {
		return `<b>Blueprint</b><br>Copy and apply the effects of all Jokers to the left.`;
	}
}
Joker.registerJoker("blueprint", Blueprint);

/**
 * @classdesc Martingale, increases multiplier for consecutive zero scores.
 * @augments Joker
 * @property {number} lastRoundsZero - The count of consecutive rounds with a score of zero.
 */
class Martingale extends Joker {
	/** @class */
	constructor() {
		super("martingale");
		this.lastRoundsZero = 0;
	}

	/* eslint-disable no-unused-vars */
	/** @inheritdoc */
	onBlindStart(params) {
		this.lastRoundZero = 0;
	}
	/* eslint-enable no-unused-vars */

	/** @inheritdoc */
	onScoringStart(params) {
		if (params.score == 0) {
			this.lastRoundsZero += 1;
			params.gameHandler.gameStorage.updateStat("totalJokersUsed", 1);
			params.scoringHandler.addMult(params, 4 / (this.lastRoundsZero));
		} else {
			this.lastRoundsZero = 0;
		}
	}

	/** @inheritdoc */
	getDescription() {
		const multiplier = this.lastRoundsZero > 0 ? (4 / this.lastRoundsZero).toFixed(1) : "4.0";
		return `<b>Martingale</b><br>If your score is 0, gain !<t(+${multiplier})!>. Decreases with consecutive zero scores.<br>Current consecutive zeros: ${this.lastRoundsZero}`;
	}
}
Joker.registerJoker("martingale", Martingale);

/**
 * @classdesc Wildcard Joker, adds a random value if score is less than 21.
 * @augments Joker
 */
class WildcardJoker extends Joker {
	/** @class */
	constructor() {
		super("wildcard_joker");
	}

	/** @inheritdoc */
	onScoringEnd(params) {
		if (params.score < 21) {
			const remaining = 21 - params.score;
			const addValue = Math.floor(Math.random() * (remaining + 1));
			params.gameHandler.gameStorage.updateStat("totalJokersUsed", 1);
			params.scoringHandler.addChips(params, addValue);
		}
	}

	/** @inheritdoc */
	getDescription() {
		return `<b>Wildcard Joker</b><br>If your score is less than 21, add a random value to your score.`;
	}
}
Joker.registerJoker("wildcard_joker", WildcardJoker);

/**
 * @classdesc Overclock, adds a multiplier for playing more than 5 cards.
 * @augments Joker
 */
class Overclock extends Joker {
	/** @class */
	constructor() {
		super("overclock");
	}

	/** @inheritdoc */
	onScoringStart(params) {
		if (params.gameHandler.state.hands.played.cards.length > 5) {
			params.gameHandler.gameStorage.updateStat("totalJokersUsed", 1);
			params.scoringHandler.addMult(params, (params.gameHandler.state.hands.played.cards.length - 5) * 0.5);
		}
	}

	/** @inheritdoc */
	getDescription() {
		return `<b>Overclock</b><br>If you play more than 5 cards, gain !<t(+0.5)!> for each additional card.`;
	}
}
Joker.registerJoker("overclock", Overclock);

// TODO: Phantom Hand

// TODO: Infinity Mirror

// TODO: Noir Banker

/**
 * @classdesc Event Horizon, multiplies the current multiplier by itself.
 * @augments Joker
 */
class EventHorizon extends Joker {
	/** @class */
	constructor() {
		super("event_horizon");
	}

	/** @inheritdoc */
	onScoringEnd(params) {
		params.gameHandler.gameStorage.updateStat("totalJokersUsed", 1);
		params.scoringHandler.mulMult(params, params.gameHandler.state.handMult);
	}

	/** @inheritdoc */
	getDescription() {
		return `<b>Event Horizon</b><br>Each round scores chips × multiplier².`;
	}
}
Joker.registerJoker("event_horizon", EventHorizon);

/**
 * @classdesc Glitch King, applies a random multiplier if score exceeds 2,147,483,647.
 * @augments Joker
 */
class GlitchKing extends Joker {
	/** @class */
	constructor() {
		super("glitch_king");
	}

	/** @inheritdoc */
	onScoringEnd(params) {
		if (params.score > 2147483647) {
			const multiplier = 0.5 + Math.random() * 2.5;
			params.gameHandler.gameStorage.updateStat("totalJokersUsed", 1);
			params.scoringHandler.mulMult(params, multiplier);
		}
	}

	/** @inheritdoc */
	getDescription() {
		return `<b>Glitch King</b><br>If your score exceeds 2,147,483,647, apply a random multiplier between 0.5x and 3.0x.`;
	}
}
Joker.registerJoker("glitch_king", GlitchKing);

/**
 * @classdesc Snowballer, accumulates a bonus for each card drawn.
 * @augments Joker
 * @property {number} snowball - The accumulated bonus from drawn cards.
 */
class Snowballer extends Joker {
	/** @class */
	constructor() {
		super("snowballer");
		this.snowball = 0;
	}

	/* eslint-disable no-unused-vars */
	/** @inheritdoc */
	onDraw(params) {
		this.snowball += 0.1;
	}
	/* eslint-enable no-unused-vars */

	/** @inheritdoc */
	onScoringEnd(params) {
		if (this.snowball > 0) {
			params.gameHandler.gameStorage.updateStat("totalJokersUsed", 1);
			params.scoringHandler.addMult(params, this.snowball);
		}
	}

	/** @inheritdoc */
	getDescription() {
		return `<b>Snowballer</b><br>When you draw a card, add !<t(+0.1)!> to this Joker.<br>Current bonus: !<t(+${this.snowball.toFixed(1)})!>`;
	}
}
Joker.registerJoker("snowballer", Snowballer);

/**
 * @classdesc Hiccup, adds a chip if more than 7 cards are played.
 * @augments Joker
 */
class Hiccup extends Joker {
	/** @class */
	constructor() {
		super("hiccup");
	}

	/** @inheritdoc */
	onScoringStart(params) {
		if (params.gameHandler.state.hands.played.cards.length > 7) {
			params.gameHandler.gameStorage.updateStat("totalJokersUsed", 1);
			params.scoringHandler.addChips(params, 1);
		}
	}

	/** @inheritdoc */
	getDescription() {
		return `<b>Hiccup</b><br>If you played more than 7 cards, gain !<c(+1)!>.`;
	}
}
Joker.registerJoker("hiccup", Hiccup);

// TODO: Penny Pincher