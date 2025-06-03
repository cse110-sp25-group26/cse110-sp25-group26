/**
 * @description Unit tests for the GameStorage class.
 */

import { GameStorage } from '../../backend/GameStorage.js';
import { Card } from '../../backend/Card.js';
import { Hand } from '../../backend/Hand.js';
import { Deck } from '../../backend/Deck.js';
import { jest } from '@jest/globals';

global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

// Reset localStorage before each test
beforeEach(() => {
	localStorage.clear();
});

describe('GameStorage', () => {
	test('constructor initializes storage if missing', () => {
		expect(localStorage.getItem('gameData')).toBeNull();
		const storage = new GameStorage();
		expect(localStorage.getItem('gameData')).not.toBeNull();
	});

	test('readFromStorage returns parsed object', () => {
		const storage = new GameStorage();
		const data = storage.readFromStorage();
		expect(data).toHaveProperty('lifetimeStats');
		expect(data).toHaveProperty('saves');
	});

	test('writeToStorage correctly writes data', () => {
		const storage = new GameStorage();
		const mock = { test: true };
		storage.writeToStorage(mock);
		expect(JSON.parse(localStorage.getItem('gameData'))).toEqual(mock);
	});

	test('addSave appends a new save', () => {
		const storage = new GameStorage();
		expect(storage.getAllSaves()).toHaveLength(0);

		const save = {
			hands: { main: [], played: [], joker: [], consumable: [] },
			deck: {},
			gameState: {}
		};

		storage.addSave(save);
		const saves = storage.getAllSaves();
		expect(saves).toHaveLength(1);
		expect(saves[0]).toEqual(save);
	});

	test('overwriteSave replaces save at given index', () => {
		const storage = new GameStorage();
		const save1 = { hands: {}, deck: {}, gameState: { tag: 'original' } };
		const save2 = { hands: {}, deck: {}, gameState: { tag: 'updated' } };

		storage.addSave(save1);
		const result = storage.overwriteSave(0, save2);
		expect(result).toBe(true);
		expect(storage.getAllSaves()[0]).toEqual(save2);
	});

	test('overwriteSave fails for invalid index', () => {
		const storage = new GameStorage();
		expect(storage.overwriteSave(5, {})).toBe(false);
	});

	test('deleteSave removes a save at given index', () => {
		const storage = new GameStorage();
		const save = { hands: {}, deck: {}, gameState: {} };

		storage.addSave(save);
		expect(storage.getAllSaves()).toHaveLength(1);
		storage.deleteSave(0);
		expect(storage.getAllSaves()).toHaveLength(0);
	});

	test('deleteSave fails for invalid index', () => {
		const storage = new GameStorage();
		expect(storage.deleteSave(99)).toBe(false);
	});

	test('getStats returns correct lifetime stats', () => {
		const storage = new GameStorage();
		const stats = storage.getStats();
		expect(stats).toHaveProperty('gamesStarted');
		expect(stats.gamesStarted).toBe(0);
	});

	test('updateStat increases stat value correctly', () => {
		const storage = new GameStorage();
		storage.updateStat('gamesStarted');
		storage.updateStat('gamesStarted');
		const stats = storage.getStats();
		expect(stats.gamesStarted).toBe(2);
	});

	test('updateStat initializes undefined stat keys', () => {
		const storage = new GameStorage();
		storage.updateStat('newCustomStat');
		const stats = storage.getStats();
		expect(stats.newCustomStat).toBe(1);
	});
});
