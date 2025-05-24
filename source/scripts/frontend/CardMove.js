import { HandElement } from './HandElement.js';

/**
 * @function enableReordering
 * @description Enables drag-and-drop reordering for cards in the hand.
 * @param {HandElement} handElement - The hand element to enable reordering for.
 */
export function enableReordering(handElement) {
	let draggedCard = null;
	let originalIndex = -1;

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

		const otherCards = handElement.cards.filter(c => c !== draggedCard);
		const potentialTargetCard = elementUnderMouse ? elementUnderMouse.closest('card-element') : null;

		if (potentialTargetCard && potentialTargetCard !== draggedCard && handElement.cards.includes(potentialTargetCard)) {
			const idxInOtherCards = otherCards.indexOf(potentialTargetCard);

			if (idxInOtherCards !== -1) {
				const rect = potentialTargetCard.getBoundingClientRect();
				const isOverFirstHalf = clientX < rect.left + rect.width / 2;
				if (isOverFirstHalf) {
					newTargetIndex = idxInOtherCards;
				} else {
					newTargetIndex = idxInOtherCards + 1;
				}
			}
		} else if (elementUnderMouse === handElement._container || handElement._container.contains(elementUnderMouse)) {
			if (otherCards.length === 0) {
				newTargetIndex = 0;
			} else {
				let foundTargetSlot = false;
				for (let i = 0; i < otherCards.length; i++) {
					const card = otherCards[i];
					const rect = card.getBoundingClientRect();
					if (clientX < rect.left + rect.width / 2) {
						newTargetIndex = i;
						foundTargetSlot = true;
						break;
					}
				}
				if (!foundTargetSlot) {
					newTargetIndex = otherCards.length;
				}
			}
		}

		const cardWidth = parseFloat(getComputedStyle(draggedCard).width) || 80;

		if (newTargetIndex !== -1) {
			draggedCard._currentDropTargetIndex = newTargetIndex;

			const handWidth = handElement._container.offsetWidth || 1;
			const numLayoutSlots = otherCards.length + 1; // Other cards + 1 gap

			let overlap = 0;
			const totalWidthForLayout = numLayoutSlots * cardWidth;
			if (totalWidthForLayout > handWidth && numLayoutSlots > 1) {
				overlap = (totalWidthForLayout - handWidth) / (numLayoutSlots - 1);
			}

			let currentX = 0;
			let otherCardCursor = 0;
			for (let layoutSlotIndex = 0; layoutSlotIndex < numLayoutSlots; layoutSlotIndex++) {
				if (layoutSlotIndex === newTargetIndex) {
					// This is the gap
					currentX += (cardWidth - overlap);
				} else {
					// This is a slot for an actual card from otherCards
					if (otherCardCursor < otherCards.length) {
						const cardToStyle = otherCards[otherCardCursor];
						cardToStyle.style.position = 'absolute';
						cardToStyle.style.left = `${currentX}px`;
						cardToStyle.style.transform = cardToStyle.classList.contains('selected') ? 'translateY(-20px)' : 'translateY(0)';
						cardToStyle.style.zIndex = layoutSlotIndex.toString();
						cardToStyle.style.width = `${cardWidth}px`;
						currentX += (cardWidth - overlap);
						otherCardCursor++;
					}
				}
			}
		} else {
			// No valid drop target, reset preview for other cards
			delete draggedCard._currentDropTargetIndex;
			const handWidth = handElement._container.offsetWidth || 1;
			// otherCards already defined above

			let overlap = 0;
			if (otherCards.length > 0) {
				const totalNonDraggedCardWidth = otherCards.length * cardWidth;
				if (totalNonDraggedCardWidth > handWidth && otherCards.length > 1) {
					overlap = (totalNonDraggedCardWidth - handWidth) / (otherCards.length - 1);
				}
			}

			otherCards.forEach((card, index) => {
				card.style.position = 'absolute';
				card.style.left = `${index * (cardWidth - overlap)}px`;
				card.style.transform = card.classList.contains('selected') ? 'translateY(-20px)' : 'translateY(0)';
				card.style.zIndex = index.toString();
				card.style.width = `${cardWidth}px`;
			});
		}
	});

	handElement.addEventListener('card-dropped', (event) => {
		const cardBeingDropped = event.detail.card;

		if (!draggedCard || cardBeingDropped !== draggedCard) {
			if (draggedCard) {
				delete draggedCard._currentDropTargetIndex;
			}
			draggedCard = null;
			originalIndex = -1;
			return;
		}

		const newProposedIndex = draggedCard._currentDropTargetIndex;
		delete draggedCard._currentDropTargetIndex;

		if (originalIndex === -1) { // Safety check
			draggedCard = null;
			handElement._updateLayout();
			return;
		}

		if (newProposedIndex !== undefined) {
			const itemToMove = handElement.cards[originalIndex];

			const tempCards = [...handElement.cards];
			tempCards.splice(originalIndex, 1);

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
				handElement.dispatchEvent(new CustomEvent('hand-reordered', {
					detail: { cards: handElement.cards },
					bubbles: true,
					composed: true
				}));
			}
			handElement._updateLayout(); // Finalize positions
		} else {
			// Dropped in an invalid location or no reorder needed
			handElement._updateLayout(); // Fix layout
		}

		draggedCard = null;
		originalIndex = -1;
	});
}