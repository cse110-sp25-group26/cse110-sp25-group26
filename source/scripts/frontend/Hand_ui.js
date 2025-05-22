import {
	Hand
} from
	'../backend/Hand.js';

import {
	Card
} from
	'../backend/Card.js';

import {
	onHandReorder
} from
	'./Card_move.js';

const handContainer =
	document
		.getElementById(
			'hand-container'
		);

if (
	!handContainer
) {
	console
		.error(
			'Hand container not found'
		);
}

let HAND_WIDTH =
	handContainer
		? handContainer
			.offsetWidth
		: 600;

const hand =
	new Hand();

const cardElements =
	new Map();

/**
 * Creates a DOM element for a card and sets up its event listeners.
 * @param {Card} card - The card object to create a UI element for.
 * @param {number} index - The index of the card in the hand.
 * @returns {HTMLElement} The created card element.
 */
function createCardElement(
	card,
	index
) {
	const cardElement =
		document
			.createElement(
				'div'
			);

	cardElement
		.className =
		'card';

	cardElement
		.dataset
		.suit =
		card
			.suit;

	cardElement
		.dataset
		.type =
		card
			.type;

	cardElement
		.textContent =
		`${card.type} of ${card.suit}`;

	cardElement
		.draggable =
		true;

	cardElement
		.addEventListener(
			'dragstart',
			(e) => {
				e
					.dataTransfer
					.effectAllowed =
					'move';

				e
					.dataTransfer
					.setData(
						'text/plain',
						index
					);

				cardElement
					.classList
					.add(
						'dragging'
					);
			}
		);

	cardElement
		.addEventListener(
			'dragend',
			() => {
				cardElement
					.classList
					.remove(
						'dragging'
					);
			}
		);

	cardElement
		.addEventListener(
			'dragover',
			(e) => {
				e
					.preventDefault();

				cardElement
					.classList
					.add(
						'drag-over'
					);
			}
		);

	cardElement
		.addEventListener(
			'dragleave',
			() => {
				cardElement
					.classList
					.remove(
						'drag-over'
					);
			}
		);

	cardElement
		.addEventListener(
			'drop',
			(e) => {
				e
					.preventDefault();

				cardElement
					.classList
					.remove(
						'drag-over'
					);

				const fromIndex =
					parseInt(
						e
							.dataTransfer
							.getData(
								'text/plain'
							),
						10
					);

				const toIndex =
					index;

				if (
					fromIndex !==
					toIndex
				) {
					onHandReorder(
						hand,
						fromIndex,
						toIndex
					);

					updateCardDisplay();
				}
			}
		);

	cardElement
		.addEventListener(
			'click',
			() => {
				card
					.isSelected =
					!card
						.isSelected;

				updateCardDisplay(
					card
				);
			}
		);

	return cardElement;
}

/**
 * Updates the visual display of the hand and positions all cards.
 * @param {Card|null} bounceCard - The card to animate (bounce) if toggled, or null for no animation.
 */
function updateCardDisplay(
	bounceCard = null
) {
	if (
		!handContainer
	) {
		return;
	}

	handContainer
		.innerHTML =
		'';

	cardElements
		.clear();

	hand
		.cards
		.forEach(
			(
				card,
				idx
			) => {
				const cardElement =
					createCardElement(
						card,
						idx
					);

				cardElements
					.set(
						card,
						cardElement
					);

				handContainer
					.appendChild(
						cardElement
					);
			}
		);

	const cardWidth =
		cardElements
			.size > 0
			? cardElements
				.values()
				.next()
				.value
				.offsetWidth
			: 0;

	const totalCardsWidth =
		cardWidth *
		hand
			.cards
			.length;

	if (
		totalCardsWidth <=
		HAND_WIDTH
	) {
		let offset =
			0;

		hand
			.cards
			.forEach(
				(
					card
				) => {
					const cardElement =
						cardElements
							.get(
								card
							);

					cardElement
						.style
						.position =
						'absolute';

					cardElement
						.style
						.left =
						`${offset}px`;

					cardElement
						.style
						.zIndex =
						card
							.isSelected
							? '2'
							: '1';

					cardElement
						.style
						.transition =
						card ===
						bounceCard
							? 'transform 0.2s cubic-bezier(.68,-0.55,.27,1.55)'
							: 'none';

					cardElement
						.style
						.transform =
						card
							.isSelected
							? 'translateY(-10px)'
							: 'translateY(0)';

					offset +=
						cardWidth;
				}
			);
	} else {
		const overlap =
			(
				totalCardsWidth -
				HAND_WIDTH
			) /
			(
				hand
					.cards
					.length -
				1
			);

		hand
			.cards
			.forEach(
				(
					card,
					index
				) => {
					const cardElement =
						cardElements
							.get(
								card
							);

					cardElement
						.style
						.position =
						'absolute';

					cardElement
						.style
						.left =
						`${
							index *
							(
								cardWidth -
								overlap
							)
						}px`;

					cardElement
						.style
						.zIndex =
						card
							.isSelected
							? '2'
							: '1';

					cardElement
						.style
						.transition =
						card ===
						bounceCard
							? 'transform 0.2s cubic-bezier(.68,-0.55,.27,1.55)'
							: 'none';

					cardElement
						.style
						.transform =
						card
							.isSelected
							? 'translateY(-10px)'
							: 'translateY(0)';
				}
			);
	}
}

/**
 * Adds a card to the hand.
 * @param {string} suit - The suit of the card (e.g., 'hearts').
 * @param {string} type - The type or value of the card (e.g., 'A', '10').
 */
function addCardToHand(
	suit,
	type
) {
	const card =
		new Card(
			suit,
			type
		);

	hand
		.addCard(
			card
		);

	updateCardDisplay();
}

/**
 * Removes a card from the hand at the given index.
 * @param {number} index - The index of the card to remove.
 */
function removeCardFromHand(
	index
) {
	hand
		.removeCard(
			index
		);

	updateCardDisplay();
}

export {
	hand,
	addCardToHand,
	removeCardFromHand,
	updateCardDisplay
};

document
	.addEventListener(
		'DOMContentLoaded',
		() => {
			const addCardButton =
				document
					.getElementById(
						'add-card-button'
					);

			const removeCardButton =
				document
					.getElementById(
						'remove-card-button'
					);

			if (
				addCardButton
			) {
				addCardButton
					.addEventListener(
						'click',
						() => {
							addCardToHand(
								'hearts',
								'A'
							);
						}
					);
			} else {
				console
					.error(
						'Add card button not found'
					);
			}

			if (
				removeCardButton
			) {
				removeCardButton
					.addEventListener(
						'click',
						() => {
							const selectedIndices =
								hand
									.cards
									.map(
										(
											card,
											idx
										) =>
											card
												.isSelected
												? idx
												: -1
									)
									.filter(
										(
											idx
										) =>
											idx !==
											-1
									)
									.reverse();

							selectedIndices
								.forEach(
									(
										idx
									) => {
										removeCardFromHand(
											idx
										);
									}
								);
						}
					);
			} else {
				console
					.error(
						'Remove card button not found'
					);
			}

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
		}
	);

