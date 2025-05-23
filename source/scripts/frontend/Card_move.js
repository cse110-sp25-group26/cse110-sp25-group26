import './HandElement.js'; // Ensure HandElement is loaded

export function enableReordering(handElement) {
    let draggedCard = null;
    let originalIndex = null;

    handElement.addEventListener('dragstart', (event) => {
        if (event.target.tagName === 'CARD-ELEMENT') {
            draggedCard = event.target;
            originalIndex = handElement.cards.indexOf(draggedCard);
            event.dataTransfer.effectAllowed = 'move';
        }
    });

    handElement.addEventListener('dragover', (event) => {
        event.preventDefault();
        const targetCard = event.target.closest('card-element');
        if (targetCard) {
            targetCard.classList.add('drag-over');
        }
    });

    handElement.addEventListener('dragleave', (event) => {
        const targetCard = event.target.closest('card-element');
        if (targetCard) {
            targetCard.classList.remove('drag-over');
        }
    });

    handElement.addEventListener('drop', (event) => {
        event.preventDefault();
        const targetCard = event.target.closest('card-element');
        if (draggedCard && targetCard && draggedCard !== targetCard) {
            const targetIndex = handElement.cards.indexOf(targetCard);

            // Reorder cards
            handElement.cards.splice(originalIndex, 1);
            handElement.cards.splice(targetIndex, 0, draggedCard);
            handElement._updateLayout();

            // Notify game logic
            handElement.dispatchEvent(new CustomEvent('hand-reordered', {
                detail: { cards: handElement.cards.map(card => card.getAttribute('id')) },
                bubbles: true,
                composed: true
            }));
        } else {
            // Invalid drop, reset layout
            handElement._updateLayout();
        }
        draggedCard = null;
        originalIndex = null;
    });

    handElement.addEventListener('dragend', () => {
        if (draggedCard) {
            const currentIndex = handElement.cards.indexOf(draggedCard);
            if (currentIndex === originalIndex) {
                // Reset layout if no valid move
                handElement._updateLayout();
            }
            draggedCard = null;
            originalIndex = null;
        }
    });
}