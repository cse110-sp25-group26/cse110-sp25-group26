/**
 * This function takes two numbers as arguments and returns their sum.
 * @param {number} num1 - The first number to add.
 * @param {number} num2 - The second number to add.
 * 
 * @return {number} The sum of the two numbers.
 * 
 * 
 * @example
 * addNumbers(2, 3); // returns 5
 * 
 * @example
 * addNumbers(-1, 1); // returns 0
 * 
 * @example
 * addNumbers('2', 3); // returns 5
 */
export function addNumbers(num1, num2) {
    // Convert arguments to numbers if they are strings
    if (typeof num1 === 'string') {
        num1 = parseFloat(num1);
    }
    if (typeof num2 === 'string') {
        num2 = parseFloat(num2);
    }

    return num1 + num2;
}