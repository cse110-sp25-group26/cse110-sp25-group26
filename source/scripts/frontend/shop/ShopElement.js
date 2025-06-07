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
        styleLink.href = "/source/scripts/frontend/shop/shop.css";
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

            // for test label
            const price = document.createElement("div");
            price.textContent = i === 0 ? "$5" : "$6";
            price.className = "shop-card-price";
            cardBox.appendChild(price);

            // for test card text
            const label = document.createElement("div");
            label.textContent = `JOKER ${i+1}`;
            label.className = "shop-card-label";
            cardBox.appendChild(label);

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
} 