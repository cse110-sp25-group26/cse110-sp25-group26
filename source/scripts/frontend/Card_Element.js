/**
 * @class CardElement
 * @classdesc Custom web component representing a card.
 */
class CardElement extends HTMLElement {
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

		// Bind methods
		this._onDragStart = this._onDragStart.bind(this);
		this._onDragMove = this._onDragMove.bind(this);
		this._onDragEnd = this._onDragEnd.bind(this);

		// Event listeners
		this._container.addEventListener('mousedown', this._onDragStart);
		document.addEventListener('mousemove', this._onDragMove);
		document.addEventListener('mouseup', this._onDragEnd);
		this._cardFront.addEventListener('dblclick', () => this.flip());
		this._cardBack.addEventListener('dblclick', () => this.flip());
		this._container.addEventListener('mouseenter', () => {
			this._tooltip.style.display = 'block';
		});
		this._container.addEventListener('mouseleave', () => {
			this._tooltip.style.display = 'none';
		});
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
	 * @description Updates the card's front and back faces based on its attributes.
	 */
	_updateCardFace() {
		const suit = this.getAttribute('suit');
		const type = this.getAttribute('type');
		this._cardFront.innerHTML = '';

		if (suit && type) {
			const img = document.createElement('img');
			const filename = `card_${type.toLowerCase()}_${suit.toLowerCase()}.png`;
			img.src = `/source/res/img/${filename}`;
			img.alt = `${type} of ${suit}`;
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
	 * @param {MouseEvent} e - The mousedown event.
	 */
	_onDragStart(e) {
		e.preventDefault();
		e.stopPropagation();
		this._dragging = true;

		const rect = this.getBoundingClientRect();
		const parentRect = this.offsetParent?.getBoundingClientRect() || { left: 0, top: 0 };

		this._offset.x = e.clientX - rect.left;
		this._offset.y = e.clientY - rect.top;

		// Apply position and z-index to CardElement
		this.style.position = 'absolute';
		this.style.left = `${rect.left - parentRect.left}px`;
		this.style.top = `${rect.top - parentRect.top}px`;
		this.style.width = `${rect.width}px`;
		this.style.height = `${rect.height}px`;
		this.style.zIndex = '999999';
		this.style.transformOrigin = '0 0';
	}

	/**
	 * @param {MouseEvent} e - The mousemove event.
	 */
	_onDragMove(e) {
		if (!this._dragging) return;
		const parentRect = this.offsetParent?.getBoundingClientRect() || { left: 0, top: 0 };
		this.style.left = `${e.clientX - this._offset.x - parentRect.left}px`;
		this.style.top = `${e.clientY - this._offset.y - parentRect.top}px`;
	}

	/**
	 * @description Ends the drag operation and resets the card's position.
	 */
	_onDragEnd() {
		if (!this._dragging) return;
		this._dragging = false;

		// Reset styles to return to original position
		this.style.position = '';
		this.style.zIndex = '';
		this.style.left = '';
		this.style.top = '';
		this.style.width = '';
		this.style.height = '';
		this.style.transformOrigin = '';
	}
}

customElements.define('card-element', CardElement);