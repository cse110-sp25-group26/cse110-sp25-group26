import { HandElement } from './HandElement.js';

/**
 * @classdesc UI component representing the Shop interface.
 * Manages the display and interaction of purchasable cards and packs.
 * 
 * @property {HTMLElement} shopContainer - The main container for the shop overlay
 * @property {HTMLElement} overlay - The full-screen overlay background
 * @property {HTMLElement} shopBox - The main shop interface box
 * @property {HTMLElement} cardRow - The container for purchasable joker cards
 */
export class ShopElement {
    /**
     * @class ShopElement
     * @param {HTMLElement} shopContainer - The DOM element that will contain the shop interface
     * @throws {Error} If shopContainer is not a valid HTMLElement
     */
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
        rerollBtn.onclick = () => this.rerollJokers();

        topRow.appendChild(nextBtn);
        topRow.appendChild(rerollBtn);

        // Middle row: cards
        this.cardRow = document.createElement("div");
        this.cardRow.className = "shop-card-row";

        // 초기 Joker 카드 생성
        this.createJokerCards();

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
        this.shopBox.appendChild(this.cardRow);
        this.shopBox.appendChild(packRow);
        this.overlay.appendChild(this.shopBox);
        this.shopContainer.appendChild(this.overlay);
    }

    /**
     * @function getRandomJokers
     * @description Selects random joker cards from the available pool
     * @param {string[]} jokerImages - Array of available joker image names
     * @param {number} count - Number of jokers to select
     * @returns {string[]} Array of selected joker names
     */
    getRandomJokers(jokerImages, count) {
        const shuffled = [...jokerImages].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    /**
     * @function show
     * @description Displays the shop interface with a fade-in animation
     * @public
     */
    show() {
        this.overlay.classList.remove("hide");
        setTimeout(() => this.overlay.classList.add("show"), 10);
    }

    /**
     * @function hide
     * @description Hides the shop interface with a fade-out animation
     * @public
     */
    hide() {
        this.overlay.classList.remove("show");
        setTimeout(() => this.overlay.classList.add("hide"), 450);
    }

    /**
     * @function purchaseJoker
     * @description Handles the purchase of a joker card
     * @param {HTMLElement} cardBox - The card box element that was clicked
     * @private
     */
    purchaseJoker(cardBox) {
        // Get the joker type from the card box
        const jokerType = cardBox.dataset.jokerType;
        
        // Create a new card element for the joker
        const jokerCard = document.createElement('card-element');
        jokerCard.setAttribute('suit', 'joker');
        jokerCard.setAttribute('type', jokerType);
        
        // Add the joker image
        const cardImg = document.createElement('img');
        cardImg.src = `/source/res/img/${jokerType}.png`;
        cardImg.alt = jokerType;
        cardImg.style.width = '100%';
        cardImg.style.height = '100%';
        jokerCard.appendChild(cardImg);
        
        // Get the jokers area and add the card
        const jokersArea = document.getElementById('jokers-area');
        if (jokersArea && jokersArea instanceof HandElement) {
            jokersArea.addCard(jokerCard);
            
            // Remove the card from the shop
            cardBox.remove();
            
            console.log(`Purchased joker: ${jokerType}`);
        } else {
            console.error('Jokers area not found or not a HandElement');
        }
    }

    /**
     * @function createJokerCards
     * @description Creates and displays the purchasable joker cards in the shop
     * @private
     */
    createJokerCards() {
        // 기존 카드 제거
        this.cardRow.innerHTML = '';

        // Get all joker images
        const jokerImages = [
            'card_joker_blue_print_beta',
            'card_joker_booster_rocket',
            'card_joker_card_counter',
            'card_joker_chain_lightning',
            'card_joker_chipmunk',
            'card_joker_club_basher',
            'card_joker_compound_interest',
            'card_joker_cool_head',
            'card_joker_danger_deck',
            'card_joker_dark_matter',
            'card_joker_diamond_miner',
            'card_joker_double_dare',
            'card_joker_eclipse',
            'card_joker_even_steven',
            'card_joker_glitch_king',
            'card_joker_groundhog',
            'card_joker_heart_collector',
            'card_joker_hit_man',
            'card_joker_horseshoe',
            'card_joker_immortal_king',
            'card_joker_juggler',
            'card_joker_lantern_bug',
            'card_joker_lucky_cat',
            'card_joker_lucky_loop',
            'card_joker_lucky_streaker',
            'card_joker_lucky_streamer',
            'card_joker_mirror_mask',
            'card_joker_noir_banker',
            'card_joker_pair_buddy',
            'card_joker_piggy_bank',
            'card_joker_pocket_guide',
            'card_joker_pulse_amplifier ',
            'card_joker_ripple_effect',
            'card_joker_royal_decree',
            'card_joker_schrödinger',
            'card_joker_shadow_dealer',
            'card_joker_snowballer',
            'card_joker_softie',
            'card_joker_solar_flare',
            'card_joker_spade_splicer',
            'card_joker_stick_shift',
            'card_joker_time_bomb',
            'card_joker_tip_jar',
            'card_joker_twenty-one-der',
            'card_joker_twist_of_fate',
            'card_joker_vortex_ring'
            ];

        // Select 3 random jokers
        const selectedJokers = this.getRandomJokers(jokerImages, 3);

        // Create card boxes for selected jokers
        selectedJokers.forEach((jokerName, index) => {
            const cardBox = document.createElement("div");
            cardBox.className = "shop-card-box";
            cardBox.dataset.jokerType = jokerName;

            // Price label
            const price = document.createElement("div");
            price.textContent = index === 0 ? "$2" : "$6";
            price.className = "shop-card-price";
            cardBox.appendChild(price);

            // Create card element for joker
            const cardElement = document.createElement('card-element');
            cardElement.setAttribute('suit', 'joker');
            cardElement.setAttribute('type', jokerName);
            
            // Set card image
            const cardImg = document.createElement('img');
            cardImg.src = `/source/res/img/${jokerName}.png`;
            cardImg.alt = jokerName;
            cardImg.style.width = '100%';
            cardImg.style.height = '100%';
            cardElement.appendChild(cardImg);

            cardBox.appendChild(cardElement);

            // Add click event listener for purchase
            cardBox.addEventListener('click', () => this.purchaseJoker(cardBox));

            this.cardRow.appendChild(cardBox);
        });
    }

    /**
     * @function rerollJokers
     * @description Refreshes the available joker cards in the shop
     * @public
     */
    rerollJokers() {
        console.log("Rerolling jokers...");
        this.createJokerCards();
    }
}   