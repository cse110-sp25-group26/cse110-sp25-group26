import { UIInterface } from "../backend/UIInterface.js";
import { CardElement } from "./CardElement.js";

/**
 * @classdesc Web UI implementation that connects HTML interface to game logic
 */
export class WebUI extends UIInterface {
	/**
	 *
	 */
	constructor() {
		super();
		this.gameHandler = null;
		this.canPlay = false;
		// Don't setup UI elements in constructor - wait for explicit init call
	}

	/**
	 * @function initialize
	 * @description Initializes the WebUI after DOM is ready
	 */
	initialize() {
		this.setupUIElements();
		this.setupEventListeners();
	}

	/**
	 * @function setupUIElements
	 * @description Gets references to all the UI elements we need
	 */
	setupUIElements() {
		// Hand areas
		this.playerHandContainer = document.getElementById("player-hand-cards");
		this.playedCardsContainer = document.getElementById(
			"played-cards-display"
		);
		this.jokersContainer = document.getElementById("jokers-area");
		this.consumablesContainer = document.getElementById("consumables-area");

		// Buttons
		this.playButton = document.getElementById("play-selected-cards");
		this.discardButton = document.getElementById("discard-selected-cards");
		this.optionsButton = document.getElementById("options");

		// Modals
		this.optionsModal = document.getElementById("options-modal");
		this.closeOptionsButton = document.getElementById("close-options");
		this.volumeSlider = document.getElementById("volume-slider");
		this.muteButton = document.getElementById("game-mute-btn");
		this.mainMenuButton = document.getElementById("main-menu-btn");

		// Game Over Modal
		this.gameOverModal = document.getElementById("game-over-modal");
		this.gameOverMessage = document.getElementById("game-over-message");
		this.playAgainButton = document.getElementById("play-again-btn");
		this.gameOverMenuButton = document.getElementById("game-over-menu-btn");

		// Scorekeeper elements
		this.goalScoreEl = document.getElementById("goal-score");
		this.roundScoreEl = document.getElementById("round-score");
		this.handTypeEl = document.getElementById("current-hand-type");
		this.chipValEl = document.getElementById("chip-val");
		this.multValEl = document.getElementById("mult-val");
		this.bankAmountEl = document.getElementById("bank-amount");
		this.discardsLeftEl = document.getElementById("discards-left");
		this.handsLeftEl = document.getElementById("hands-left");
		this.currentAnteEl = document.getElementById("current-ante");
		this.blindNameEl = document.getElementById("current-blind-name");
		this.deckCountEl = document.getElementById("deck-card-count");
		this.roundStatusEl = document.getElementById("round-status-display");

		// Card tracking
		this.cardElements = new Map(); // Maps Card objects to CardElement objects
	}

	/**
	 * @function setupEventListeners
	 * @description Sets up event listeners for the game buttons
	 */
	setupEventListeners() {
		if (this.playButton) {
			this.playButton.addEventListener("click", () =>
				this.onPlaySelected()
			);
		}
		if (this.discardButton) {
			this.discardButton.addEventListener("click", () =>
				this.onDiscardSelected()
			);
		}
		if (this.optionsButton) {
			this.optionsButton.addEventListener("click", () =>
				this.showOptionsModal()
			);
		}
		if (this.closeOptionsButton) {
			this.closeOptionsButton.addEventListener("click", () =>
				this.hideOptionsModal()
			);
		}
		if (this.volumeSlider) {
			this.volumeSlider.addEventListener("input", (e) =>
				this.onVolumeChange(e)
			);
		}
		if (this.muteButton) {
			this.muteButton.addEventListener("click", () => this.onToggleMute());
		}
		if (this.mainMenuButton) {
			this.mainMenuButton.addEventListener("click", () => this.exitGame());
		}
		if (this.playAgainButton) {
			this.playAgainButton.addEventListener("click", () => this.gameHandler.resetGame());
		}
		if (this.gameOverMenuButton) {
			this.gameOverMenuButton.addEventListener("click", () => this.exitGame());
		}

		// Listen for volume changes from the parent window
		window.addEventListener('message', (event) => {
			if (event.data && event.data.type === 'volumechange') {
				const volume = event.data.volume;
				if (this.volumeSlider) {
					this.volumeSlider.value = volume;
				}
				if (this.muteButton) {
					if (volume === 0) {
						this.muteButton.classList.add("muted");
					} else {
						this.muteButton.classList.remove("muted");
					}
				}
			}
		});
	}

	/**
	 * @function onPlaySelected
	 * @description Handles the Play Selected button click
	 */
	onPlaySelected() {
		if (!this.canPlay || !this.gameHandler) return;

		const selectedCards = this.getSelectedCards();
		if (selectedCards.length === 0) {
			this.showMessage("Please select cards to play first!");
			return;
		}

		const mainHandCards = this.gameHandler.state.hands.main.cards;

		// Reset card selection states
		mainHandCards.forEach((card) => {
			card.isSelected = false;
		});

		// Mark cards as selected in the backend
		selectedCards.forEach((cardElement) => {
			cardElement._card.isSelected = true;
		});

		// Call the game handler to play cards
		this.gameHandler.playCards();
	}

	/**
	 * @function onDiscardSelected
	 * @description Handles the Discard Selected button click
	 */
	onDiscardSelected() {
		if (!this.canPlay || !this.gameHandler) return;

		const selectedCards = this.getSelectedCards();
		if (selectedCards.length === 0) {
			this.showMessage("Please select cards to discard first!");
			return;
		}

		const mainHandCards = this.gameHandler.state.hands.main.cards;

		// Reset card selection states
		mainHandCards.forEach((card) => {
			card.isSelected = false;
		});

		// Mark cards as selected in the backend
		selectedCards.forEach((cardElement) => {
			cardElement._card.isSelected = true;
		});

		// Call the game handler to discard cards
		this.gameHandler.discardCards();
	}

	/**
	 * @function getSelectedCards
	 * @description Gets all currently selected card elements
	 * @returns {CardElement[]} Array of selected card elements
	 */
	getSelectedCards() {
		if (
			!this.playerHandContainer ||
			!this.playerHandContainer.getSelectedCards
		) {
			return [];
		}
		return this.playerHandContainer.getSelectedCards();
	}

	/**
	 * @function showMessage
	 * @description Shows a temporary message to the player
	 * @param {string} message - The message to show
	 */
	showMessage(message) {
		if (this.roundStatusEl) {
			const oldText = this.roundStatusEl.textContent;
			this.roundStatusEl.textContent = message;
			this.roundStatusEl.style.color = "#ff6b6b";

			setTimeout(() => {
				this.roundStatusEl.textContent = oldText;
				this.roundStatusEl.style.color = "";
			}, 2000);
		} else {
			alert(message);
		}
	}

	// ===== UIInterface Implementation =====

	/**
	 * @function createUIel
	 * @description Creates a CardElement for a backend Card
	 * @param {Card} card - The backend card object
	 */
	createUIel(card) {
		const cardElement = new CardElement(card, true);
		card.UIel = cardElement;
		this.cardElements.set(card, cardElement);
	}

	/**
	 * @function removeUIel
	 * @description Removes a CardElement for a backend Card
	 * @param {Card} card - The backend card object
	 */
	removeUIel(card) {
		const cardElement = this.cardElements.get(card);
		if (cardElement) {
			if (cardElement.parentNode) {
				cardElement.parentNode.removeChild(cardElement);
			}
			if (cardElement.cleanupCard) {
				cardElement.cleanupCard();
			}
			this.cardElements.delete(card);
			card.UIel = null;
		}
	}

	/**
	 * @function moveMultiple
	 * @description Moves cards between UI containers
	 * @param {Card[]} cards - Cards to move
	 * @param {string} origin - Origin container name
	 * @param {string} dest - Destination container name
	 */
	moveMultiple(cards, origin, dest) {
		const originContainer = this.getContainer(origin);
		const destContainer = this.getContainer(dest);

		cards.forEach((card) => {
			const cardElement = this.cardElements.get(card);
			if (!cardElement) return;

			// Remove from origin
			if (originContainer && originContainer.removeCard) {
				originContainer.removeCard(cardElement);
			}

			// Add to destination
			if (destContainer && destContainer.addCard) {
				destContainer.addCard(cardElement);
			}

			// Clear selection state
			if (cardElement.classList) {
				cardElement.classList.remove("selected");
			}
		});

		// Update deck count if moving to/from deck
		this.updateDeckCount();
	}

	/**
	 * @function getContainer
	 * @description Gets a UI container by name
	 * @param {string} containerName - Name of the container
	 * @returns {HTMLElement} The container element
	 */
	getContainer(containerName) {
		switch (containerName) {
		case "handMain":
			return this.playerHandContainer;
		case "handPlayed":
			return this.playedCardsContainer;
		case "handJoker":
			return this.jokersContainer;
		case "deck":
			return null; // Cards going to deck are removed from UI
		case "discard_pile":
			return null; // Cards going to discard are removed from UI
		case "offscreen":
			return null; // Cards going offscreen are removed from UI
		default:
			console.warn(`Unknown container: ${containerName}`);
			return null;
		}
	}

	/**
	 * @function updateScorekeeper
	 * @description Updates the scorekeeper display
	 * @param {object} data - Object with scorekeeper data
	 */
	updateScorekeeper(data) {
		if (data.minScore !== undefined && this.goalScoreEl) {
			this.goalScoreEl.textContent = data.minScore;
		}
		if (data.roundScore !== undefined && this.roundScoreEl) {
			this.animateScoreUpdate(data.roundScore);
		}
		if (data.handScore !== undefined && this.chipValEl) {
			this.chipValEl.textContent = data.handScore;
		}
		if (data.handMult !== undefined && this.multValEl) {
			this.multValEl.textContent = data.handMult;
		}
		if (data.money !== undefined && this.bankAmountEl) {
			this.bankAmountEl.textContent = data.money;
		}
		if (data.discardsRemaining !== undefined && this.discardsLeftEl) {
			this.discardsLeftEl.textContent = data.discardsRemaining;
		}
		if (data.handsRemaining !== undefined && this.handsLeftEl) {
			this.handsLeftEl.textContent = data.handsRemaining;
		}
		if (data.ante !== undefined && this.currentAnteEl) {
			this.currentAnteEl.textContent = data.ante;
		}
		if (data.blindName !== undefined && this.blindNameEl) {
			this.blindNameEl.textContent = data.blindName;
		}
		if (data.handType !== undefined && this.handTypeEl) {
			this.handTypeEl.textContent = data.handType;
		}

		this.updateDeckCount();
	}

	/**
	 * @function updateDeckCount
	 * @description Updates the deck count display
	 */
	updateDeckCount() {
		if (this.gameHandler && this.deckCountEl) {
			const remaining = this.gameHandler.state.deck.availableCards.length;
			const total = this.gameHandler.state.deck.allCards.length;
			this.deckCountEl.textContent = `${remaining}/${total}`;
		}
	}

	/**
	 * @function scoreCard
	 * @description Shows scoring animation for a card
	 * @param {Card} card - The card to animate
	 * @param {string[]} messages - Score messages to show
	 * @param {string[]} colors - Colors for the messages
	 */
	scoreCard(card, messages, colors) {
		const cardElement = this.cardElements.get(card);
		if (!cardElement || !messages || messages.length === 0) return;

		// Create floating score text
		const scoreDiv = document.createElement("div");
		scoreDiv.textContent = messages.join(" ");
		scoreDiv.style.cssText = `
			position: absolute;
			color: ${colors && colors[0] ? colors[0] : "#00FF00"};
			font-weight: bold;
			font-size: 18px;
			pointer-events: none;
			z-index: 1000;
			text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
			animation: floatUp 2s ease-out forwards;
		`;

		// Add CSS animation if not already added
		if (!document.getElementById("scoring-animation-style")) {
			const style = document.createElement("style");
			style.id = "scoring-animation-style";
			style.textContent = `
				@keyframes floatUp {
					0% { transform: translateY(0px) scale(1); opacity: 1; }
					30% { transform: translateY(-20px) scale(1.2); opacity: 1; }
					100% { transform: translateY(-60px) scale(1); opacity: 0; }
				}
				@keyframes pulseScore {
					0% { transform: scale(1); background-color: rgba(0,255,0,0.3); }
					50% { transform: scale(1.1); background-color: rgba(0,255,0,0.6); }
					100% { transform: scale(1); background-color: transparent; }
				}
			`;
			document.head.appendChild(style);
		}

		// Position and show the score
		const rect = cardElement.getBoundingClientRect();
		scoreDiv.style.left = rect.left + rect.width / 2 - 25 + "px";
		scoreDiv.style.top = rect.top - 10 + "px";

		document.body.appendChild(scoreDiv);

		// Remove after animation
		setTimeout(() => {
			if (scoreDiv.parentNode) {
				scoreDiv.parentNode.removeChild(scoreDiv);
			}
		}, 2000);
	}

	/**
	 * @function animateScoreUpdate
	 * @description Animates the round score when it updates
	 * @param {number} newScore - The new score value
	 */
	animateScoreUpdate(newScore) {
		if (!this.roundScoreEl) return;

		// Pulse animation for the round score
		this.roundScoreEl.style.animation = "pulseScore 0.6s ease-out";
		this.roundScoreEl.textContent = newScore;

		// Reset animation
		setTimeout(() => {
			this.roundScoreEl.style.animation = "";
		}, 600);
	}

	/**
	 * @function displayBust
	 * @description Shows bust message
	 */
	displayBust() {
		this.showMessage("BUST! Score over 21!");
		if (this.roundStatusEl) {
			this.roundStatusEl.textContent = "BUST! No points scored";
			this.roundStatusEl.style.color = "#ff4444";

			// Reset after a few seconds
			setTimeout(() => {
				this.roundStatusEl.textContent = "";
				this.roundStatusEl.style.color = "";
			}, 3000);
		}
	}

	/**
	 * @function displayHandScored
	 * @description Shows when a hand successfully scores
	 * @param {number} handScore - The hand score
	 * @param {number} multiplier - The multiplier applied
	 * @param {number} totalAdded - Total points added to round score
	 */
	displayHandScored(handScore, multiplier, totalAdded) {
		if (this.roundStatusEl) {
			this.roundStatusEl.textContent = `+${totalAdded} points! (${handScore} × ${multiplier})`;
			this.roundStatusEl.style.color = "#00ff00";

			// Reset after a few seconds
			setTimeout(() => {
				this.roundStatusEl.textContent = "";
				this.roundStatusEl.style.color = "";
			}, 3000);
		}
	}

	/**
	 * @function displayLoss
	 * @description Shows game over message
	 * @param {string} message - The loss message
	 */
	displayLoss(message) {
		if (this.gameOverModal && this.gameOverMessage) {
			this.gameOverMessage.textContent = message;
			this.gameOverModal.querySelector('.modal-title').textContent = "Better Luck Next Time!";
			this.gameOverModal.style.display = "flex";
			this.disallowPlay();
		} else {
			// Fallback to alert if modal isn't found
			alert(`Game Over!\n\n${message}`);
		}
	}

	/**
	 * @function displayWin
	 * @description Shows win message
	 */
	displayWin() {
		alert("Congratulations! You won!");
	}

	/**
	 * @function displayMoney
	 * @description Shows money earned
	 * @param {number} base - Base money earned
	 * @param {Array} extras - Extra money bonuses
	 */
	displayMoney(base, extras) {
		let message = `Earned $${base}`;
		if (extras && extras.length > 0) {
			message += "\nBonuses:";
			extras.forEach(([reason, amount]) => {
				message += `\n• ${reason}: +$${amount}`;
			});
		}
		alert(message);
	}

	/**
	 * @function promptEndlessMode
	 * @description Prompts for endless mode
	 * @returns {boolean} Whether player wants endless mode
	 */
	promptEndlessMode() {
		return confirm("Enter Endless Mode?");
	}

	/**
	 * @function newGame
	 * @description Initialize UI for new game
	 */
	newGame() {
		// Clear all card elements
		this.cardElements.clear();

		// Clear containers
		if (this.playerHandContainer && this.playerHandContainer.clearCards) {
			this.playerHandContainer.clearCards();
		}
		if (this.playedCardsContainer && this.playedCardsContainer.clearCards) {
			this.playedCardsContainer.clearCards();
		}

		// Reset status
		if (this.roundStatusEl) {
			this.roundStatusEl.textContent = "Game Started";
			this.roundStatusEl.style.color = "";
		}

		// Hide game over modal if it's visible
		if (this.gameOverModal) {
			this.gameOverModal.style.display = "none";
		}
	}

	/**
	 * @function exitGame
	 * @description Exit to main menu
	 */
	exitGame() {
		if (window.parent && typeof window.parent.showMainMenu === 'function') {
			window.parent.showMainMenu();
		} else {
			// Fallback for when not in an iframe
			window.location.href = "index.html";
		}
	}

	/**
	 * @function allowPlay
	 * @description Enable game controls
	 */
	allowPlay() {
		this.canPlay = true;
		if (this.playButton) this.playButton.disabled = false;
		if (this.discardButton) this.discardButton.disabled = false;
	}

	/**
	 * @function disallowPlay
	 * @description Disable game controls
	 */
	disallowPlay() {
		this.canPlay = false;
		if (this.playButton) this.playButton.disabled = true;
		if (this.discardButton) this.discardButton.disabled = true;
	}

	/**
	 * @function showOptionsModal
	 * @description Displays the options modal
	 */
	showOptionsModal() {
		if (this.optionsModal) {
			// Immediately update state when opening
			if (window.parent && typeof window.parent.getMusicVolume === "function") {
				const currentVolume = window.parent.getMusicVolume();
				if (this.volumeSlider) this.volumeSlider.value = currentVolume;
				if (this.muteButton) {
					if (currentVolume === 0) this.muteButton.classList.add("muted");
					else this.muteButton.classList.remove("muted");
				}
			}
			this.optionsModal.style.display = "flex";
		}
	}

	/**
	 * @function hideOptionsModal
	 * @description Hides the options modal
	 */
	hideOptionsModal() {
		if (this.optionsModal) {
			this.optionsModal.style.display = "none";
		}
	}

	/**
	 * @function onVolumeChange
	 * @description Handles volume slider changes
	 * @param {Event} e - The input event
	 */
	onVolumeChange(e) {
		const volume = parseFloat(e.target.value);
		window.parent.postMessage({ type: 'setvolume', volume: volume }, '*');
	}

	/**
	 * @function onToggleMute
	 * @description Handles the Mute button click
	 */
	onToggleMute() {
		window.parent.postMessage({ type: 'togglemute' }, '*');
	}
}

/**
 * @typedef {object} Card
 * @property {string} type - The type of the card (e.g., "Ace", "King").
 * @property {string} suit - The suit of the card (e.g., "Hearts", "Spades").
 * @property {boolean} isSelected - Whether the card is selected.
 */

