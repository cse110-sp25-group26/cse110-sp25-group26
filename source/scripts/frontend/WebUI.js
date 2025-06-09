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
		this.saveButton = document.getElementById("save-game");
		this.infoButton = document.getElementById("info");
		this.optionsButton = document.getElementById("options");

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
		if (this.saveButton) {
			this.saveButton.addEventListener("click", () => this.saveGame());
		}
		if (this.infoButton) {
			this.infoButton.addEventListener("click", () => this.showInfo());
		}
		if (this.optionsButton) {
			this.optionsButton.addEventListener("click", () =>
				this.showOptions()
			);
		}
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
		case "handConsumable":
			return this.consumablesContainer;
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
		alert(`Game Over!\n\n${message}`);
		// Could show a proper modal here instead
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
	}

	/**
	 * @function exitGame
	 * @description Exit to main menu
	 */
	exitGame() {
		window.location.href = "index.html";
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
	 * @function saveGame
	 * @description Triggers the save game functionality
	 */
	saveGame() {
		if (this.gameHandler) {
			this.gameHandler.saveGame();
		}
	}

	/**
	 * @function showInfo
	 * @description Displays game information and rules
	 */
	showInfo() {
		this.displayModal({
			title: "Game Information",
			content: `
				<div style="text-align: left; line-height: 1.6;">
					<h3 style="color: #d4af37; margin-bottom: 15px;">🎯 Goal</h3>
					<p>Score enough points to meet each blind's requirement and advance through all antes to win!</p>
					
					<h3 style="color: #d4af37; margin-bottom: 15px;">🃏 How to Play</h3>
					<ul style="margin-left: 20px;">
						<li><strong>Select cards</strong> from your hand by clicking them</li>
						<li><strong>Play cards</strong> to score points (must not exceed 21)</li>
						<li><strong>Discard cards</strong> to get new ones from the deck</li>
						<li><strong>Use jokers</strong> to boost your score and multiply points</li>
					</ul>
					
					<h3 style="color: #d4af37; margin-bottom: 15px;">📊 Scoring</h3>
					<p>Cards have their face value (Ace=1, Jack/Queen/King=10). Jokers provide special bonuses and multipliers.</p>
					
					<h3 style="color: #d4af37; margin-bottom: 15px;">💰 Progression</h3>
					<p>Complete blinds to earn money, advance through antes, and unlock new challenges!</p>
				</div>
			`,
			buttons: [
				{
					text: "Close",
					style: "primary",
					action: () => this.closeModal(),
				},
			],
		});
	}

	/**
	 * @function showOptions
	 * @description Displays game options and settings
	 */
	showOptions() {
		// Get current music index if available
		let currentMusicIndex = 0;
		try {
			if (window.parent && window.parent.getAvailableMusic) {
				// Get available music sources for future use
				window.parent.getAvailableMusic();
				currentMusicIndex = parseInt(
					localStorage.getItem("preferredMusicIndex") || "0",
					10
				);
			}
		} catch {
			// Fallback if parent access fails
		}

		this.displayModal({
			title: "Game Options",
			content: `
				<div style="text-align: left; line-height: 1.8;">
					<h3 style="color: #d4af37; margin-bottom: 15px;">🎵 Audio Settings</h3>
					<div style="margin-bottom: 20px;">
						<label style="display: block; margin-bottom: 10px;">Background Music:</label>
						<select id="music-select" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
							<option value="0" ${
	currentMusicIndex === 0 ? "selected" : ""
}>Track 1 (Default)</option>
							<option value="1" ${currentMusicIndex === 1 ? "selected" : ""}>Track 2</option>
						</select>
					</div>
					
					<h3 style="color: #d4af37; margin-bottom: 15px;">💾 Save Management</h3>
					<div style="margin-bottom: 20px;">
						<button id="save-current-game" style="
							background: linear-gradient(45deg, #27ae60, #2ecc71);
							color: white; border: none; padding: 10px 20px; 
							border-radius: 6px; cursor: pointer; margin-right: 10px;
						">💾 Save Current Game</button>
						<button id="clear-save-data" style="
							background: linear-gradient(45deg, #e74c3c, #c0392b);
							color: white; border: none; padding: 10px 20px; 
							border-radius: 6px; cursor: pointer;
						">🗑️ Clear Save Data</button>
					</div>
					
					<h3 style="color: #d4af37; margin-bottom: 15px;">🏠 Navigation</h3>
					<button id="return-to-menu" style="
						background: linear-gradient(45deg, #34495e, #2c3e50);
						color: white; border: none; padding: 10px 20px; 
						border-radius: 6px; cursor: pointer; width: 100%;
					">🏠 Return to Main Menu</button>
				</div>
			`,
			buttons: [
				{
					text: "Apply Changes",
					style: "primary",
					action: () => this.applyOptions(),
				},
				{
					text: "Cancel",
					style: "secondary",
					action: () => this.closeModal(),
				},
			],
		});

		// Add event listeners for the option buttons
		setTimeout(() => {
			const musicSelect = document.getElementById("music-select");
			const saveCurrentGame =
				document.getElementById("save-current-game");
			const clearSaveData = document.getElementById("clear-save-data");
			const returnToMenu = document.getElementById("return-to-menu");

			if (musicSelect) {
				musicSelect.addEventListener("change", (e) => {
					const newIndex = parseInt(e.target.value, 10);
					try {
						if (window.parent && window.parent.setMusicSource) {
							window.parent.setMusicSource(newIndex);
						}
					} catch (err) {
						console.log("Could not change music:", err);
					}
				});
			}

			if (saveCurrentGame) {
				saveCurrentGame.addEventListener("click", () => {
					this.saveGame();
				});
			}

			if (clearSaveData) {
				clearSaveData.addEventListener("click", () => {
					if (
						confirm(
							"Are you sure you want to clear all save data? This cannot be undone."
						)
					) {
						if (this.gameHandler && this.gameHandler.gameStorage) {
							this.gameHandler.gameStorage.clearCurrentGame();
							this.showMessage("Save data cleared successfully!");
						}
					}
				});
			}

			if (returnToMenu) {
				returnToMenu.addEventListener("click", () => {
					if (
						confirm(
							"Return to main menu? Any unsaved progress will be lost."
						)
					) {
						this.exitGame();
					}
				});
			}
		}, 100);
	}

	/**
	 * @function applyOptions
	 * @description Applies the selected options and closes the modal
	 */
	applyOptions() {
		this.showMessage("Options applied successfully!");
		this.closeModal();
	}

	/**
	 * @function displayModal
	 * @description Displays a customizable modal dialog
	 * @param {object} config - Modal configuration
	 * @param {string} config.title - Modal title
	 * @param {string} config.content - Modal content HTML
	 * @param {Array} config.buttons - Array of button configurations
	 */
	displayModal(config) {
		// Remove any existing modal
		this.closeModal();

		const modal = document.createElement("div");
		modal.id = "game-modal";
		modal.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.8);
			display: flex;
			justify-content: center;
			align-items: center;
			z-index: 10000;
			backdrop-filter: blur(5px);
		`;

		const content = document.createElement("div");
		content.style.cssText = `
			background: linear-gradient(135deg, #2c3e50, #3498db);
			color: white;
			padding: 30px;
			border-radius: 15px;
			max-width: 600px;
			max-height: 80vh;
			overflow-y: auto;
			box-shadow: 0 20px 40px rgba(0,0,0,0.5);
			border: 2px solid #d4af37;
		`;

		let buttonsHtml = "";
		if (config.buttons && config.buttons.length > 0) {
			buttonsHtml = '<div style="margin-top: 25px; text-align: center;">';
			config.buttons.forEach((button, index) => {
				const buttonStyle =
					button.style === "secondary"
						? "background: linear-gradient(45deg, #95a5a6, #7f8c8d);"
						: "background: linear-gradient(45deg, #27ae60, #2ecc71);";
				buttonsHtml += `
					<button id="modal-btn-${index}" style="
						${buttonStyle}
						color: white;
						border: none;
						padding: 12px 25px;
						margin: 0 10px;
						border-radius: 6px;
						cursor: pointer;
						font-weight: bold;
					">${button.text}</button>
				`;
			});
			buttonsHtml += "</div>";
		}

		content.innerHTML = `
			<h2 style="margin-bottom: 20px; color: #d4af37; text-align: center;">${config.title}</h2>
			${config.content}
			${buttonsHtml}
		`;

		modal.appendChild(content);
		document.body.appendChild(modal);

		// Add button event listeners
		if (config.buttons) {
			config.buttons.forEach((button, index) => {
				const btnElement = document.getElementById(
					`modal-btn-${index}`
				);
				if (btnElement && button.action) {
					btnElement.addEventListener("click", button.action);
				}
			});
		}

		// Close on background click
		modal.addEventListener("click", (e) => {
			if (e.target === modal) {
				this.closeModal();
			}
		});

		// Close on Escape key
		const handleKeydown = (e) => {
			if (e.key === "Escape") {
				this.closeModal();
				document.removeEventListener("keydown", handleKeydown);
			}
		};
		document.addEventListener("keydown", handleKeydown);
	}

	/**
	 * @function closeModal
	 * @description Closes the current modal dialog
	 */
	closeModal() {
		const modal = document.getElementById("game-modal");
		if (modal) {
			document.body.removeChild(modal);
		}
	}

	/**
	 * @function displayGameOver
	 * @description Shows the game over screen with statistics
	 * @param {object} gameOverData - Game over statistics
	 * @param {boolean} gameOverData.isWin - Whether the player won
	 * @param {number} gameOverData.totalScore - Final score
	 * @param {number} gameOverData.levelsCompleted - Number of levels completed
	 * @param {number} gameOverData.playTime - Play time in milliseconds
	 */
	displayGameOver(gameOverData) {
		const { isWin, totalScore, levelsCompleted, playTime } = gameOverData;

		// Convert play time to readable format
		const playTimeSeconds = Math.floor(playTime / 1000);
		const minutes = Math.floor(playTimeSeconds / 60);
		const seconds = playTimeSeconds % 60;
		const playTimeFormatted = `${minutes}:${seconds
			.toString()
			.padStart(2, "0")}`;

		// Create game over modal
		const modal = document.createElement("div");
		modal.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.8);
			display: flex;
			justify-content: center;
			align-items: center;
			z-index: 10000;
			backdrop-filter: blur(5px);
		`;

		const content = document.createElement("div");
		content.style.cssText = `
			background: linear-gradient(135deg, #2c3e50, #3498db);
			color: white;
			padding: 40px;
			border-radius: 20px;
			text-align: center;
			box-shadow: 0 20px 40px rgba(0,0,0,0.5);
			border: 2px solid ${isWin ? "#27ae60" : "#e74c3c"};
			max-width: 500px;
			min-width: 400px;
		`;

		content.innerHTML = `
			<h1 style="font-size: 3em; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); color: ${
	isWin ? "#27ae60" : "#e74c3c"
};">
				${isWin ? "🎉 VICTORY! 🎉" : "💀 GAME OVER 💀"}
			</h1>
			<div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; margin: 20px 0;">
				<h2 style="color: #ecf0f1; margin-bottom: 25px; font-size: 1.5em;">📊 Final Statistics</h2>
				<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: left;">
					<div>
						<strong style="color: #f39c12;">Total Score:</strong><br>
						<span style="font-size: 1.4em; color: #fff;">${totalScore.toLocaleString()}</span>
					</div>
					<div>
						<strong style="color: #f39c12;">Levels Completed:</strong><br>
						<span style="font-size: 1.4em; color: #fff;">${levelsCompleted}</span>
					</div>
					<div style="grid-column: 1 / -1;">
						<strong style="color: #f39c12;">Play Time:</strong><br>
						<span style="font-size: 1.4em; color: #fff;">${playTimeFormatted}</span>
					</div>
				</div>
			</div>
			<div style="margin-top: 30px;">
				<button id="play-again-btn" style="
					background: linear-gradient(45deg, #27ae60, #2ecc71);
					color: white;
					border: none;
					padding: 12px 30px;
					margin: 0 10px;
					border-radius: 25px;
					cursor: pointer;
					font-size: 1.1em;
					font-weight: bold;
					transition: all 0.3s ease;
					box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
				">🔄 Play Again</button>
				<button id="main-menu-btn" style="
					background: linear-gradient(45deg, #34495e, #2c3e50);
					color: white;
					border: none;
					padding: 12px 30px;
					margin: 0 10px;
					border-radius: 25px;
					cursor: pointer;
					font-size: 1.1em;
					font-weight: bold;
					transition: all 0.3s ease;
					box-shadow: 0 4px 15px rgba(52, 73, 94, 0.3);
				">🏠 Main Menu</button>
			</div>
		`;

		modal.appendChild(content);
		document.body.appendChild(modal);

		// Add button event listeners
		document
			.getElementById("play-again-btn")
			.addEventListener("click", () => {
				document.body.removeChild(modal);
				this.gameHandler.resetGame();
			});

		document
			.getElementById("main-menu-btn")
			.addEventListener("click", () => {
				this.exitGame();
			});

		// Add hover effects
		const buttons = content.querySelectorAll("button");
		buttons.forEach((button) => {
			button.addEventListener("mouseenter", () => {
				button.style.transform = "translateY(-2px)";
				button.style.boxShadow = button.style.boxShadow.replace(
					"0 4px",
					"0 8px"
				);
			});
			button.addEventListener("mouseleave", () => {
				button.style.transform = "translateY(0)";
				button.style.boxShadow = button.style.boxShadow.replace(
					"0 8px",
					"0 4px"
				);
			});
		});
	}
}

/**
 * @typedef {object} Card
 * @property {string} type - The type of the card (e.g., "Ace", "King").
 * @property {string} suit - The suit of the card (e.g., "Hearts", "Spades").
 * @property {boolean} isSelected - Whether the card is selected.
 */

