/**
 * Smoothly moves a card element to a new container element.
 * Can be awaited to ensure the animation completes before continuing.
 *
 * @param {HTMLElement} cardEl - The card's DOM element to move.
 * @param {HTMLElement} targetEl - The container DOM element to move the card into.
 * @returns {Promise<void>} - Resolves when the move is complete.
 */

export async function moveTo(cardEl, targetEl) {
	return new Promise((resolve) => {
		if (!cardEl || !(cardEl instanceof HTMLElement)) {
			console.warn("Invalid card element provided to moveTo.");
			resolve();
			return;
		}

		const currentRect = cardEl.getBoundingClientRect();
		const targetRect = targetEl.getBoundingClientRect();

		const deltaX = targetRect.left - currentRect.left;
		const deltaY = targetRect.top - currentRect.top;

		cardEl.style.position = 'absolute';
		cardEl.style.transition = 'transform 0.5s ease';
		cardEl.style.zIndex = '1000';
		cardEl.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

		const onTransitionEnd = () => {
			cardEl.style.position = '';
			cardEl.style.transition = '';
			cardEl.style.zIndex = '';
			cardEl.style.transform = '';
			targetEl.appendChild(cardEl);
			cardEl.removeEventListener('transitionend', onTransitionEnd);
			resolve();
		};

		cardEl.addEventListener('transitionend', onTransitionEnd);
	});
}