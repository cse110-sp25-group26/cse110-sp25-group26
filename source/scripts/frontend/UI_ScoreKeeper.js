export class ScoreKeeeper {
  constructor() {
     this.round   = document.getElementById('round-score');
    this.goal    = document.getElementById('goal-score');
    this.chip    = document.getElementById('chip-val');
    this.mult    = document.getElementById('mult-val');
    this.bank    = document.getElementById('bank-amt');
    this.hands   = document.getElementById('hands-val');
    this.dis     = document.getElementById('discards-val');
    this.ante    = document.getElementById('ante-val');
    this.roundNo = document.getElementById('round-val');
    this.cardCt  = document.getElementById('card-count');
    this.deckCt  = document.getElementById('deck-count');
    

    // initialize some variables like this.scoreElement, this.chipsElement, etc.

  }

  function updateChips(chips) {
  this.chipsElement.innerHTML = String(chips);
}

function updateHands(used, total) {
  this.handsElement.innerHTML = String(used) + "/" + String(total);
}

  // etc for all the scoreboard items
}