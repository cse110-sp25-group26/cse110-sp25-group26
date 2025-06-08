import { Card } from "./Card.js";

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

	constructor(name) {
		super("joker", name);
		this.state = {};
	}

	// each takes an object with optionally accessed:
	// card, cardIdx, jokerIdx, score, scoringHandler, gameHandler

	onRoundStart(params) { }
	onRoundEnd(params) { }

	onDraw(params) { }

	onJokerEnter(params) { } // joker added to play
	onJokerLeave(params) { } // joker removed from play

	onScoringEnd(params) { }

	onCardScore(params) { }
}


class LuckyRabbit extends Joker {
	constructor() {
		super("lucky_rabbit");
	}

	onDraw(params) {
		params.scoringHandler.addChips(params, 2);
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
}
Joker.registerJoker("stick_shift", StickShift);

// TODO: Piggy Bank needs interest to be implemented

class EvenSteven extends Joker {
	constructor() {
		super("even_steven");
	}

	onScoringEnd(params) {
		if (params.score % 2 == 0) {
			params.scoringHandler.addMult(params, 0.2);
		}
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
}
Joker.registerJoker("odd_rod", OddRod);

// TODO: Softie needs a way to detect soft aces

// TODO: Mirror Mask needs a way to tell the Joker to its right. Not hard, just
//       don't want to do it at 11PM.

// TODO: Bust Insurance needs a way to check for and cancel a Bust

class CardCounter extends Joker {
	constructor() {
		super("card_counter");
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
}
Joker.registerJoker("face_value", FaceValue);