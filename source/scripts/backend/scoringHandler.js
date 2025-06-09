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
		for (const joker of jokers) {
			if (joker.onScoringStart) {
				joker.onScoringStart({
					jokerIdx: jokers.indexOf(joker),
					jokerCard: joker,
					scoringHandler: this,
					gameHandler: this.handler,
				});
			}
		}

		this.handler.state.handScore = 0;
		this.handler.state.handMult = 1;

		// Determine hand type for display
		const handType = getHandType(this.handler.state.hands.played.cards);
		this.handler.uiInterface.updateScorekeeper({ handType: handType });

		for (let i = 0; i < this.handler.state.hands.played.cards.length; ) {
			const card = this.handler.state.hands.played.cards[i];

			let cardValue = card.getValue();

			// TODO: Check for attributes on the card, update base chip value accordingly

			// TODO: Check for applicable jokers to this card
			// ->UI: Call back to UI to play joker animation (likely also score animation)

			this.handler.state.handScore += cardValue;
			this.handler.state.handScore =
				Math.round(this.handler.state.handScore * 10) / 10;
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

			for (const joker of jokers) {
				if (joker.onCardScore) {
					joker.onCardScore({
						card: card,
						cardIdx: i,
						jokerIdx: jokers.indexOf(joker),
						jokerCard: joker,
						scoringHandler: this,
						gameHandler: this.handler,
					});
				}
			}

			// TODO: Conditions for other increments
			i += 1;
		}

		for (const joker of jokers) {
			if (joker.onScoringEnd) {
				joker.onScoringEnd({
					jokerIdx: jokers.indexOf(joker),
					jokerCard: joker,
					score: this.handler.state.handScore,
					scoringHandler: this,
					gameHandler: this.handler,
				});
			}
		}

		// Verify that the played hand has a valid blackjack score
		const score = calculateBlackjackScore(
			this.handler.state.hands.played.cards
		);
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
			const totalAdded =
				this.handler.state.handScore * this.handler.state.handMult;
			this.handler.state.handScore = Math.round(totalAdded * 10) / 10;
			this.handler.state.roundScore += totalAdded;

			// Track highest round score stat
			this.handler.gameStorage.setStat(
				"highestRoundScore",
				this.handler.state.roundScore
			);

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
			handsRemaining:
				this.handler.state.totalHands - this.handler.state.handsPlayed,
		});

		this.handler.state.hands.played.cards = [];
	}

	/**
	 * @function onDraw
	 * @description Called when a card is drawn from the deck.
	 *              This can be used to trigger any scoring-related effects.
	 * @param {object} card - The card that was drawn.
	 */
	onDraw(card) {
		const jokers = this.handler.state.hands.joker.cards;
		for (const joker of jokers) {
			if (joker.onDraw) {
				joker.onDraw({
					jokerIdx: jokers.indexOf(joker),
					jokerCard: joker,
					card: card,
					scoringHandler: this,
					gameHandler: this.handler,
				});
			}
		}
	}

	/**
	 * @function addChips
	 * @description Adds chips to the current score, applying any other Joker
	 *              effects that may change the value or affect other
	 *              scoring parameters.
	 * @param {object} params - The parameters for adding chips.
	 * @param {number} chips - The number of chips to add.
	 */
	addChips(params, chips) {
		// TODO: Check for jokers that may affect this
		this.handler.state.handScore += chips;
		this.handler.state.handScore =
			Math.round(this.handler.state.handScore * 10) / 10;
		this.handler.uiInterface.updateScorekeeper({
			handScore: this.handler.state.handScore,
		});
		this.handler.uiInterface.scoreCard(
			params.jokerCard,
			[`+${chips} Chips`],
			["#00FFFF"]
		);
		console.log(
			`Added ${chips} chips to score. New score: ${this.handler.state.handScore}`
		);
	}

	/**
	 * @function addMult
	 * @description Adds a multiplier to the current score, applying any other Joker
	 *              effects that may change the value or affect other
	 *              scoring parameters.
	 * @param {object} params - The parameters for adding a multiplier.
	 * @param {number} mult - The multiplier to add.
	 */
	addMult(params, mult) {
		// TODO: Check for jokers that may affect this
		this.handler.state.handMult += mult;
		this.handler.uiInterface.updateScorekeeper({
			handMult: this.handler.state.handMult,
		});
		this.handler.uiInterface.scoreCard(
			params.jokerCard,
			[`+${(mult * 100).toFixed(0)}% Mult`],
			["#FFFF00"]
		);
		console.log(
			`Added ${mult * 100}% multiplier to score. New multiplier: ${
				this.handler.state.handMult
			}`
		);
	}
}

