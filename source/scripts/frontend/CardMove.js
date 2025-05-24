import { HandElement } from './HandElement.js';

/**
 * @function enableReordering
 * @description Enables drag-and-drop reordering for cards in the hand.
 * @param {HandElement} handElement - The hand element to enable reordering for.
 */
export function enableReordering(handElement) {
	let draggedCard = null;
	let originalIndex = -1;
	let currentTargetIndicatorCard = null;

	handElement.addEventListener('custom-drag-start', (event) => {
		const card = event.detail.card;
		// Ensure the event is from a direct child card-element of this hand's container
		if (card.parentElement === handElement._container) {
			draggedCard = card;
			originalIndex = handElement.cards.indexOf(draggedCard);
		} else {
			draggedCard = null;
			originalIndex = -1;
		}
	});

	handElement.addEventListener('custom-drag-move', (event) => {
		if (!draggedCard) return;

		const { clientX, clientY } = event.detail;
		
		const originalPointerEvents = draggedCard.style.pointerEvents;
		draggedCard.style.pointerEvents = 'none'; // Temporarily hide to find element underneath
		const elementUnderMouse = handElement.shadowRoot.elementFromPoint(clientX, clientY) || document.elementFromPoint(clientX, clientY);
		draggedCard.style.pointerEvents = originalPointerEvents;

		let newTargetIndex = -1;
		let newTargetIndicatorCardCandidate = null;

		const potentialTargetCard = elementUnderMouse ? elementUnderMouse.closest('card-element') : null;

		if (potentialTargetCard && potentialTargetCard !== draggedCard && handElement.cards.includes(potentialTargetCard)) {
			newTargetIndicatorCardCandidate = potentialTargetCard;
			const rect = potentialTargetCard.getBoundingClientRect();
			const isOverFirstHalf = clientX < rect.left + rect.width / 2;
			const idxInHand = handElement.cards.indexOf(potentialTargetCard);
			
			// Calculate index relative to the list *excluding* the dragged card for easier insertion later
			let tempIdx = idxInHand;
			if (originalIndex !== -1 && idxInHand > originalIndex) {
				tempIdx--; // Adjust for the dragged card being in the list
			}
			
			if (isOverFirstHalf) {
				newTargetIndex = tempIdx;
			} else {
				newTargetIndex = tempIdx + 1;
			}
		} else if (elementUnderMouse === handElement._container || handElement._container.contains(elementUnderMouse)) {
			const otherCards = handElement.cards.filter(c => c !== draggedCard);
			if (otherCards.length === 0) {
				newTargetIndex = 0;
			} else {
				let found = false;
				for (let i = 0; i < otherCards.length; i++) {
					const card = otherCards[i];
					const rect = card.getBoundingClientRect();
					if (clientX < rect.left + rect.width / 2) {
						newTargetIndex = i;
						found = true;
						break;
					}
				}
				if (!found) {
					newTargetIndex = otherCards.length;
				}
			}
		}

		if (currentTargetIndicatorCard && currentTargetIndicatorCard !== newTargetIndicatorCardCandidate) {
			currentTargetIndicatorCard.classList.remove('drag-over');
		}
		if (newTargetIndicatorCardCandidate && newTargetIndicatorCardCandidate !== currentTargetIndicatorCard) {
			newTargetIndicatorCardCandidate.classList.add('drag-over');
		}
		currentTargetIndicatorCard = newTargetIndicatorCardCandidate;
		
		if (newTargetIndex !== -1) {
			draggedCard._currentDropTargetIndex = newTargetIndex;
		} else {
			delete draggedCard._currentDropTargetIndex;
		}
	});

	handElement.addEventListener('card-dropped', (event) => {
		const cardBeingDropped = event.detail.card;

		if (!draggedCard || cardBeingDropped !== draggedCard) {
			if (draggedCard) { // A drag was in progress, but this is not its drop event or it's an unexpected drop
				delete draggedCard._currentDropTargetIndex;
			}
			if (currentTargetIndicatorCard) {
				currentTargetIndicatorCard.classList.remove('drag-over');
			}
			// Safety net. Reset if the dragged card is not the one being dropped.
			draggedCard = null;
			originalIndex = -1;
			currentTargetIndicatorCard = null;
			return;
		}

		// Reset styles and classes
		if (currentTargetIndicatorCard) {
			currentTargetIndicatorCard.classList.remove('drag-over');
			currentTargetIndicatorCard = null;
		}

		const newProposedIndex = draggedCard._currentDropTargetIndex;
		delete draggedCard._currentDropTargetIndex;

		if (originalIndex === -1) { // Safety check
			draggedCard = null;
			handElement._updateLayout(); // Layout is likely broken if that happened
			return;
		}
		
		if (newProposedIndex !== undefined) {
			const itemToMove = handElement.cards[originalIndex];
			
			// Remove the card from its original position
			const tempCards = [...handElement.cards];
			tempCards.splice(originalIndex, 1);

			// Insert the card at the new position
			const actualInsertionIndex = Math.max(0, Math.min(newProposedIndex, tempCards.length));
			tempCards.splice(actualInsertionIndex, 0, itemToMove);

			let orderChanged = false;
			for (let i = 0; i < handElement.cards.length; i++) {
				if (handElement.cards[i] !== tempCards[i]) {
					orderChanged = true;
					break;
				}
			}

			if (orderChanged) {
				handElement.cards = tempCards;
				handElement._updateLayout();
				handElement.dispatchEvent(new CustomEvent('hand-reordered', {
					detail: { cards: handElement.cards },
					bubbles: true,
					composed: true
				}));
			} else {
				handElement._updateLayout(); // No order change, but another safety net
			}
		} else {
			// Dropped in an invalid location or no reorder needed
			handElement._updateLayout(); // Fix layout
		}

		draggedCard = null;
		originalIndex = -1;
	});
}