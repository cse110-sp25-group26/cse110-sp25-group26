/** 
 * @type {(hand: object, fromIndex: number, toIndex: number) => void | null}
 */
let reorderCallback =
    null;

/**
 * Sets the callback to be called when a hand is reordered.
 * @param {(hand: object, fromIndex: number, toIndex: number) => void} cb - Callback with (hand, fromIndex, toIndex).
 */
export function setHandReorderCallback(
	cb
) {
	reorderCallback =
        cb;
}

/**
 * Called when a hand's cards are reordered.
 * @param {object} hand - The hand object being reordered.
 * @param {number} fromIndex - The original index of the card.
 * @param {number} toIndex - The new index for the card.
 */
export function onHandReorder(
	hand,
	fromIndex,
	toIndex
) {
	if (
		fromIndex ===
        toIndex
	) {
		return;
	}

	if (
		typeof reorderCallback ===
        'function'
	) {
		reorderCallback(
			hand,
			fromIndex,
			toIndex
		);
	}

	else if (
		typeof hand.moveCard ===
        'function'
	) {
		hand.moveCard(
			fromIndex,
			toIndex
		);
	}

	else {
		// Fallback if moveCard is not implemented
		const [
			card
		] =
            hand.cards.splice(
            	fromIndex,
            	1
            );

		hand.cards.splice(
			toIndex,
			0,
			card
		);
	}

	// Add additional game logic or notifications here if needed
}

