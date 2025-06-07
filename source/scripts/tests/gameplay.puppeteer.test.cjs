// This file is now gameplay.puppeteer.test.cjs
// Content remains the same as the minimal puppeteer script with logging
console.log('[TEST SCRIPT] Execution started.');

let puppeteer;
try {
    console.log('[TEST SCRIPT] Attempting to require Puppeteer...');
    puppeteer = require('puppeteer');
    console.log('[TEST SCRIPT] Puppeteer required successfully.');
} catch (e) {
    console.error('[TEST SCRIPT] Failed to require Puppeteer:', e);
    process.exit(1);
}

const path = require('path');

(async () => {
    console.log('[TEST SCRIPT] Async function started.');
    let browser = null;
    let testPassed = false;
    // Path to gameplay.html relative to this script's location (source/scripts/tests/ -> source/)
    const GAME_URL = `file://${path.join(__dirname, '../../gameplay.html')}`;

    try {
        console.log('[TEST SCRIPT] Attempting to launch Puppeteer browser...');
        browser = await puppeteer.launch({
            headless: false, // Keep false to visually inspect
            args: [
                '--disable-web-security',
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ],
            dumpio: true, // Keep for verbose logging from Chromium
            // slowMo: 100, // Uncomment for slower operations
        });
        console.log('[TEST SCRIPT] Puppeteer browser launched.');

        const page = await browser.newPage();
        console.log('[TEST SCRIPT] New page created.');

        // Setup console message promise BEFORE navigating
        const domReadyPromise = new Promise((resolve, reject) => {
            page.on('console', msg => {
                const type = msg.type().toUpperCase();
                const text = msg.text();
                if (type === 'ERROR' || type === 'WARNING') {
                    console.log(`[BROWSER ${type}]: ${text}`);
                } else if (text.length > 100) {
                    console.log(`[BROWSER ${type.substring(0,3)}]: ${text.substring(0,97)}...`);
                } else {
                    console.log(`[BROWSER ${type.substring(0,3)}]: ${text}`);
                }
                // Resolve the promise if the specific message is found
                if (text === 'GameManager DOM elements initialized.') {
                    resolve();
                }
            });
            setTimeout(() => {
                reject(new Error('Timeout waiting for "GameManager DOM elements initialized." console message'));
            }, 15000);
        });

        page.on('pageerror', ({ message }) => { 
            console.error(`[BROWSER PAGEERROR]: ${message}`);
        });

        console.log(`[TEST SCRIPT] Navigating to ${GAME_URL}`);
        await page.goto(GAME_URL, { waitUntil: 'networkidle0' });
        
        console.log('[TEST SCRIPT] Waiting for GameManager to signal DOM elements are initialized...');
        await domReadyPromise;
        console.log('[TEST SCRIPT] GameManager DOM elements reported as initialized.');

        // Test: should deal a card to player hand when deck is clicked
        console.log('[TEST SCRIPT] Running test: Deal card on deck click');
        const deckSelector = '#deck';
        const playerHandHostSelector = '#player-hand-cards'; // Selector for the <hand-element>

        await page.waitForSelector(deckSelector, { visible: true });
        console.log('[TEST SCRIPT] Deck is visible.');

        // Get initial number of cards in hand (from shadow DOM)
        const initialCardsInHand = await page.$eval(playerHandHostSelector, handElement => {
            return handElement.shadowRoot.querySelectorAll('.hand > card-element').length;
        });
        console.log(`[TEST SCRIPT] Initial cards in hand: ${initialCardsInHand}`);

        console.log('[TEST SCRIPT] Clicking deck...');
        await page.click(deckSelector);
        console.log('[TEST SCRIPT] Clicked deck.');

        console.log('[TEST SCRIPT] Waiting for card to be added to hand (in shadow DOM)...');
        await page.waitForFunction(
            (hostSelector, initialCount) => {
                const handElement = document.querySelector(hostSelector);
                if (!handElement || !handElement.shadowRoot) return false;
                return handElement.shadowRoot.querySelectorAll('.hand > card-element').length > initialCount;
            },
            { timeout: 7000 }, // Increased timeout slightly just in case of slower rendering
            playerHandHostSelector,
            initialCardsInHand
        );
        console.log('[TEST SCRIPT] Card added to hand (in shadow DOM).');

        // Verify a card has been added to the player's hand (in shadow DOM)
        const cardsInHandAfterDeal = await page.$eval(playerHandHostSelector, handElement => {
            return handElement.shadowRoot.querySelectorAll('.hand > card-element').length;
        });
        console.log(`[TEST SCRIPT] Cards in hand after deal: ${cardsInHandAfterDeal}`);

        if (cardsInHandAfterDeal > initialCardsInHand) {
            console.log('[TEST SCRIPT] TEST PASSED: Card was dealt to hand.');
            testPassed = true;
            console.log('[TEST SCRIPT] Pausing for 5 seconds for visual inspection...');
            await new Promise(r => setTimeout(r, 5000)); // Correct way to pause
        } else {
            console.error('[TEST SCRIPT] TEST FAILED: Card was not dealt to hand. No new card appeared in shadow DOM.');
            await new Promise(r => setTimeout(r, 2000)); // Correct way to pause
        }

    } catch (error) {
        console.error('[TEST SCRIPT] Error during Puppeteer test execution:', error);
    } finally {
        if (browser) {
            console.log('[TEST SCRIPT] Attempting to close browser (finally block)...');
            await browser.close();
            console.log('[TEST SCRIPT] Browser closed (finally block).');
        }
        if (testPassed) {
            console.log('[TEST SCRIPT] Test script finished with PASSED status.');
            process.exit(0);
        } else {
            console.error('[TEST SCRIPT] Test script finished with FAILED status.');
            process.exit(1);
        }
    }
})(); 