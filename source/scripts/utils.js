/**
 * @function calculateBlackjackScore
 * @description Calculates the Blackjack score from an array of cards.
 * @param {Card[]} cards - An array of Card objects.
 * @returns {number} The calculated score.
 */
export function calculateBlackjackScore(cards) {
    let score = 0;
    let aces = 0;

    // First pass: Sum all cards, counting Aces as 11
    for (const card of cards) {
        if (card.suit === 'joker' || card.suit === 'consumable') {
            // Skip jokers and consumables
            continue;
        }

        if (card.type === 'A') {
            aces++;
            score += 11; // Count Ace as 11 initially
        } else if (['K', 'Q', 'J'].includes(card.type)) {
            score += 10; // Face cards are worth 10
        } else {
            score += parseInt(card.type, 10); // Number cards are worth their value
        }
    }

    // Second pass: Adjust for Aces if score exceeds 21
    while (score > 21 && aces > 0) {
        score -= 10; // Count Ace as 1 instead of 11
        aces--;
    }

    return score;
}

/**
 * @function staggered
 * @description Executes a function on array items with staggered timing.
 * @param {Array} array - The array of items to process.
 * @param {Function} fn - The function to execute on each item.
 * @param {number} [delay=0] - The delay in milliseconds between each function call.
 * @returns {Promise} A promise that resolves when all items have been processed.
 */
export function staggered(array, fn, delay = 0) {
    return new Promise((resolve) => {
        let index = 0;

        const interval = setInterval(() => {
            if (index < array.length) {
                fn(array[index]);
                index++;
            } else {
                clearInterval(interval);
                resolve();
            }
        }, delay);
    });
}