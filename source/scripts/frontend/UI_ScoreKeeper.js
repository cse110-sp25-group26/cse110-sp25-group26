/**
 * Represents a scorekeeper UI element that displays various game scores and stats.
 */
export default class ScoreKeeper {
	/**
	 * Creates an instance of ScoreKeeper.
	 * Initializes references to the DOM elements that display game scores and stats.
	 */
	constructor() {
		this.goal = document.getElementById('goal-score');
		this.round = document.getElementById('round-score');
		this.chips = document.getElementById('chip-val');
		this.mult = document.getElementById('mult-val');
		this.bank = document.getElementById('bank-amount');
		this.discardsLeft = document.getElementById('discards-left');
		this.handsLeft = document.getElementById('hands-left');
		this.currentAnte = document.getElementById('current-ante');
		this.currentBlindName = document.getElementById('current-blind-name');
		this.currentHandType = document.getElementById('current-hand-type');

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
	 * Update the discards left count.
	 * @param {number|string} count - The new discards count to display.
	 */
	setDiscardsLeft(count) {
		if (this.discardsLeft) this.discardsLeft.textContent = count;
	}

	/**
	 * Update the hands left count.
	 * @param {number|string} count - The new hands left count to display.
	 */
	setHandsLeft(count) {
		if (this.handsLeft) this.handsLeft.textContent = count;
	}

	/**
	 * Update the current ante.
	 * @param {number|string} ante - The new ante value to display.
	 */
	setCurrentAnte(ante) {
		if (this.currentAnte) this.currentAnte.textContent = ante;
	}

	/**
	 * Update the current blind name.
	 * @param {string} name - The name of the current blind.
	 */
	setCurrentBlindName(name) {
		if (this.currentBlindName) this.currentBlindName.textContent = name;
	}

	/**
	 * Update the current hand type.
	 * @param {string} type - The type of the current hand.
	 */
	setCurrentHandType(type) {
		if (this.currentHandType) this.currentHandType.textContent = type;
	}

	/**
	 * Reset all fields to zero or placeholder.
	 */
	reset() {
		this.setGoalScore('—');
		this.setRoundScore('—');
		this.updateChips(0);
		this.updateMultiplier(0);
		this.setBank(0);
		this.setDiscardsLeft(0);
		this.setHandsLeft(0);
		this.setCurrentAnte(1);
		this.setCurrentBlindName('Blind');
		this.setCurrentHandType('—');
	}
}
