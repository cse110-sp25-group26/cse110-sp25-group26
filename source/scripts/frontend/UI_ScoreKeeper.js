/**
 * Represents a scorekeeper UI element that displays various game scores and stats.
 */
export default class ScoreKeeper {
	/**
	 * Creates an instance of ScoreKeeper.
	 * Initializes references to the DOM elements that display game scores and stats.
	 */
	constructor() {
		this.goal = document.getElementById("goal-score");
		this.round = document.getElementById("round-score");
		this.chips = document.getElementById("chip-val");
		this.mult = document.getElementById("mult-val");
		this.bank = document.getElementById("bank-amount");
		this.discards = document.getElementById("discards");

		// initialize some variables like this.scoreElement, this.chipsElement, etc.
	}

	/**
	 * Sets the text content of the goal score display.
	 * @param {number|string} value - The value to display as the goal score.
	 */
	setGoalScore(value) {
		this.goal.textContent = value;
	}

	/**
	 * Set the current round score.
	 * @param {number|string} value - The value to display as the round score.
	 */
	setRoundScore(value) {
		this.round.textContent = value;
	}

	/**
	 * Update the number of chips.
	 * @param {number|string} count - The new number of chips to display.
	 */
	updateChips(count) {
		this.chips.textContent = count;
	}

	/**
	 * Update the multiplier.
	 * @param {number|string} multiplier - The new multiplier value to display.
	 */
	updateMultiplier(multiplier) {
		this.mult.textContent = multiplier;
	}

	/**
	 * Update the bank total.
	 * @param {number|string} amount - The new bank amount to display.
	 */
	setBank(amount) {
		this.bank.textContent = amount;
	}

	/**
	 * Update the discards count.
	 * @param {number|string} count - The new discards count to display.
	 */
	setDiscards(count) {
		this.discards.textContent = count;
	}

	/**
	 * Reset all fields to zero or placeholder.
	 */
	reset() {
		this.setGoalScore("—");
		this.setRoundScore("—");
		this.updateChips(0);
		this.updateMultiplier(0);
		this.setBank(0);
		this.setDiscards(0);
	}
}

