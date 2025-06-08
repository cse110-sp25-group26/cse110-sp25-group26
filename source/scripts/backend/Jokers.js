import { Card } from "./Card.js";
import { calculateBlackjackScore } from "./utils.js";

/**
 * Formats special sequences in joker descriptions:
 * \x1bc(+X) for chips - displays in bold blue
 * \x1bt(+X) for multiplier - displays in bold red
 * @param {string} text - The text with special sequences
 * @return {string} Formatted HTML text
 */
export function formatJokerDescription(text) {
    return text
        .replace(/\x1bc\(([^)]+)\)/g, '<span style="color:blue;font-weight:bold">$1 chips</span>')
        .replace(/\x1bt\(([^)]+)\)/g, '<span style="color:red;font-weight:bold">$1x mult</span>');
}

// TODO: Documentation. Running out of time.

/**
 * @classdesc Represents a Joker in the game.
 */
export class Joker extends Card {
	static jokerTypes = new Map();

	static newJoker(name) {
		const JokerClass = Joker.jokerTypes.get(name);
		if (!JokerClass) {
			throw new Error(`Unknown joker type: ${name}`);
		}
		return new JokerClass();
	}

	static registerJoker(name, jokerClass) {
		Joker.jokerTypes.set(name, jokerClass);
	}

	static getJokerTypes() {
		return Array.from(Joker.jokerTypes.keys());
	}

	static getJokerAt(params, delta) {
		const jokerIdx = params.jokerIdx + delta;
		if (jokerIdx < 0 || jokerIdx >= params.gameHandler.state.hands.joker.cards.length) {
			return null;
		}
		return params.gameHandler.state.hands.joker.cards[jokerIdx];

	}

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
		return `<b>${this.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</b><br>No description available.`;
	}

	// each takes an object with optionally accessed:
	// card, cardIdx, jokerIdx, score, scoringHandler, gameHandler

	onRoundStart(params) { }

	onBlindStart(params) { } // blind phase starts

	onDraw(params) { }

	onJokerEnter(params) { } // joker added to play
	onJokerLeave(params) { } // joker removed from play

	onScoringStart(params) { } // scoring phase starts
	onScoringEnd(params) { }

	onCardScore(params) { }

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


class LuckyRabbit extends Joker {
	constructor() {
		super("lucky_rabbit");
	}

	onDraw(params) {
		params.scoringHandler.addChips(params, 2);
	}
	
	getDescription() {
		return `<b>Lucky Rabbit</b><br>When you draw a card, gain \x1bc(+2).`;
	}
}
Joker.registerJoker("lucky_rabbit", LuckyRabbit);

class StickShift extends Joker {
	constructor() {
		super("stick_shift");
	}

	onJokerEnter(params) {
		params.gameHandler.state.discardCount += 1;
	}

	onJokerLeave(params) {
		params.gameHandler.state.discardCount -= 1;
	}
	
	getDescription() {
		return `<b>Stick Shift</b><br>Gain +1 discards per round.`;
	}
}
Joker.registerJoker("stick_shift", StickShift);

class PiggyBank extends Joker {
	constructor() {
		super("piggy_bank");
	}

	onJokerEnter(params) {
		params.gameHandler.state.interestCap += 1;
	}

	onJokerLeave(params) {
		params.gameHandler.state.interestCap -= 1;
	}
	
	getDescription() {
		return `<b>Piggy Bank</b><br>Increase interest cap by 1.`;
	}
}
Joker.registerJoker("piggy_bank", PiggyBank);

class EvenSteven extends Joker {
	constructor() {
		super("even_steven");
	}

	onScoringEnd(params) {
		if (params.score % 2 == 0) {
			params.scoringHandler.addMult(params, 0.2);
		}
	}
	
	getDescription() {
		return `<b>Even Steven</b><br>If your score is even, gain \x1bt(+0.2).`;
	}
}
Joker.registerJoker("even_steven", EvenSteven);

class OddRod extends Joker {
	constructor() {
		super("odd_rod");
	}

	onScoringEnd(params) {
		if (params.score % 2 == 1) {
			params.scoringHandler.addMult(params, 0.2);
		}
	}
	
	getDescription() {
		return `<b>Odd Rod</b><br>If your score is odd, gain \x1bt(+0.2).`;
	}
}
Joker.registerJoker("odd_rod", OddRod);

// TODO: Softie needs a way to detect soft aces

class MirrorMask extends Joker {
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

	getDescription() {
		return `<b>Mirror Mask</b><br>Copies the effect of the Joker to its left.`;
	}
}
Joker.registerJoker("mirror_mask", MirrorMask);

// TODO: Bust Insurance needs a way to check for and cancel a Bust

class StackedDeck extends Joker {
	constructor() {
		super("stacked_deck");
	}

	onRoundStart(params) {
		const card = params.gameHandler.state.deck.drawCard();
		if (card) {
			params.gameHandler.state.hands.main.addCard(card);
			params.gameHandler.uiInterface.createUIel(card);
			params.gameHandler.moveMultiple([card], "deck", "handMain", 0);
		}
	}
}
Joker.registerJoker("stacked_deck", StackedDeck);

class CardCounter extends Joker {
	constructor() {
		super("card_counter");
		this.seen = new Set();
	}

	onBlindStart(params) {
		this.seen.clear();
	}

	onCardScore(params) {
		const card = params.card;
		if (!this.seen.has(card.type + ' of ' + card.suit)) {
			this.seen.add(card.type + ' of ' + card.suit);
			params.scoringHandler.addMult(params, 0.1);
		}
	}
	
	getDescription() {
		return `<b>Card Counter</b><br>Gain \x1bt(+0.1) for each unique card scored this round.<br>Current unique cards: ${this.seen.size}`;
	}
}
Joker.registerJoker("card_counter", CardCounter);

class FaceValue extends Joker {
	constructor() {
		super("face_value");
	}

	onCardScore(params) {
		const type = params.card.type;
		if (type == "A" || type == "J" || type == "Q" || type == "K") {
			params.scoringHandler.addChips(params, 1);
		}
	}
	
	getDescription() {
		return `<b>Face Value</b><br>When you score a face card (A, J, Q, K), gain \x1bc(+1).`;
	}
}
Joker.registerJoker("face_value", FaceValue);

class TwentyOneder extends Joker {
	constructor() {
		super("twenty_oneder");
	}

	onScoringEnd(params) {
		if (params.score == 21 && calculateBlackjackScore(params.gameHandler.state.hands.main.cards) == 21) {
			params.scoringHandler.addMult(params, 0.5);
		}
	}
	
	getDescription() {
		return `<b>Twenty-Oneder</b><br>If your score is exactly 21, gain \x1bt(+0.5).`;
	}
}
Joker.registerJoker("twenty_oneder", TwentyOneder);

// Blueprint - like Mirror Mask, but copies every joker to the left until null
class Blueprint extends Joker {
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
	
	getDescription() {
		return `<b>Blueprint</b><br>Copy and apply the effects of all Jokers to the left.`;
	}
}
Joker.registerJoker("blueprint", Blueprint);

class Martingale extends Joker {
	constructor() {
		super("martingale");
		this.lastRoundsZero = 0;
	}

	onBlindStart(params) {
		this.lastRoundZero = 0;
	}

	onScoringStart(params) {
		if (params.score == 0) {
			this.lastRoundsZero += 1;
			params.scoringHandler.addMult(params, 4 / (this.lastRoundsZero));
		} else {
			this.lastRoundsZero = 0;
		}
	}
	
	getDescription() {
		const multiplier = this.lastRoundsZero > 0 ? (4 / this.lastRoundsZero).toFixed(1) : "4.0";
		return `<b>Martingale</b><br>If your score is 0, gain \x1bt(+${multiplier}). Decreases with consecutive zero scores.<br>Current consecutive zeros: ${this.lastRoundsZero}`;
	}
}
Joker.registerJoker("martingale", Martingale);

class WildcardJoker extends Joker {
	constructor() {
		super("wildcard_joker");
	}

	onScoringEnd(params) {
		if (params.score < 21) {
			const remaining = 21 - params.score;
			const addValue = Math.floor(Math.random() * (remaining + 1));
			params.scoringHandler.addChips(params, addValue);
		}
	}
	
	getDescription() {
		return `<b>Wildcard Joker</b><br>If your score is less than 21, add a random value between 0 and the difference.`;
	}
}
Joker.registerJoker("wildcard_joker", WildcardJoker);

class Overclock extends Joker {
	constructor() {
		super("overclock");
	}

	onScoringStart(params) {
		if (params.gameHandler.state.hands.played.cards.length > 5) {
			params.scoringHandler.addMult(params, (params.gameHandler.state.hands.played.cards.length - 5) * 0.5);
		}
	}
	
	getDescription() {
		return `<b>Overclock</b><br>If you play more than 5 cards, gain \x1bt(+0.5) for each additional card.`;
	}
}
Joker.registerJoker("overclock", Overclock);

// TODO: Phantom Hand

// TODO: Infinity Mirror

// TODO: Noir Banker

class EventHorizon extends Joker {
	constructor() {
		super("event_horizon");
	}

	onScoringEnd(params) {
		params.scoringHandler.addMult(params, params.gameHandler.state.handMult);
	}
	
	getDescription() {
		return `<b>Event Horizon</b><br>Add your multiplier again to itself.`;
	}
}
Joker.registerJoker("event_horizon", EventHorizon);

class GlitchKing extends Joker {
	constructor() {
		super("glitch_king");
	}

	onScoringEnd(params) {
		if (params.score > 2147483647) {
			const multiplier = 0.5 + Math.random() * 2.5;
			params.gameHandler.state.handScore *= multiplier;
		}
	}
	
	getDescription() {
		return `<b>Glitch King</b><br>If your score exceeds 2,147,483,647, apply a random multiplier between 0.5x and 3.0x.`;
	}
}
Joker.registerJoker("glitch_king", GlitchKing);

class Snowballer extends Joker {
	constructor() {
		super("snowballer");
		this.snowball = 0;
	}

	onDraw(params) {
		this.snowball += 0.1;
	}

	onScoringEnd(params) {
		if (this.snowball > 0) {
			params.scoringHandler.addMult(params, this.snowball);
		}
	}
	
	getDescription() {
		return `<b>Snowballer</b><br>When you draw a card, add \x1bt(+0.1) to this Joker.<br>Current bonus: \x1bt(+${this.snowball.toFixed(1)})`;
	}
}
Joker.registerJoker("snowballer", Snowballer);

class Hiccup extends Joker {
	constructor() {
		super("hiccup");
	}

	onScoringStart(params) {
		if (params.gameHandler.state.hands.played.cards.length > 7) {
			params.scoringHandler.addChips(params, 1);
		}
	}
	
	getDescription() {
		return `<b>Hiccup</b><br>If you played more than 7 cards, gain \x1bc(+1).`;
	}
}
Joker.registerJoker("hiccup", Hiccup);

// TODO: Penny Pincher