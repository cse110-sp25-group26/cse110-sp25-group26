import {
	Hand
} from '../backend/Hand.js'; // Import Hand class from backend

import {
	Card
} from '../backend/Card.js'; // Import Card class from backend

// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
	// Log to console for debugging
	console.log("Hand_ui.js loaded and DOMContentLoaded fired");

	// Get the hand container element from the DOM
	const handContainer = document.getElementById('hand-container');

	// If the hand container is not found, log an error and stop execution
	if (!handContainer) {
		console.error('Hand container not found');
		return; // Exit if container is missing
	}

	// Store the width of the hand container for layout calculations
	let HAND_WIDTH = handContainer.offsetWidth;

	// Create a new Hand instance to manage the cards in the hand
	const hand = new Hand();

	// Map to keep track of card objects and their corresponding DOM elements
	const cardElements = new Map();

	// Function to create a DOM element for a card
	/**
	 *
	 * @param card
	 */
	function createCardElement(card) {
		// Create a div element to represent the card visually
		const cardElement = document.createElement('div');
		// Assign the 'card' CSS class for styling
		cardElement.className = 'card';
		// Store card data as dataset attributes for reference
		cardElement.dataset.suit = card.suit;
		cardElement.dataset.type = card.type;
		// Set the text content to show card type and suit
		cardElement.textContent = `${card.type} of ${card.suit}`;

		// Add a click event listener to handle selection and unselection
		cardElement.addEventListener('click', () => {
			// Find the index of the card in the hand
			const index = hand.cards.indexOf(card);
			// If the card is already selected, unselect it
			if (card.isSelected) {
				// Unselect if already selected
				card.isSelected = false;
			} else {
				// Otherwise, select this card
				hand.selectCard(index);
			}
			// Update the UI to reflect the selection state
			updateCardDisplay();
		});

		// Return the created card element
		return cardElement;
	}

	// Function to update the visual display of the hand and position all cards
	/**
	 *
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
			card => {

				// Create the card element
				const cardElement =
                    createCardElement(
                    	card
                    );

				// Map the card object to its DOM element
				cardElements.set(
					card,
					cardElement
				);

				// Add the card element to the hand container
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

			// Position each card absolutely within the container
			hand.cards.forEach(
				(card, index) => {

					// Get the DOM element for this card
					const cardElement =
                        cardElements.get(
                        	card
                        );

					// Set absolute positioning for the card
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
			const overlap =
                (
                	totalCardsWidth - 
                    HAND_WIDTH
                ) / 
                (
                	hand.cards.length - 1
                );

			// Position each card with calculated overlap
			hand.cards.forEach(
				(card, index) => {

					// Get the DOM element for this card
					const cardElement =
                        cardElements.get(
                        	card
                        );

					// Set absolute positioning for the card
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

	// Function to add a new card to the hand and update the display
	/**
	 *
	 * @param suit
	 * @param type
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

	// Function to remove a card from the hand at the given index and update the display
	/**
	 *
	 * @param index
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
				// Find the selected card
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
