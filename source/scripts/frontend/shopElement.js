import { HandElement } from './HandElement.js';
import { gameHandler } from '../backend/gameHandler.js';

/**
 * @classdesc UI component representing the Shop interface.
 * Manages the display and interaction of purchasable cards and packs.
 * 
 * @property {HTMLElement} shopContainer - The main container for the shop overlay
 * @property {HTMLElement} overlay - The full-screen overlay background
 * @property {HTMLElement} shopBox - The main shop interface box
 * @property {HTMLElement} cardRow - The container for purchasable joker cards
 * @property {gameHandler} gameHandler - Reference to the game handler for managing game state
 */
export class ShopElement {
    /**
     * @class ShopElement
     * @param {HTMLElement} shopContainer - The DOM element that will contain the shop interface
     * @param {gameHandler} gameHandler - The game handler instance for managing game state
     * @throws {Error} If shopContainer is not a valid HTMLElement
     */
    constructor(shopContainer, gameHandler) {
        if (!(shopContainer instanceof HTMLElement)) {
            console.error("Invalid shop container provided.");
            return null;
        }
        this.shopContainer = shopContainer;
        this.gameHandler = gameHandler;
        

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

        // initial joker card constructor
        this.createJokerCards();

        // Bottom row: packs
        const packRow = this.createPackCards(); // 
        this.shopBox.appendChild(packRow);


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
        const price = parseInt(cardBox.dataset.price);
        
        // Check remaining money
        if (this.gameHandler.state.money < price) {
            console.log("Not enough money to purchase this joker");
            // TODO: UI for not enough money
            return;
        }

        // money decrease
        this.gameHandler.state.money -= price;
        console.log(`Money remaining: $${this.gameHandler.state.money}`);

        const jokerType = cardBox.dataset.jokerType;
        
        const jokerCard = document.createElement('card-element');
        jokerCard.setAttribute('suit', 'joker');
        jokerCard.setAttribute('type', jokerType);
        
        const cardImg = document.createElement('img');
        cardImg.src = `/source/res/img/${jokerType}.png`;
        cardImg.alt = jokerType;
        cardImg.style.width = '100%';
        cardImg.style.height = '100%';
        jokerCard.appendChild(cardImg);
        
        const jokersArea = document.getElementById('jokers-area');
        if (jokersArea && jokersArea instanceof HandElement) {
            jokersArea.addCard(jokerCard);
            cardBox.remove();
            console.log(`Purchased joker: ${jokerType} for $${price}`);
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

        selectedJokers.forEach((jokerName, index) => {
            const cardBox = document.createElement("div");
            cardBox.className = "shop-card-box";
            cardBox.dataset.jokerType = jokerName;
            if(index === 0) {cardBox.dataset.price = "2"}
            if(index === 1) {cardBox.dataset.price = "4"}
            if(index === 2) {cardBox.dataset.price = "6"}

            const price = document.createElement("div");
            price.textContent = `$${cardBox.dataset.price}`;
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
        const rerollCost = 5;
        
        // Check if we have enough money
        if (this.gameHandler.state.money < rerollCost) {
            console.log("Not enough money to reroll");
            // UI for not enough money
            return;
        }

        // decrease money
        this.gameHandler.state.money -= rerollCost;
        console.log(`Money remaining: $${this.gameHandler.state.money}`);

        console.log("Rerolling jokers...");
        this.createJokerCards();
    }

    /**
     * @function purchaseConsumable
     * @description Handles the purchase of a consumable card.
     * @param {HTMLElement} packBox - The pack box element that was clicked
     * @private
     */
    purchaseConsumable(packBox) {
        const price = parseInt(packBox.dataset.price);

        if (this.gameHandler.state.money < price) {
            console.log("Not enough money to purchase this pack.");
            return;
        }

        this.gameHandler.state.money -= price;
        console.log(`Money remaining: $${this.gameHandler.state.money}`);

        const packType = packBox.dataset.packType;

        // Create card element
        const card = document.createElement('card-element');
        card.setAttribute('suit', 'consumable');
        card.setAttribute('type', packType);

        const cardImg = document.createElement('img');
        cardImg.src = `/source/res/img/${packType}.png`;
        cardImg.alt = packType;
        cardImg.style.width = '100%';
        cardImg.style.height = '100%';
        card.appendChild(cardImg);

        // Add to consumables area
        const consumablesArea = document.getElementById('consumables-area');
        if (consumablesArea && consumablesArea instanceof HandElement) {
            consumablesArea.addCard(card);
            packBox.remove();
            console.log(`Purchased pack: ${packType} for $${price}`);
        } else {
            console.error('Consumables area not found or not a HandElement');
        }
    }
    createPackCards() {
        const packRow = document.createElement("div"); // 
        packRow.className = "shop-pack-row";
    
        const packTypes = ['voucher_pack', 'buffoon_pack', 'celestial_pack'];
    
        packTypes.forEach((packType, i) => {
            const packBox = document.createElement("div");
            packBox.className = "shop-pack-box";
            packBox.dataset.packType = packType;
            packBox.dataset.price = i === 0 ? "10" : (i === 1 ? "4" : "6");
    
            const price = document.createElement("div");
            price.textContent = `$${packBox.dataset.price}`;
            price.className = "shop-pack-price";
            packBox.appendChild(price);
    
            const label = document.createElement("div");
            label.textContent = packType.replace('_', ' ').toUpperCase();
            label.className = "shop-pack-label";
            packBox.appendChild(label);
    
            const cardElement = document.createElement('card-element');
            cardElement.setAttribute('suit', 'consumable');
            cardElement.setAttribute('type', packType);
    
            const cardImg = document.createElement('img');
            cardImg.src = `/source/res/img/${packType}.png`;
            cardImg.alt = packType;
            cardImg.style.width = '100%';
            cardImg.style.height = '100%';
            cardElement.appendChild(cardImg);
    
            packBox.appendChild(cardElement);
    
            packBox.addEventListener('click', () => this.purchaseConsumable(packBox));
            packRow.appendChild(packBox);
        });
    
        return packRow; // 
    }
    
}   