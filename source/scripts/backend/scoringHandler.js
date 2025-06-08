import { calculateBlackjackScore, getHandType } from "./utils.js";

/**
 * @classdesc ScoringHandler
 * 
 * @property {object} handler - The associated gameHandler object.
 */
export class scoringHandler {
	/**
	 * @class scoringHandler
	 * @description Initializes the scoring handler to interact with the game handler.
	 * @param {object} handler - The gameHandler object. 
	 */
	constructor(handler) {
		this.handler = handler;
	}

	/**
	 * @function scoreHand
	 * @description Scores the played hand for the gameHandler.
	 */
	scoreHand() {
		// If the hand is empty, log and return
		if (this.handler.state.hands.played.cards.length === 0) {
			console.log("No cards played. No score.");
			return;
		}
		
		const jokers = this.handler.state.hands.joker.cards;

		this.handler.state.handScore = 0;
		this.handler.state.handMult = 1;

		// Determine hand type for display
		const handType = getHandType(this.handler.state.hands.played.cards);
		this.handler.uiInterface.updateScorekeeper({ handType: handType });

		for (let i = 0; i < this.handler.state.hands.played.cards.length;) {
			const card = this.handler.state.hands.played.cards[i];

			let cardValue = card.getValue();

			// TODO: Check for attributes on the card, update base chip value accordingly

			// TODO: Check for applicable jokers to this card
			// ->UI: Call back to UI to play joker animation (likely also score animation)

			for (const joker of jokers) {
				if (joker.onCardScore) {
					joker.onCardScore({
						card: card,
						cardIdx: i,
						jokerIdx: jokers.indexOf(joker),
						scoringHandler: this,
						gameHandler: this.handler,
					});
				}
			}

			this.handler.state.handScore += cardValue;
			this.handler.uiInterface.updateScorekeeper({
				handScore: this.handler.state.handScore,
			});

			console.log(
				`Card ${card.type} of ${card.suit} scored: ${cardValue}`
			);
			this.handler.uiInterface.scoreCard(
				card,
				[`+${cardValue} Chips`],
				["#00FFFF"]
			);

			// TODO: Conditions for other increments
			i += 1;
		}

		for (const joker of jokers) {
			if (joker.onScoringEnd) {
				joker.onScoringEnd({
					jokerIdx: jokers.indexOf(joker),
					score: this.handler.state.handScore,
					scoringHandler: this,
					gameHandler: this.handler,
				});
			}
		}

		// Verify that the played hand has a valid blackjack score
		const score = calculateBlackjackScore(this.handler.state.hands.played.cards);
		if (score > 21) {
			console.log("Score exceeds 21. Hand is bust.");

			this.handler.state.handScore = 0;
			this.handler.state.handMult = 1;

			this.handler.uiInterface.updateScorekeeper({
				handScore: 0,
				handMult: 1,
			});
			this.handler.uiInterface.displayBust();
		} else {
			const totalAdded = this.handler.state.handScore * this.handler.state.handMult;
			this.handler.state.roundScore += totalAdded;

			// Show visual feedback for successful scoring
			if (this.handler.uiInterface.displayHandScored) {
				this.handler.uiInterface.displayHandScored(
					this.handler.state.handScore,
					this.handler.state.handMult,
					totalAdded
				);
			}

			this.handler.state.handScore = 0;
			this.handler.state.handMult = 1;

			this.handler.uiInterface.updateScorekeeper({
				roundScore: this.handler.state.roundScore,
				handScore: 0,
				handMult: 1,
			});
		}

		this.handler.uiInterface.moveMultiple(
			this.handler.state.hands.played.cards,
			"handPlayed",
			"offscreen",
			0
		);
		for (const card of this.handler.state.hands.played.cards) {
			this.handler.uiInterface.removeUIel(card);
		}

		this.handler.state.handsPlayed++;
		this.handler.uiInterface.updateScorekeeper({
			handsRemaining: this.handler.state.totalHands - this.handler.state.handsPlayed,
		});

		this.handler.state.hands.played.cards = [];
	}
}