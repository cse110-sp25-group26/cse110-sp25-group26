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
     * @function removeCard
     * @description Removes a card from the hand.
     * @param {CardElement} cardElement - The card element to remove.
     */
    removeCard(cardElement) {
        const index = this.cards.indexOf(cardElement);
        if (index !== -1) {
            this.cards.splice(index, 1);
            if (cardElement.isConnected) {
                this._container.removeChild(cardElement);
            }
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
        const handWidth = this._container.offsetWidth || 1; // Avoid division by zero
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
            card.style.zIndex = ''; // Clear residual z-index
            card.style.width = `${cardWidth}px`; // Ensure consistent width
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
        this._updateLayout();
    }
}

customElements.define('hand-element', HandElement);