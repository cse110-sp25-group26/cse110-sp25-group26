/**
 * @class HandElement
 * @classdesc Custom web component representing a hand of cards.
 */
class HandElement extends HTMLElement {
    /**
     * @class
     * @description Sets up shadow DOM, structure, and event listeners.
     */
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Hand container
        this._container = document.createElement('div');
        this._container.classList.add('hand');
        this.shadowRoot.appendChild(this._container);

        // Attach external CSS
        const styleLink = document.createElement('link');
        styleLink.setAttribute('rel', 'stylesheet');
        styleLink.setAttribute('href', '/source/scripts/frontend/hand.css');
        this.shadowRoot.appendChild(styleLink);

        // Internal state
        this.cards = [];

        // Listen for card-dropped events
        this.addEventListener('card-dropped', this._onCardDropped.bind(this));
    }

    /**
     * @function addCard
     * @description Adds a card to the hand.
     * @param {CardElement} cardElement - The card element to add.
     */
    addCard(cardElement) {
        cardElement.addEventListener('click', () => this._onCardSelect(cardElement));
        this.cards.push(cardElement);
        this._container.appendChild(cardElement);
        this._updateLayout();
    }

    /**
     * @function addCardAtIndex
     * @description Adds a card at a specific index in the hand.
     * @param {CardElement} cardElement - The card element to add.
     * @param {number} index - The index to insert the card at.
     */
    addCardAtIndex(cardElement, index) {
        cardElement.addEventListener('click', () => this._onCardSelect(cardElement));
        this.cards.splice(index, 0, cardElement);
        this._container.appendChild(cardElement);
        this._updateLayout();
    }

    /**
     * @function removeCard
     * @description Removes a card from the hand.
     * @param {CardElement} cardElement - The card element to remove.
     */
    removeCard(cardElement) {
        const index = this.cards.indexOf(cardElement);
        if (index !== -1) {
            this.cards.splice(index, 1);
            this._container.removeChild(cardElement);
            this._updateLayout();
        }
    }

    /**
     * @function removeSelectedCards
     * @description Removes all selected cards from the hand.
     */
    removeSelectedCards() {
        const selectedCards = this.getSelectedCards();
        console.log('Selected cards to remove:', selectedCards); // Debug log
        selectedCards.forEach(card => this.removeCard(card));
    }

    /**
     * @function getSelectedCards
     * @description Returns an array of currently selected card elements.
     * @returns {CardElement[]}
     */
    getSelectedCards() {
        return this.cards.filter(card => card.classList.contains('selected'));
    }

    /**
     * @function _updateLayout
     * @description Updates the layout of cards in the hand, scaling them to fit.
     */
    _updateLayout() {
        const handWidth = this._container.offsetWidth;
        const cardWidth = 80; // Default card width
        const totalWidth = this.cards.length * cardWidth;

        let overlap = 0;
        if (totalWidth > handWidth && this.cards.length > 1) {
            overlap = (totalWidth - handWidth) / (this.cards.length - 1);
        }

        this.cards.forEach((card, index) => {
            card.style.position = 'absolute';
            card.style.left = `${index * (cardWidth - overlap)}px`;
            card.style.transform = card.classList.contains('selected') ? 'translateY(-20px)' : 'translateY(0)';
        });
    }

    /**
     * @function _onCardSelect
     * @description Handles card selection.
     * @param {CardElement} cardElement - The selected card element.
     */
    _onCardSelect(cardElement) {
        const isSelected = cardElement.classList.toggle('selected');
        cardElement.style.transform = isSelected ? 'translateY(-20px)' : 'translateY(0)';
        this.dispatchEvent(new CustomEvent('card-selected', {
            detail: { card: cardElement, selected: isSelected },
            bubbles: true,
            composed: true
        }));
        this._updateLayout(); // Update layout to reflect selection
    }

    /**
     * @function _onCardDropped
     * @description Handles the card-dropped event to reorder cards.
     * @param {CustomEvent} event - The card-dropped event.
     */
    _onCardDropped(event) {
        const { card, originalHand, originalIndex, clientX } = event.detail;

        // Only handle drops within this hand
        if (originalHand !== this) {
            // If dropped outside this hand, return to original hand
            if (originalHand && originalIndex !== null) {
                originalHand.addCardAtIndex(card, originalIndex);
            }
            return;
        }

        // Get the drop position
        const newIndex = this._getInsertionIndex(clientX);

        // Remove card from current position
        const currentIndex = this.cards.indexOf(card);
        if (currentIndex !== -1) {
            this.cards.splice(currentIndex, 1);
            this._container.removeChild(card);
        }

        // Insert card at new index
        this.cards.splice(newIndex, 0, card);
        this._container.appendChild(card);
        this._updateLayout();

        // Notify game logic if the position changed
        if (currentIndex !== newIndex && newIndex !== originalIndex) {
            this.dispatchEvent(new CustomEvent('card-reordered', {
                detail: {
                    card,
                    oldIndex: originalIndex,
                    newIndex
                },
                bubbles: true,
                composed: true
            }));
        }
    }

    /**
     * @function _getInsertionIndex
     * @description Determines the insertion index based on mouse position.
     * @param {number} mouseX - The x-coordinate of the mouse.
     * @returns {number} The index where the card should be inserted.
     */
    _getInsertionIndex(mouseX) {
        const handRect = this._container.getBoundingClientRect();
        const cardWidth = 80; // Default card width
        const overlap = this.cards.length > 1 ? (this.cards.length * cardWidth - handRect.width) / (this.cards.length - 1) : 0;
        const effectiveCardWidth = cardWidth - overlap;

        // Calculate relative mouse position
        const relativeX = mouseX - handRect.left;

        // Determine insertion index
        let index = Math.round(relativeX / effectiveCardWidth);
        return Math.max(0, Math.min(index, this.cards.length));
    }
}

customElements.define('hand-element', HandElement);