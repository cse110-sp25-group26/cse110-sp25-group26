//import { Card } from '../backend/Card.js';
/**
 * @typedef {import("../backend/Card.js").Card} Card
 */

/**
 * @classdesc Custom web component representing a card.
 * 
 * @property {HTMLElement} _container - The main container for the card.
 * @property {HTMLElement} _cardInner - The inner container for the card's 3D flip effect.
 * @property {HTMLElement} _cardFront - The front face of the card.
 * @property {HTMLElement} _cardBack - The back face of the card.
 * @property {HTMLElement} _tooltip - The tooltip element for displaying additional information.
 * @property {boolean} _dragging - Indicates if the card is currently being dragged.
 * @property {object} _offset - The offset of the card from the mouse cursor during drag.
 * @property {boolean} _wasDragged - Indicates if the card was dragged before flipping.
 * @property {number} _dragStartX - The X coordinate where the drag started.
 * @property {number} _dragStartY - The Y coordinate where the drag started.
 * @property {number} _DRAG_THRESHOLD - The pixel threshold to consider a drag action.
 * @property {number} _lastClientX - The last X coordinate of the mouse during drag.
 * @property {number} _tiltFactor - The factor by which the card tilts based on mouse movement.
 * @property {object} _dragPreparationState - Stores the initial state of the card before dragging starts.
 * @property {string} _preDragTransform - The original transform style of the card before dragging.
 * @property {string} _card - Mirror of the backend Card object associated with this element.
 * @property {boolean} _draggable - Indicates if the card is draggable.
 */
export class CardElement extends HTMLElement {
	/**
	 * @class
	 * @description Initializes the CardElement and sets up its structure and event listeners.
	 * 
	 * @param {Card} card - The backend Card object associated with this element.
	 * @param {boolean} [draggable=true] - Whether the card is draggable. Defaults to true.
	 */
	constructor(card, draggable = true) {
		super();
		this.attachShadow({ mode: 'open' });

		this._card = card;
		this._draggable = draggable;

		this._createDOM();
		this._setupDragState();
		this._setupEventListeners();

	}

	/**
	 * @function _createDOM
	 * @description Creates the DOM structure for the card, including its front and back faces, tooltip, and event listeners.
	 * @private
	 * @returns {void}
	 */
	_createDOM() {
		// Card container
		this._container = document.createElement('div');
		this._container.classList.add('card');
		this._container.tabIndex = 0;

		// Card inner for 3D flip
		this._cardInner = document.createElement('div');
		this._cardInner.classList.add('card-inner');

		// Card front
		this._cardFront = document.createElement('div');
		this._cardFront.classList.add('card-front');
		this._frontImg = document.createElement('img');
		this._frontImg.style.width = '100%';
		this._frontImg.style.height = '100%';
		this._cardFront.appendChild(this._frontImg);

		// Card back
		this._cardBack = document.createElement('div');
		this._cardBack.classList.add('card-back');

		// Card back image
		this._cardBack.innerHTML = '';
		const backImg = document.createElement('img');
		backImg.src = '/source/res/img/back.png';
		backImg.alt = 'Card back';
		backImg.style.width = '100%';
		backImg.style.height = '100%';
		this._cardBack.appendChild(backImg);

		// Tooltip
		this._tooltip = document.createElement('div');
		this._tooltip.classList.add('tooltip');
		this._tooltip.style.display = 'none';
		this._tooltip.textContent = this.calculateTooltipText();

		// Assemble elements
		this._cardInner.appendChild(this._cardFront);
		this._cardInner.appendChild(this._cardBack);
		this._container.appendChild(this._cardInner);
		this._container.appendChild(this._tooltip);
		this.shadowRoot.appendChild(this._container);

		// Attach external CSS
		const styleLink = document.createElement('link');
		styleLink.setAttribute('rel', 'stylesheet');
		styleLink.setAttribute('href', '/source/scripts/frontend/card.css');
		this.shadowRoot.appendChild(styleLink);
	}

	/**
	 * @function _setupEventListeners
	 * @description Sets up event listeners for drag and tooltip interactions.
	 * @private
	 * @returns {void}
	 */
	_setupDragState() {
		// Initialize drag state
		this._dragging = false;
		this._offset = { x: 0, y: 0 };
		this._wasDragged = false;
		this._dragStartX = 0;
		this._dragStartY = 0;
		this._DRAG_THRESHOLD = 5; // Pixels
		this._lastClientX = 0;
		this._tiltFactor = 0.5; // Degrees of tilt per pixel of X movement
	}
	/**
	 * @function _setupEventListeners
	 * @description Sets up event listeners for drag and tooltip interactions.
	 * @private
	 * @returns {void}
	 */
	_setupEventListeners() {
		// Bind methods
		this._onDragStart = this._onDragStart.bind(this);
		this._onDragMove = this._onDragMove.bind(this);
		this._onDragEnd = this._onDragEnd.bind(this);
		this._onMouseEnterTooltip = this._onMouseEnterTooltip.bind(this);
		this._onMouseLeaveTooltip = this._onMouseLeaveTooltip.bind(this);

		// Event listeners
		this._container.addEventListener('mousedown', this._onDragStart);
		document.addEventListener('mousemove', this._onDragMove);
		document.addEventListener('mouseup', this._onDragEnd);

		this._cardFront.addEventListener('dblclick', () => {
			if (this._wasDragged) return;
			this.flip();
		});
		this._cardBack.addEventListener('dblclick', () => {
			if (this._wasDragged) return;
			this.flip();
		});
		this._container.addEventListener('mouseenter', this._onMouseEnterTooltip);
		this._container.addEventListener('mouseleave', this._onMouseLeaveTooltip);
	}

	/**
	 * @function calculateTooltipText
	 * @description Calculates the tooltip text based on the card's suit and type.
	 * @returns {string} The tooltip text for the card.
	 */
	calculateTooltipText() {
		if (!this._card) return '';
		const suit = this._card.suit.charAt(0).toUpperCase() + this._card.suit.slice(1);
		const type = this._card.type.toUpperCase();
		return `${type} of ${suit}`;
	}

	/**
	 * @description Called when the element is added to the DOM.
	 */
	connectedCallback() {
		// TODO: Is this even called? One could just call updateCardFace directly.
		this.updateCardFace();
	}

	/**
	 * @description Called when the element is removed from the DOM.
	 */
	disconnectedCallback() {
		// Clear all event listeners
		this._container.removeEventListener('mousedown', this._onDragStart);
		document.removeEventListener('mousemove', this._onDragMove);
		document.removeEventListener('mouseup', this._onDragEnd);
		this._cardFront.removeEventListener('dblclick', this.flip);
		this._cardBack.removeEventListener('dblclick', this.flip);
		this._container.removeEventListener('mouseenter', this._onMouseEnterTooltip);
		this._container.removeEventListener('mouseleave', this._onMouseLeaveTooltip);
	}

	/**
	 * @description Updates the card's front and back faces based on its attributes.
	 */
	updateCardFace() {
		// Update existing front image
		const filename = `card_${this._card.type.toLowerCase()}_${this._card.suit.toLowerCase()}.png`;
		this._frontImg.src = `/source/res/img/${filename}`;
		this._frontImg.alt = `${this._card.type} of ${this._card.suit}`;
	}

	/**
	 * @description Flips the card to show the opposite side.
	 */
	flip() {
		this._container.classList.toggle('flipped');
	}

	/**
	 * @description Shows the tooltip.
	 */
	_onMouseEnterTooltip() {
		this._tooltip.style.display = 'block';
	}

	/**
	 * @description Hides the tooltip.
	 */
	_onMouseLeaveTooltip() {
		this._tooltip.style.display = 'none';
	}

	/**
	 * @param {MouseEvent} e - The mousedown event.
	 */
	_onDragStart(e) {
		if (!this._draggable) return;

		e.preventDefault();
		e.stopPropagation();
		this._dragging = true;
		this._wasDragged = false; // Reset until movement is detected
		this._dragStartX = e.clientX;
		this._dragStartY = e.clientY;

		// Store initial state for when drag actually starts
		this._dragPreparationState = {
			rect: this.getBoundingClientRect(),
			parentRect: this.offsetParent?.getBoundingClientRect() || { left: 0, top: 0 }
		};

		// Keep track of the original transform for restoration
		this._preDragTransform = this.style.transform;

		this.dispatchEvent(new CustomEvent('custom-drag-start', {
			bubbles: true,
			composed: true,
			detail: { card: this }
		}));
	}

	/**
	 * @param {MouseEvent} e - The mousemove event.
	 */
	_onDragMove(e) {
		if (!this._dragging) return;

		if (!this._wasDragged) {
			const dx = e.clientX - this._dragStartX;
			const dy = e.clientY - this._dragStartY;
			if (Math.sqrt(dx * dx + dy * dy) > this._DRAG_THRESHOLD) {
				this._wasDragged = true;
				this._lastClientX = e.clientX; // Initialize lastClientX when drag officially starts

				// Drag has officially started, now apply dragging styles and center the card
				const { rect, parentRect } = this._dragPreparationState;

				this._offset.x = rect.width / 2;
				this._offset.y = rect.height / 2;

				this.style.position = 'absolute';
				this.style.width = `${rect.width}px`;
				this.style.height = `${rect.height}px`;
				this.style.zIndex = '999999';
				this.style.transformOrigin = 'center center';
				this.style.transform = 'none'; // Remove any existing transform

				// Position the card so its center is at the current mouse cursor.
				this.style.left = `${e.clientX - this._offset.x - parentRect.left}px`;
				this.style.top = `${e.clientY - this._offset.y - parentRect.top}px`;
			}
		}

		if (this._wasDragged) {
			// Continue moving the card if drag has started
			const parentRect = this._dragPreparationState.parentRect; // Use stored parentRect
			this.style.left = `${e.clientX - this._offset.x - parentRect.left}px`;
			this.style.top = `${e.clientY - this._offset.y - parentRect.top}px`;

			// Calculate and apply tilt based on X velocity
			const deltaX = e.clientX - this._lastClientX;
			let tiltAngle = deltaX * this._tiltFactor;
			const MAX_TILT = 15; // Maximum tilt angle in degrees
			tiltAngle = Math.max(-MAX_TILT, Math.min(MAX_TILT, tiltAngle));
			this.style.transform = `rotateZ(${tiltAngle}deg)`;

			this._lastClientX = e.clientX;

			this.dispatchEvent(new CustomEvent('custom-drag-move', {
				bubbles: true,
				composed: true,
				detail: { card: this, clientX: e.clientX, clientY: e.clientY }
			}));
		}
	}

	/**
	 * @description Ends the drag operation and resets the card's position.
	 * @param {MouseEvent} e - The mouseup event that ends the drag.
	 */
	_onDragEnd(e) {
		if (!this._dragging) return;
		this._dragging = false;

		if (this._wasDragged) {
			// Reset styles only if the card was actually dragged and styles were changed
			this.style.position = '';
			this.style.zIndex = '';
			this.style.left = '';
			this.style.top = '';
			this.style.width = '';
			this.style.height = '';
			this.style.transformOrigin = '';

			if (this._preDragTransform !== undefined) {
				this.style.transform = this._preDragTransform;
				this._preDragTransform = undefined;
			}

			this.dispatchEvent(new CustomEvent('card-dropped', {
				bubbles: true,
				composed: true,
				detail: { card: this, clientX: e.clientX, clientY: e.clientY }
			}));
		}

		this._dragPreparationState = null; // Clean up
	}

	/**
	 * @function moveTo
	 * @description Moves the card to a specified position with a smooth transition.
	 * 
	 * @param {number} x - The x-coordinate to move the card to.
	 * @param {number} y - The y-coordinate to move the card to.
	 * @param {number} [duration=600] - The duration of the transition in milliseconds. Defaults to 600ms.
	 * @param {Function} callback - Optional callback function to execute after the move is complete.
	 * @returns {Promise<void>} A promise that resolves when the move is complete.
	 */
	async moveTo(x, y, duration = 600, callback) {
		if (!this.style.position || this.style.position === 'static') {
			this.style.position = 'absolute';
		}
		// Cancel previous animation listener if any
		if (this._transitionEndHandler) {
			this.removeEventListener('transitionend', this._transitionEndHandler);
		}
		this.style.transition = 'none';
		// Force fetch to apply the new styles immediately
		void this.offsetWidth;

		// Ensure the card is on top during transition
		const originalZIndex = this.style.zIndex;
		this.style.zIndex = '10000';

		this.style.left = `${x}px`;
		this.style.top = `${y}px`;

		return new Promise(resolve => {
			this._transitionEndHandler = () => {
				this.removeEventListener('transitionend', this._transitionEndHandler);
				this.style.zIndex = originalZIndex; // Restore original z-index
				if (callback) {
					callback(this);
				}
				resolve();
			};
			this.addEventListener('transitionend', this._transitionEndHandler);
			this.style.transition = `left ${duration}ms ease-in, top ${duration}ms ease-in`;
		});
	}

	/**
	 * @function moveMultiple
	 * @description Moves multiple cards to specified positions with a staggered delay.
	 * 
	 * @param {CardElement[]} cards - An array of CardElement instances to move.
	 * @param {Array<{x: number, y: number}>} positions - An array of objects containing x and y coordinates for each card.
	 * @param {number} [duration=600] - The duration of the transition for each card in milliseconds. Defaults to 600ms.
	 * @param {Function} callback - Optional callback function to execute after all moves are complete.
	 * @returns {Promise<void>} A promise that resolves when all cards have been moved.
	 */
	static async moveMultiple(cards, positions, duration = 600, callback) {
		let promises = [];
		cards.forEach((card, i) => {
			// codacy-disable-next-line object-injection
			const pos = positions[i];
			const { x, y } = pos;


			const delay = 400 * i;
			promises.push(new Promise(r => {
				setTimeout(() => {
					// Pass the callback to each individual moveTo call
					card.moveTo(x, y, duration, callback).then(r);
				}, delay);
			}));
		});
		await Promise.all(promises);
	}
}

customElements.define('card-element', CardElement);