import {
    Hand
} from '../../source/scripts/backend/Hand.js';

import {
    Card
} from '../../source/scripts/backend/Card.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Hand_ui.js loaded and DOMContentLoaded fired");

    const handContainer =
        document.getElementById('hand-container');

    if (
        !handContainer
    ) {

        console.error(
            'Hand container not found'
        );

        return;
    }

    let HAND_WIDTH =
        handContainer.offsetWidth;

    const hand =
        new Hand();

    const cardElements =
        new Map();

    function createCardElement(card) {

        const cardElement =
            document.createElement(
                'div'
            );

        cardElement.className =
            'card';

        cardElement.dataset.suit =
            card.suit;

        cardElement.dataset.type =
            card.type;

        cardElement.textContent =
            `${card.type} of ${card.suit}`;

        cardElement.addEventListener(
            'click',
            () => {

                const index =
                    hand.cards.indexOf(
                        card
                    );

                hand.selectCard(
                    index
                );

                updateCardDisplay();
            }
        );

        return cardElement;
    }

    function updateCardDisplay() {

        console.log(
            'Updating card display, cards:',
            hand.cards
        );

        handContainer.innerHTML =
            '';

        cardElements.clear();

        hand.cards.forEach(
            card => {

                const cardElement =
                    createCardElement(
                        card
                    );

                cardElements.set(
                    card,
                    cardElement
                );

                handContainer.appendChild(
                    cardElement
                );
            }
        );

        const cardWidth =
            cardElements.size > 0
                ? cardElements
                    .values()
                    .next()
                    .value
                    .offsetWidth
                : 0;

        const totalCardsWidth =
            cardWidth *
            hand.cards.length;

        if (
            totalCardsWidth <= HAND_WIDTH
        ) {

            let offset =
                0;

            hand.cards.forEach(
                (card, index) => {

                    const cardElement =
                        cardElements.get(
                            card
                        );

                    cardElement.style.position =
                        'absolute';

                    cardElement.style.left =
                        `${offset}px`;

                    cardElement.style.zIndex =
                        card.isSelected
                            ? '2'
                            : '1';

                    cardElement.style.transform =
                        card.isSelected
                            ? 'translateY(-10px)'
                            : 'translateY(0)';

                    offset +=
                        cardWidth;
                }
            );

        } else {

            const overlap =
                (
                    totalCardsWidth -
                    HAND_WIDTH
                ) /
                (
                    hand.cards.length - 1
                );

            hand.cards.forEach(
                (card, index) => {

                    const cardElement =
                        cardElements.get(
                            card
                        );

                    cardElement.style.position =
                        'absolute';

                    cardElement.style.left =
                        `${
                            index *
                            (
                                cardWidth - overlap
                            )
                        }px`;

                    cardElement.style.zIndex =
                        card.isSelected
                            ? '2'
                            : '1';

                    cardElement.style.transform =
                        card.isSelected
                            ? 'translateY(-10px)'
                            : 'translateY(0)';
                }
            );
        }
    }

    function addCardToHand(
        suit,
        type
    ) {

        const card =
            new Card(
                suit,
                type
            );

        hand.addCard(
            card
        );

        updateCardDisplay();
    }

    function removeCardFromHand(
        index
    ) {

        hand.removeCard(
            index
        );

        updateCardDisplay();
    }

    const addCardButton =
        document.getElementById(
            'add-card-button'
        );

    const removeCardButton =
        document.getElementById(
            'remove-card-button'
        );

    if (
        addCardButton
    ) {

        addCardButton.addEventListener(
            'click',
            () => {

                addCardToHand(
                    'hearts',
                    'A'
                );
            }
        );

    } else {

        console.error(
            'Add card button not found'
        );
    }

    if (
        removeCardButton
    ) {

        removeCardButton.addEventListener(
            'click',
            () => {
                // Find the selected card
                const selectedIndex = hand.cards.findIndex(card => card.isSelected);
                if (selectedIndex !== -1) {
                    removeCardFromHand(selectedIndex);
                }
            }
        );

    } else {

        console.error(
            'Remove card button not found'
        );
    }

    addCardToHand(
        'hearts',
        'A'
    );

    addCardToHand(
        'clubs',
        'K'
    );

    addCardToHand(
        'spades',
        '2'
    );

    addCardToHand(
        'diamonds',
        '10'
    );
    addCardToHand(
        'hearts',
        'A'
    );

    addCardToHand(
        'clubs',
        'K'
    );

    addCardToHand(
        'spades',
        '2'
    );

    addCardToHand(
        'diamonds',
        '10'
    );
    addCardToHand(
        'hearts',
        'A'
    );

    addCardToHand(
        'clubs',
        'K'
    );

    addCardToHand(
        'spades',
        '2'
    );

    addCardToHand(
        'diamonds',
        '10'
    );
});
