import { HandElement } from './HandElement.js'; // Import HandElement

/**
 * @class CardElement
 * @classdesc Custom web component representing a card.
 */
export class CardElement extends HTMLElement {
	/**
	 * @class
	 * @description Initializes the CardElement and sets up its structure and event listeners.
	 */
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });

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

		// Card back
		this._cardBack = document.createElement('div');
		this._cardBack.classList.add('card-back');

		// Tooltip
		this._tooltip = document.createElement('div');
		this._tooltip.classList.add('tooltip');
		this._tooltip.style.display = 'none';

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

		// Drag state
		this._dragging = false;
		this._offset = { x: 0, y: 0 };
		this._wasDragged = false;
		this._dragStartX = 0;
		this._dragStartY = 0;
		this._DRAG_THRESHOLD = 5; // Pixels

		// Tilt properties
		this._lastClientX = 0;
		this._tiltFactor = 0.5; // Degrees of tilt per pixel of X movement

		this._originalHandElement = null; // Store original hand

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
	 * @returns {string[]} Observed attributes for the CardElement.
	 */
	static get observedAttributes() {
		return ['suit', 'type', 'tooltip'];
	}

	/**
	 * @param {string} name - The name of the attribute being changed.
	 * @param {string} oldValue - The old value of the attribute.
	 * @param {string} newValue - The new value of the attribute.
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'tooltip') {
			this._tooltip.textContent = newValue || '';
		} else if (name === 'suit' || name === 'type') {
			this._updateCardFace();
		}
	}

	/**
	 * @description Called when the element is added to the DOM.
	 */
	connectedCallback() {
		this._updateCardFace();
		this._tooltip.textContent = this.getAttribute('tooltip') || '';
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
	_updateCardFace() {
		const suitAttr = this.getAttribute('suit');
		let type = this.getAttribute('type');
		this._cardFront.innerHTML = '';

		if (suitAttr && type) {
			const typeMap = {
				'A': 'ace', 'K': 'king', 'Q': 'queen', 'J': 'jack',
				'10': '10', '9': '9', '8': '8', '7': '7', '6': '6',
				'5': '5', '4': '4', '3': '3', '2': '2'
			};
			const fileType = typeMap[type.toUpperCase()] || type.toLowerCase();

			// Convert plural suit names from attributes to singular for filenames
			let fileSuit = suitAttr.toLowerCase();
			if (fileSuit.endsWith('s')) {
				fileSuit = fileSuit.substring(0, fileSuit.length - 1);
			}

			const img = document.createElement('img');
			const filename = `card_${fileType}_${fileSuit}.png`;
			img.src = `/source/res/img/${filename}`;
			img.alt = `${type} of ${suitAttr}`;
			img.style.width = '100%';
			img.style.height = '100%';
			this._cardFront.appendChild(img);
		} else {
			this._cardFront.textContent = type || '';
		}

		// Card back image
		this._cardBack.innerHTML = '';
		const backImg = document.createElement('img');
		backImg.src = '/source/res/img/back.png';
		backImg.alt = 'Card back';
		backImg.style.width = '100%';
		backImg.style.height = '100%';
		this._cardBack.appendChild(backImg);
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
		e.preventDefault();
		e.stopPropagation();
		this._dragging = true;
		this._wasDragged = false;
		this._dragStartX = e.clientX;
		this._dragStartY = e.clientY;

		// Determine and store the original hand element
		const rootNode = this.getRootNode();
		const hostElement = rootNode?.host;

		if (hostElement && hostElement instanceof HandElement) {
			this._originalHandElement = hostElement;
		} else {
			// Fallback if not in a shadow DOM or host is not a HandElement instance
			// This might happen if card is temporarily elsewhere or if element structures change
			this._originalHandElement = this.closest('hand-element');
		}
		console.log('[CardElement._onDragStart] Started dragging card. Original hand:', this._originalHandElement ? this._originalHandElement.id : 'UNKNOWN/NONE', this);

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

		console.log('[CardElement._onDragEnd] Ending drag. Original hand was:', this._originalHandElement ? this._originalHandElement.id : 'UNKNOWN/NONE', 'Card:', this);

		// Determine the actual element under the cursor at drop time
		// Temporarily hide the dragged card to accurately get the element below
		const originalPointerEvents = this.style.pointerEvents;
		this.style.pointerEvents = 'none';
		const elementUnderMouse = this.shadowRoot.elementFromPoint(e.clientX, e.clientY) || document.elementFromPoint(e.clientX, e.clientY);
		this.style.pointerEvents = originalPointerEvents;

		if (this._wasDragged) {
			this.dispatchEvent(new CustomEvent('card-dropped', {
				bubbles: true,
				composed: true,
				detail: {
					card: this,
					doriginalEvent: e, // The original mouse event
					target: elementUnderMouse,
					originalHand: this._originalHandElement 
				}
			}));

			// Reset visual drag state. If the card is not adopted by a new hand or area,
            // its original hand's _updateLayout should correctly reposition it.
            // Clearing these helps _updateLayout work from a cleaner slate.
			this.style.zIndex = this._preDragZIndex || '';
            this.style.transform = this._preDragTransform || ''; // Restore original transform or clear
            // Position is tricky. If we clear left/top, and _updateLayout doesn't run or fails,
            // it might snap to 0,0. However, _updateLayout *will* set left/top.
            // Let's clear them to avoid interference with _updateLayout's calculations.
            this.style.left = '';
            this.style.top = '';
            // this.style.position is managed by _updateLayout which sets it to 'absolute'

		} else {
			// This was a click, not a drag. Restore any click-related styles if necessary.
			// Handled by HandElement's _onCardSelect
		}

		// Reset internal drag state variables
		this._wasDragged = false;
		this._dragStartX = 0;
		this._dragStartY = 0;
		this._lastClientX = 0;
		this._originalHandElement = null; // Clear after drag end
	}
}

customElements.define('card-element', CardElement);