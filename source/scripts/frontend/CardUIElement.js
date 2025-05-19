/** @file Card UI element with flip, drag, and tooltip functionality. */

class CardElement extends HTMLElement {

	/** Sets up shadow DOM, card faces, and event listeners. */
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });

		// Card container
		this._container = document.createElement('div');
		this._container.classList.add('card');
		this._container.tabIndex = 0;

		// Card inner for 3D flip
		const cardInner = document.createElement('div');
		cardInner.classList.add('card-inner');

		// Card front (image or text)
		const cardFront = document.createElement('div');
		cardFront.classList.add('card-front');
		const suit = this.getAttribute('suit');
		const type = this.getAttribute('type');
		if (suit && type) {
			const img = document.createElement('img');
			img.src = `/source/res/img/card_${type.toLowerCase()}_${suit.toLowerCase()}.png`;
			img.alt = `${type} of ${suit}`;
			img.style.width = "100%";
			img.style.height = "100%";
			cardFront.appendChild(img);
		} else {
			cardFront.textContent = type || '';
		}

		// Card back (image or color)
		const cardBack = document.createElement('div');
		cardBack.classList.add('card-back');
		const backImg = document.createElement('img');
		backImg.src = '/source/res/img/back.png';
		backImg.alt = 'Card back';
		backImg.style.width = "100%";
		backImg.style.height = "100%";
		cardBack.appendChild(backImg);

		// Tooltip
		const tooltip = document.createElement('div');
		tooltip.classList.add('tooltip');
		tooltip.textContent = this.getAttribute('tooltip') || '';

		cardInner.appendChild(cardFront);
		cardInner.appendChild(cardBack);
		this._container.append(cardInner, tooltip);
		this.shadowRoot.appendChild(this._container);

		// Attach external CSS
		const styleLink = document.createElement('link');
		styleLink.setAttribute('rel', 'stylesheet');
		styleLink.setAttribute('href', '/source/scripts/frontend/card.css');
		this.shadowRoot.appendChild(styleLink);

		// Drag state
		this._dragging = false;
		this._offset = { x: 0, y: 0 };

		// Event listeners
		// Event listeners
		this._container.addEventListener('mousedown', this._onDragStart.bind(this));
		document.addEventListener('mousemove', this._onDragMove.bind(this));
		document.addEventListener('mouseup', this._onDragEnd.bind(this));


		cardFront.addEventListener('dblclick', () => this.flip());
		cardBack.addEventListener('dblclick', () => this.flip());
		this._container.addEventListener('mouseenter', () => tooltip.style.display = 'block');
		this._container.addEventListener('mouseleave', () => tooltip.style.display = 'none');
	}
	/** Flips the card to show front or back. */
	flip() {
		this._container.classList.toggle('flipped');
	}


	/** Starts drag behavior. @param {MouseEvent} e */
	_onDragStart(e) {
		e.preventDefault();
		this._dragging = true;
		this._offset.x = e.clientX - this._container.getBoundingClientRect().left;
		this._offset.y = e.clientY - this._container.getBoundingClientRect().top;
		this._container.style.position = 'absolute';
		this._container.style.zIndex = 1000;
		this._container.style.width = this._container.offsetWidth + 'px';
		this._container.style.height = this._container.offsetHeight + 'px';
	}

	/** Updates card position during drag. @param {MouseEvent} e */
	_onDragMove(e) {
		if (!this._dragging) return;
		this._container.style.left = `${e.clientX - this._offset.x}px`;
		this._container.style.top = `${e.clientY - this._offset.y}px`;
	}

	/**
	 * Ends dragging and resets card style.
	 * @param {MouseEvent} e - The mouse up event
	 */
	_onDragEnd() {
		if (!this._dragging) return;
		this._dragging = false;
		this._container.style.position = '';
		this._container.style.zIndex = '';
		this._container.style.left = '';
		this._container.style.top = '';
		this._container.style.width = '';
		this._container.style.height = '';
		this.dispatchEvent(new CustomEvent('card-dropped', { bubbles: true, composed: true }));
	}
}

customElements.define('card-element', CardElement);