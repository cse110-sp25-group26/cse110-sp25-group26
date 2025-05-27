import { CardUI } from "./CardUI.js";
import { HandUI } from "./HandUI.js";
import { Card } from "../backend/Card.js";
import { calculateBlackjackScore } from "../backend/utils.js";

// Game state
const gameState = {
  playerHand: null,
  dealerHand: null,
  isPlayerTurn: true,
};

// Initialize the game
function initGame() {
  // Create hand UI instances
  gameState.playerHand = new HandUI("player-hand");
  gameState.dealerHand = new HandUI("dealer-hand");

  // Setup event listeners for buttons
  document.getElementById("hit-button").addEventListener("click", handleHit);
  document
    .getElementById("stand-button")
    .addEventListener("click", handleStand);
  document
    .getElementById("double-button")
    .addEventListener("click", handleDouble);
  document
    .getElementById("split-button")
    .addEventListener("click", handleSplit);

  // Start a new game
  startNewGame();
}

// Start a new game
function startNewGame() {
  // Clear both hands
  gameState.playerHand.clear();
  gameState.dealerHand.clear();

  // Deal initial cards (2 each)
  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const types = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ];

  // Randomly select cards for the dealer
  for (let i = 0; i < 2; i++) {
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const card = new Card(suit, type);

    if (i === 0) {
      card.flip(); // Dealer's first card is face down
    }

    gameState.dealerHand.addCard(card);
  }

  // Randomly select cards for the player
  for (let i = 0; i < 2; i++) {
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const card = new Card(suit, type);
    gameState.playerHand.addCard(card);
  }

  // Update the score displays
  updateScores();

  // Set initial game state
  gameState.isPlayerTurn = true;
  updateControls();
}

// Update score displays
function updateScores() {
  const playerScore = calculateBlackjackScore(gameState.playerHand.cards);
  document.getElementById("player-score").textContent = playerScore;

  // Only show dealer score for visible cards
  const visibleDealerCards = gameState.dealerHand.cards.filter(
    (card) => !card.isFlipped
  );
  const dealerScore = calculateBlackjackScore(visibleDealerCards);
  document.getElementById("dealer-score").textContent = dealerScore;
}

// Update button states based on game state
function updateControls() {
  const hitButton = document.getElementById("hit-button");
  const standButton = document.getElementById("stand-button");
  const doubleButton = document.getElementById("double-button");
  const splitButton = document.getElementById("split-button");

  hitButton.disabled = !gameState.isPlayerTurn;
  standButton.disabled = !gameState.isPlayerTurn;
  doubleButton.disabled =
    !gameState.isPlayerTurn || gameState.playerHand.cards.length > 2;

  // Enable split only if player has exactly 2 cards of the same value
  const canSplit =
    gameState.isPlayerTurn &&
    gameState.playerHand.cards.length === 2 &&
    gameState.playerHand.cards[0].type === gameState.playerHand.cards[1].type;
  splitButton.disabled = !canSplit;
}

// Handle hit button click
function handleHit() {
  if (!gameState.isPlayerTurn) return;

  // Deal a new card to the player
  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const types = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ];

  const suit = suits[Math.floor(Math.random() * suits.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  const card = new Card(suit, type);

  gameState.playerHand.addCard(card);
  updateScores();

  // Check if player busts
  const playerScore = calculateBlackjackScore(gameState.playerHand.cards);
  if (playerScore > 21) {
    endPlayerTurn();
  }

  updateControls();
}

// Handle stand button click
function handleStand() {
  if (!gameState.isPlayerTurn) return;
  endPlayerTurn();
}

// Handle double button click
function handleDouble() {
  if (!gameState.isPlayerTurn || gameState.playerHand.cards.length > 2) return;

  // Deal one more card to the player
  handleHit();

  // End player's turn
  endPlayerTurn();
}

// Handle split button click
function handleSplit() {
  // Not implemented yet
  console.log("Split functionality not implemented yet");
}

// End player's turn and play dealer's turn
function endPlayerTurn() {
  gameState.isPlayerTurn = false;
  updateControls();

  // Reveal dealer's face-down card
  gameState.dealerHand.cards.forEach((card) => {
    if (card.isFlipped) {
      card.flip();
    }
  });

  // Update dealer's score display
  updateScores();

  // Dealer draws cards until score is 17 or higher
  setTimeout(playDealerTurn, 1000);
}

// Play dealer's turn
function playDealerTurn() {
  const dealerScore = calculateBlackjackScore(gameState.dealerHand.cards);

  if (dealerScore < 17) {
    // Dealer draws a card
    const suits = ["hearts", "diamonds", "clubs", "spades"];
    const types = [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
      "A",
    ];

    const suit = suits[Math.floor(Math.random() * suits.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const card = new Card(suit, type);

    gameState.dealerHand.addCard(card);
    updateScores();

    // Continue dealer's turn after a delay
    setTimeout(playDealerTurn, 1000);
  } else {
    // End the game and determine the winner
    determineWinner();
  }
}

// Determine the winner and display result
function determineWinner() {
  const playerScore = calculateBlackjackScore(gameState.playerHand.cards);
  const dealerScore = calculateBlackjackScore(gameState.dealerHand.cards);

  let message = "";

  if (playerScore > 21) {
    message = "You bust! Dealer wins.";
  } else if (dealerScore > 21) {
    message = "Dealer busts! You win!";
  } else if (playerScore > dealerScore) {
    message = "You win!";
  } else if (dealerScore > playerScore) {
    message = "Dealer wins.";
  } else {
    message = "It's a tie!";
  }

  alert(message);

  // Start a new game after a short delay
  setTimeout(startNewGame, 2000);
}

// Initialize the game when the DOM is loaded
document.addEventListener("DOMContentLoaded", initGame);
