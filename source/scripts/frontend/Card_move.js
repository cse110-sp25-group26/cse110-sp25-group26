import {
	Hand
} from '../backend/Hand.js';

import {
	Card
} from '../backend/Card.js';

// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
	console.log("Hand_ui.js loaded and DOMContentLoaded fired");

	// Get the container element where the hand will be displayed
	const handContainer =
        document.getElementById('hand-container');

	// If the container is not found, log an error and stop execution
	if (
		!handContainer
	) {
		console.error(
			'Hand container not found'
		);
		return;
	}

	// Store the width of the hand container for layout calculations
	let HAND_WIDTH =
        handContainer.offsetWidth;

	// Create a new Hand instance to manage the cards
	const hand =
        new Hand();

	// Map to keep track of card objects and their corresponding DOM elements
	const cardElements =
        new Map();

	// Variable to store the index of the card being dragged
	let dragSrcIndex = null;

	/**
	 * Creates a DOM element for a card and sets up its event listeners.
	 * @param {Card} card - The card object.
	 * @param {number} index - The index of the card in the hand.
	 * @returns {HTMLElement} The created card element.
	 */
	function createCardElement(card, index) {

		// Create a div element to represent the card
		const cardElement =
            document.createElement(
            	'div'
            );

		// Assign the 'card' CSS class for styling
		cardElement.className =
            'card';

		// Make the card draggable
		cardElement.draggable = true;

		// Store card data as dataset attributes for reference
		cardElement.dataset.suit =
            card.suit;

		cardElement.dataset.type =
            card.type;

		// Set the text content to show card type and suit
		cardElement.textContent =
            `${card.type} of ${card.suit}`;

		// When the card is clicked, select it in the hand and update the UI
		cardElement.addEventListener(
			'click',
			() => {

				hand.selectCard(
					index
				);

				updateCardDisplay();
			}
		);

		// When dragging starts, remember the source index and style the card
		cardElement.addEventListener('dragstart', (e) => {
			dragSrcIndex = index;
			e.dataTransfer.effectAllowed = 'move';
			cardElement.classList.add('dragging');
		});

		// When dragging ends, clear the drag state and remove styling
		cardElement.addEventListener('dragend', () => {
			dragSrcIndex = null;
			cardElement.classList.remove('dragging');
		});

		// Allow cards to be dropped on this card
		cardElement.addEventListener('dragover', (e) => {
			e.preventDefault();
			e.dataTransfer.dropEffect = 'move';
		});

		// Handle dropping a card onto this card to reorder
		cardElement.addEventListener('drop', (e) => {
			e.preventDefault();
			const dropIndex = index;
			// Only move if the source and destination are different
			if (dragSrcIndex !== null && dragSrcIndex !== dropIndex) {
				hand.moveCard(dragSrcIndex, dropIndex);
				updateCardDisplay();
			}
		});

		// Return the created card element
		return cardElement;
	}

	/**
	 * Updates the visual display of the hand and positions all cards.
	 */
	function updateCardDisplay() {

		// Log the current state of the hand for debugging
		console.log(
			'Updating card display, cards:',
			hand.cards
		);

		// Clear the hand container before re-rendering
		handContainer.innerHTML =
            '';

		// Clear the cardElements map to rebuild it
		cardElements.clear();

		// For each card in the hand, create its DOM element and add to the container
		hand.cards.forEach(
			(card, index) => {

				const cardElement =
                    createCardElement(
                    	card,
                    	index
                    );

				cardElements.set(
					card,
					cardElement
				);

				handContainer.appendChild(
					cardElement
				);
			}
		);

		// Calculate the width of a single card (if any cards exist)
		const cardWidth =
            cardElements.size > 0
            	? cardElements
            		.values()
            		.next()
            		.value
            		.offsetWidth
            	: 0;

		// Calculate the total width required to display all cards side by side
		const totalCardsWidth =
            cardWidth *
            hand.cards.length;

		// If all cards fit side by side, lay them out without overlap
		if (
			totalCardsWidth <= HAND_WIDTH
		) {

			let offset =
                0;

			hand.cards.forEach(
				(card) => {

					const cardElement =
                        cardElements.get(
                        	card
                        );

					// Position the card absolutely within the container
					cardElement.style.position =
                        'absolute';

					// Set the left offset for the card
					cardElement.style.left =
                        `${offset}px`;

					// Raise the selected card visually
					cardElement.style.zIndex =
                        card.isSelected
                        	? '2'
                        	: '1';

					// Move the selected card up slightly
					cardElement.style.transform =
                        card.isSelected
                        	? 'translateY(-10px)'
                        	: 'translateY(0)';

					// Increment the offset for the next card
					offset +=
                        cardWidth;
				}
			);

		} else {
			// If cards don't fit, overlap them so they fit within the hand width

			// Calculate how much each card should overlap
			const overlap =
                (
                	totalCardsWidth -
                    HAND_WIDTH
                ) /
                (
                	hand.cards.length - 1
                );

			hand.cards.forEach(
				(card, index) => {

					const cardElement =
                        cardElements.get(
                        	card
                        );

					// Position the card absolutely within the container
					cardElement.style.position =
                        'absolute';

					// Set the left offset with overlap
					cardElement.style.left =
                        `${
                        	index *
                            (
                            	cardWidth - overlap
                            )
                        }px`;

					// Raise the selected card visually
					cardElement.style.zIndex =
                        card.isSelected
                        	? '2'
                        	: '1';

					// Move the selected card up slightly
					cardElement.style.transform =
                        card.isSelected
                        	? 'translateY(-10px)'
                        	: 'translateY(0)';
				}
			);
		}
	}

	/**
	 * Adds a new card to the hand and updates the display.
	 * @param {string} suit - The suit of the card.
	 * @param {string} type - The type/rank of the card.
	 */
	function addCardToHand(
		suit,
		type
	) {

		// Create a new Card object
		const card =
            new Card(
            	suit,
            	type
            );

		// Add the card to the hand
		hand.addCard(
			card
		);

		// Update the UI to show the new card
		updateCardDisplay();
	}

	/**
	 * Removes a card from the hand at the given index and updates the display.
	 * @param {number} index - The index of the card to remove.
	 */
	function removeCardFromHand(
		index
	) {

		// Remove the card from the hand
		hand.removeCard(
			index
		);

		// Update the UI to reflect the removal
		updateCardDisplay();
	}

	// Get the add and remove card buttons from the DOM
	const addCardButton =
        document.getElementById(
        	'add-card-button'
        );

	const removeCardButton =
        document.getElementById(
        	'remove-card-button'
        );

	// If the add card button exists, set up its click event
	if (
		addCardButton
	) {

		addCardButton.addEventListener(
			'click',
			() => {

				// Add a new Ace of Hearts card when clicked
				addCardToHand(
					'hearts',
					'A'
				);
			}
		);

	} else {

		// Log an error if the add card button is not found
		console.error(
			'Add card button not found'
		);
	}

	// If the remove card button exists, set up its click event
	if (
		removeCardButton
	) {

		removeCardButton.addEventListener(
			'click',
			() => {
				// Find the selected card's index
				const selectedIndex = hand.cards.findIndex(card => card.isSelected);
				// If a card is selected, remove it
				if (selectedIndex !== -1) {
					removeCardFromHand(selectedIndex);
				}
			}
		);

	} else {

		// Log an error if the remove card button is not found
		console.error(
			'Remove card button not found'
		);
	}

	// Add several cards to the hand for initial testing/demo
	addCardToHand(
		'hearts',
		'A'
	);

	addCardToHand(
		'clubs',
		'K'
	);

	addCardToHand(
		'spades',
		'2'
	);

	addCardToHand(
		'diamonds',
		'10'
	);
	addCardToHand(
		'hearts',
		'A'
	);

	addCardToHand(
		'clubs',
		'K'
	);

	addCardToHand(
		'spades',
		'2'
	);

	addCardToHand(
		'diamonds',
		'10'
	);
	addCardToHand(
		'hearts',
		'A'
	);

	addCardToHand(
		'clubs',
		'K'
	);

	addCardToHand(
		'spades',
		'2'
	);

	addCardToHand(
		'diamonds',
		'10'
	);
});