import { CardUI } from "./CardUI.js";

/**
 * @classdesc Handles the visual representation and interaction of a hand of cards.
 */
export class HandUI {
  /**
   * Creates a new HandUI instance.
   * @param {string} containerId - The ID of the HTML element that will contain this hand.
   */
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.cards = [];
    this.cardUIs = [];
    this.selectedCardIndex = -1;

    // Add event listener for card selection
    this.container.addEventListener(
      "card-selection-changed",
      this.handleCardSelection.bind(this)
    );

    // Set up for drag-and-drop functionality
    this.setupDragAndDrop();
  }

  /**
   * Sets up drag-and-drop functionality for the hand.
   */
  setupDragAndDrop() {
    // Variables to track dragging state
    let isDragging = false;
    let draggedCard = null;
    let startX = 0;
    let startY = 0;
    let originalIndex = -1;
    let originalLeft = 0;
    let originalTop = 0;

    // Mouse down event - start drag
    this.container.addEventListener("mousedown", (e) => {
      // Find the card being clicked
      const cardElement = e.target.closest(".card");
      if (!cardElement) return;

      // Find the CardUI instance for this element
      const cardUI = this.cardUIs.find((ui) => ui.element === cardElement);
      if (!cardUI || cardUI.card.isFlipped) return; // Don't allow dragging flipped cards

      // Start dragging
      isDragging = true;
      draggedCard = cardUI;
      originalIndex = this.cardUIs.indexOf(cardUI);
      startX = e.clientX;
      startY = e.clientY;
      originalLeft = parseInt(cardElement.style.left || 0, 10);
      originalTop = parseInt(cardElement.style.top || 0, 10);

      // Increase z-index and add dragging class
      cardElement.style.zIndex = 1000;
      cardElement.classList.add("dragging");

      // Prevent default behavior and text selection
      e.preventDefault();
    });

    // Mouse move event - update drag position
    document.addEventListener("mousemove", (e) => {
      if (!isDragging || !draggedCard) return;

      // Calculate new position
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      // Update card position
      draggedCard.element.style.left = `${originalLeft + deltaX}px`;
      draggedCard.element.style.top = `${originalTop + deltaY}px`;

      e.preventDefault();
    });

    // Mouse up event - end drag
    document.addEventListener("mouseup", (e) => {
      if (!isDragging || !draggedCard) return;

      // Reset dragging state
      isDragging = false;
      draggedCard.element.classList.remove("dragging");

      // Determine if we're still over the hand container
      const handRect = this.container.getBoundingClientRect();
      const cardRect = draggedCard.element.getBoundingClientRect();
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const cardCenterY = cardRect.top + cardRect.height / 2;

      const isOverHand =
        cardCenterX >= handRect.left &&
        cardCenterX <= handRect.right &&
        cardCenterY >= handRect.top &&
        cardCenterY <= handRect.bottom;

      if (isOverHand) {
        // Calculate the new index based on horizontal position
        let newIndex = 0;
        const cardWidth = cardRect.width;

        // Find the correct insertion point
        for (let i = 0; i < this.cardUIs.length; i++) {
          if (i === originalIndex) continue;

          const otherCardRect = this.cardUIs[i].element.getBoundingClientRect();
          const otherCardCenter = otherCardRect.left + otherCardRect.width / 2;

          if (cardCenterX > otherCardCenter) {
            newIndex = Math.max(newIndex, i + 1);
          }
        }

        // Reorder the card if its position changed
        if (newIndex !== originalIndex) {
          // Remove from original position
          const [card] = this.cards.splice(originalIndex, 1);
          const [cardUI] = this.cardUIs.splice(originalIndex, 1);

          // Insert at new position
          this.cards.splice(newIndex, 0, card);
          this.cardUIs.splice(newIndex, 0, cardUI);
        }

        // Rearrange all cards to their proper positions
        this.arrangCards();
      } else {
        // Card was dragged out of the hand - emit event
        const event = new CustomEvent("card-removed", {
          bubbles: true,
          detail: {
            card: draggedCard.card,
            cardUI: draggedCard,
            fromIndex: originalIndex,
          },
        });
        this.container.dispatchEvent(event);

        // Remove the card from the hand
        this.removeCardAt(originalIndex);
      }

      draggedCard = null;
      e.preventDefault();
    });
  }

  /**
   * Handles card selection events.
   * @param {CustomEvent} event - The card selection event.
   */
  handleCardSelection(event) {
    const { card, isSelected, cardUI } = event.detail;
    const index = this.cardUIs.indexOf(cardUI);

    // If this card was selected, deselect any previously selected card
    if (isSelected) {
      // Deselect previous card if it's different
      if (this.selectedCardIndex !== -1 && this.selectedCardIndex !== index) {
        this.cardUIs[this.selectedCardIndex].setSelected(false);
      }
      this.selectedCardIndex = index;

      // Dispatch hand selection event
      const handEvent = new CustomEvent("hand-selection-changed", {
        bubbles: true,
        detail: {
          hand: this,
          selectedCard: card,
          selectedCardIndex: index,
        },
      });
      this.container.dispatchEvent(handEvent);
    } else if (index === this.selectedCardIndex) {
      // This card was deselected
      this.selectedCardIndex = -1;

      // Dispatch hand selection cleared event
      const handEvent = new CustomEvent("hand-selection-changed", {
        bubbles: true,
        detail: {
          hand: this,
          selectedCard: null,
          selectedCardIndex: -1,
        },
      });
      this.container.dispatchEvent(handEvent);
    }
  }

  /**
   * Adds a card to the hand.
   * @param {import('../backend/Card').Card} card - The card to add.
   */
  addCard(card) {
    // Create card UI
    const cardUI = new CardUI(card);

    // Add to internal collections
    this.cards.push(card);
    this.cardUIs.push(cardUI);

    // Add to DOM
    this.container.appendChild(cardUI.element);

    // Arrange cards with animation
    this.arrangCards(true);

    return cardUI;
  }

  /**
   * Removes a card from the hand.
   * @param {import('../backend/Card').Card} card - The card to remove.
   * @returns {boolean} True if the card was found and removed.
   */
  removeCard(card) {
    const index = this.cards.indexOf(card);
    if (index !== -1) {
      return this.removeCardAt(index);
    }
    return false;
  }

  /**
   * Removes a card at the specified index.
   * @param {number} index - The index of the card to remove.
   * @returns {boolean} True if the card was removed.
   */
  removeCardAt(index) {
    if (index < 0 || index >= this.cards.length) {
      return false;
    }

    // Remove card from collections
    const cardUI = this.cardUIs[index];
    this.cards.splice(index, 1);
    this.cardUIs.splice(index, 1);

    // Remove from DOM
    cardUI.remove();

    // Update selected index if needed
    if (this.selectedCardIndex === index) {
      this.selectedCardIndex = -1;
    } else if (this.selectedCardIndex > index) {
      this.selectedCardIndex--;
    }

    // Rearrange remaining cards
    this.arrangCards(true);

    return true;
  }

  /**
   * Arranges cards in the hand based on their count and the hand's width.
   * @param {boolean} [animate=false] - Whether to animate the arrangement.
   */
  arrangCards(animate = false) {
    if (this.cardUIs.length === 0) return;

    const containerWidth = this.container.offsetWidth;
    const cardWidth = 100; // Width of each card in pixels
    const cardHeight = 140; // Height of each card in pixels
    const cardCount = this.cardUIs.length;

    // Calculate total width needed if cards were placed side by side
    const totalCardWidth = cardCount * cardWidth;

    // Determine if we need to overlap cards
    let spacing = 0;
    if (totalCardWidth > containerWidth) {
      // Calculate overlap to make all cards fit exactly
      const availableWidth = containerWidth - cardWidth; // Reserve space for one full card
      spacing = availableWidth / Math.max(1, cardCount - 1);
    } else {
      // Place cards side by side
      spacing = cardWidth;
    }

    // Position cards
    const startX =
      (containerWidth - (spacing * (cardCount - 1) + cardWidth)) / 2;
    const centerY = (this.container.offsetHeight - cardHeight) / 2;

    this.cardUIs.forEach((cardUI, index) => {
      const x = startX + index * spacing;
      const y = centerY;

      if (animate) {
        // Add animation properties
        cardUI.element.style.transition = "left 0.3s ease, top 0.3s ease";

        // Remove transition after animation completes
        setTimeout(() => {
          cardUI.element.style.transition = "";
        }, 300);
      }

      // Set position and z-index
      cardUI.setPosition(x, y, index + 10);
    });
  }

  /**
   * Gets the currently selected card.
   * @returns {import('../backend/Card').Card|null} The selected card or null.
   */
  getSelectedCard() {
    if (this.selectedCardIndex !== -1) {
      return this.cards[this.selectedCardIndex];
    }
    return null;
  }

  /**
   * Clears all cards from the hand.
   */
  clear() {
    // Remove all card elements from the DOM
    this.cardUIs.forEach((cardUI) => cardUI.remove());

    // Clear collections
    this.cards = [];
    this.cardUIs = [];
    this.selectedCardIndex = -1;
  }

  /**
   * Updates the hand layout when the container size changes.
   */
  onResize() {
    this.arrangCards(true);
  }
}
