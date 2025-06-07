import { HandElement } from './HandElement.js';

export class ShopElement {
    constructor(shopContainer) {
        if (!(shopContainer instanceof HTMLElement)) {
            console.error("Invalid shop container provided.");
            return null;
        }
        this.shopContainer = shopContainer;

        // load css file
        const styleLink = document.createElement("link");
        styleLink.rel = "stylesheet";
        styleLink.href = "/source/scripts/frontend/shop.css";
        document.head.appendChild(styleLink);

        // Overlay background
        this.overlay = document.createElement("div");
        this.overlay.className = "shop-overlay hide";

        // Main shop box
        this.shopBox = document.createElement("div");
        this.shopBox.className = "shop-box";

        // Close button
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "✕";
        closeBtn.className = "shop-close-btn";
        closeBtn.onclick = () => this.hide();
        this.shopBox.appendChild(closeBtn);

        // Top row: buttons
        const topRow = document.createElement("div");
        topRow.className = "shop-top-row";

        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Next Round";
        nextBtn.className = "shop-btn next";
        
        const rerollBtn = document.createElement("button");
        rerollBtn.textContent = "Reroll $5";
        rerollBtn.className = "shop-btn reroll";

        topRow.appendChild(nextBtn);
        topRow.appendChild(rerollBtn);

        // Middle row: cards
        const cardRow = document.createElement("div");
        cardRow.className = "shop-card-row";

        for (let i = 0; i < 3; i++) {
            const cardBox = document.createElement("div");
            cardBox.className = "shop-card-box";
            cardBox.dataset.jokerType = `joker_${i+1}`; // Joker 타입 저장

            // for test label
            const price = document.createElement("div");
            price.textContent = i === 0 ? "$2" : "$6";
            price.className = "shop-card-price";
            cardBox.appendChild(price);

            // Create card element for joker
            const cardElement = document.createElement('card-element');
            cardElement.setAttribute('suit', 'joker');
            cardElement.setAttribute('type', `joker_${i+1}`);
            cardElement.style.width = '100%';
            cardElement.style.height = '100%';
            cardBox.appendChild(cardElement);

            // Add click event listener for purchase
            cardBox.addEventListener('click', () => this.purchaseJoker(cardBox));

            cardRow.appendChild(cardBox);
        }

        // Bottom row: packs
        const packRow = document.createElement("div");
        packRow.className = "shop-pack-row";

        for (let i = 0; i < 3; i++) {
            const packBox = document.createElement("div");
            packBox.className = "shop-pack-box";

            // for test label price
            const price = document.createElement("div");
            price.textContent = i === 0 ? "$10" : (i === 1 ? "$4" : "$6");
            price.className = "shop-pack-price";
            packBox.appendChild(price);

            // for test card text
            const label = document.createElement("div");
            label.textContent = i === 0 ? "VOUCHER" : (i === 1 ? "BUFFOON PACK" : "CELESTIAL PACK");
            label.className = "shop-pack-label";
            packBox.appendChild(label);

            packRow.appendChild(packBox);
        }

        // Combine all rows
        this.shopBox.appendChild(topRow);
        this.shopBox.appendChild(cardRow);
        this.shopBox.appendChild(packRow);
        this.overlay.appendChild(this.shopBox);
        this.shopContainer.appendChild(this.overlay);
    }

    show() {
        this.overlay.classList.remove("hide");
        setTimeout(() => this.overlay.classList.add("show"), 10);
    }
    hide() {
        this.overlay.classList.remove("show");
        setTimeout(() => this.overlay.classList.add("hide"), 450);
    }

    purchaseJoker(cardBox) {
        // Get the joker type from the card box
        const jokerType = cardBox.dataset.jokerType;
        
        // Create a new card element for the joker
        const jokerCard = document.createElement('card-element');
        jokerCard.setAttribute('suit', 'joker');
        jokerCard.setAttribute('type', jokerType);
        
        // Get the jokers area and add the card
        const jokersArea = document.getElementById('jokers-area');
        if (jokersArea && jokersArea instanceof HandElement) {
            jokersArea.addCard(jokerCard);  // HandElement의 addCard 메서드 사용
            
            // Remove the card from the shop
            cardBox.remove();
            
            console.log(`Purchased joker: ${jokerType}`);
        } else {
            console.error('Jokers area not found or not a HandElement');
        }
    }
}   