export default class ScoreKeeeper {
  constructor() {
     this.goal       = document.getElementById('goal-score');
    this.round     = document.getElementById('round-score');
    this.chips      = document.getElementById('chip-val');
    this.mult      = document.getElementById('mult-val');
    this.bank       = document.getElementById('bank-amount');
    this.discards   = document.getElementById('discards');
    

    // initialize some variables like this.scoreElement, this.chipsElement, etc.

  }

setGoalScore(value) {
    this.goal.textContent = value;
  }

  /**
   * Set the current round score
   * @param {number|string} value
   */
  setRoundScore(value) {
    this.round.textContent = value;
  }

  /**
   * Update the number of chips
   * @param {number|string} count
   */
  updateChips(count) {
    this.chips.textContent = count;
  }

  /**
   * Update the multiplier
   * @param {number|string} multiplier
   */
  updateMultiplier(multiplier) {
    this.mult.textContent = multiplier;
  }

  /**
   * Update the bank total
   * @param {number|string} amount
   */
  setBank(amount) {
    this.bank.textContent = amount;
  }

  /**
   * Update the discards count
   * @param {number|string} count
   */
  setDiscards(count) {
    this.discards.textContent = count;
  }

  /**
   * Reset all fields to zero or placeholder
   */
  reset() {
    this.setGoalScore('—');
    this.setRoundScore('—');
    this.updateChips(0);
    this.updateMultiplier(0);
    this.setBank(0);
    this.setDiscards(0);
  }
}
