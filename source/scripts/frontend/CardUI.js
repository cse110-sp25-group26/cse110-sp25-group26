/**
 * @classdesc Handles the visual representation of a Card in the UI.
 */
export class CardUI {
  /**
   * Creates a new CardUI instance.
   * @param {import('../backend/Card').Card} card - The card model to represent.
   */
  constructor(card) {
    this.card = card;
    this.element = document.createElement("div");
    this.element.className = "card";
    this.element.dataset.suit = card.suit;
    this.element.dataset.type = card.type;

    this.isSelected = false;

    // Create card content elements
    this.renderCardContent();

    // Add event listener for selection
    this.element.addEventListener("click", () => this.toggleSelection());

    // If the card is initially flipped, show the back
    this.updateCardDisplay();
  }

  /**
   * Renders the card's content (value and suit).
   */
  renderCardContent() {
    // Top left value and suit
    const topValueElement = document.createElement("div");
    topValueElement.className = "card-value top-left";
    topValueElement.textContent = this.getDisplayValue();
    this.element.appendChild(topValueElement);

    // Center suit symbol
    const suitElement = document.createElement("div");
    suitElement.className = "card-suit";
    suitElement.textContent = this.getSuitSymbol();
    this.element.appendChild(suitElement);

    // Bottom right value and suit
    const bottomValueElement = document.createElement("div");
    bottomValueElement.className = "card-value bottom-right";
    bottomValueElement.textContent = this.getDisplayValue();
    this.element.appendChild(bottomValueElement);
  }

  /**
   * Gets the display value for the card.
   * @returns {string} The display value.
   */
  getDisplayValue() {
    return this.card.type;
  }

  /**
   * Gets the suit symbol for the card.
   * @returns {string} The suit symbol.
   */
  getSuitSymbol() {
    switch (this.card.suit) {
      case "hearts":
        return "♥";
      case "diamonds":
        return "♦";
      case "clubs":
        return "♣";
      case "spades":
        return "♠";
      case "joker":
        return "🃏";
      case "consumable":
        return "🔮";
      default:
        return "";
    }
  }

  /**
   * Updates the card's display based on its flipped state.
   */
  updateCardDisplay() {
    if (this.card.isFlipped) {
      this.element.classList.add("flipped");
      this.element.style.backgroundColor = "#2a5caa";
      this.element.style.color = "transparent";

      // Hide the card's content
      Array.from(this.element.children).forEach((child) => {
        child.style.visibility = "hidden";
      });

      // Add card back design
      if (!this.cardBackElement) {
        this.cardBackElement = document.createElement("div");
        this.cardBackElement.className = "card-back";
        this.cardBackElement.textContent = "🂠";
        this.cardBackElement.style.fontSize = "40px";
        this.cardBackElement.style.textAlign = "center";
        this.cardBackElement.style.lineHeight = "140px";
        this.cardBackElement.style.color = "white";
        this.element.appendChild(this.cardBackElement);
      } else {
        this.cardBackElement.style.display = "block";
      }
    } else {
      this.element.classList.remove("flipped");
      this.element.style.backgroundColor = "";
      this.element.style.color = "";

      // Show the card's content
      Array.from(this.element.children).forEach((child) => {
        if (child.className !== "card-back") {
          child.style.visibility = "visible";
        }
      });

      // Hide card back
      if (this.cardBackElement) {
        this.cardBackElement.style.display = "none";
      }
    }
  }

  /**
   * Toggles the selection state of the card.
   */
  toggleSelection() {
    if (this.card.isFlipped) return; // Can't select flipped cards

    this.isSelected = !this.isSelected;
    if (this.isSelected) {
      this.element.classList.add("selected");
    } else {
      this.element.classList.remove("selected");
    }

    // Dispatch selection event
    const event = new CustomEvent("card-selection-changed", {
      bubbles: true,
      detail: {
        card: this.card,
        isSelected: this.isSelected,
        cardUI: this,
      },
    });
    this.element.dispatchEvent(event);
  }

  /**
   * Sets the selection state of the card.
   * @param {boolean} selected - Whether the card should be selected.
   */
  setSelected(selected) {
    if (this.isSelected !== selected) {
      this.toggleSelection();
    }
  }

  /**
   * Updates the position of the card in the UI.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   * @param {number} zIndex - The z-index of the card.
   */
  setPosition(x, y, zIndex) {
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
    this.element.style.zIndex = zIndex;
  }

  /**
   * Updates the UI when the card's flip state changes.
   */
  onCardFlipped() {
    this.updateCardDisplay();
  }

  /**
   * Removes the card element from the DOM.
   */
  remove() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
