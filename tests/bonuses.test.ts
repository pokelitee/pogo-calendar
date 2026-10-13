import assert from 'node:assert/strict';
import test from 'node:test';
import { categorizeBonus } from '../src/utils/bonuses.ts';

// Real bonus text from leak-duck events.
const CASES: [string, string][] = [
  ['Increased chance of encountering Shiny Entei from Shadow Raids', 'shiny'],
  ['2× Stardust from Raid Battles', 'stardust'],
  ['GO Pass Deluxe: 3× Stardust for catching Pokémon', 'stardust'],
  ['2× XP from completed Max Battles', 'xp'],
  ['An additional 5,000 XP from Super Mega Raid Battles', 'xp'],
  ['1.5x Hatch Candy', 'candy'],
  ['3 additional Candy XL for catching Pokémon in five-star and Mega raids (Trainers level 31+)', 'candy'],
  ['1/4 Egg Hatch Distance', 'eggs'],
  ['Increased chance of 10 km Eggs from spinning PokéStops and Photo Discs at Gyms', 'eggs'],
  ['Remote Raid Pass limit increased to 20 from Friday, August 21, at 2:00 p.m. to Saturday, August 22, 2026, at 8:00 p.m. PDT', 'raids'],
  ['Increased friendship bonus damage dealt by Pokémon in raids', 'raids'],
  ['Mega-Evolved Pokémon will receive a CP boost', 'megaMax'],
  ['8× Max Particles from Power Spots', 'megaMax'],
  ['Battle (Team GO Rocket): Extra Mysterious Components from Team GO Rocket Grunts', 'rocket'],
  ['One additional Special Trade can be made for a maximum of three for the day*', 'trades'],
  ['Increased chance to become Lucky Friends', 'trades'],
  ['Hourly event-themed Field Research', 'research'],
  ['Four-hour Lure Modules (excluding Golden Lure Modules)', 'spawns'],
  ['3-hour Incense*', 'spawns'],
  ['Increased Spawns', 'spawns'],
  ['Pikachu will appear more frequently in the wild.', 'spawns'],
  ['Open up to 100 Gifts per day', 'gifts'],
  ['Hold 10 more Gifts in your Item Bag', 'gifts'],
  ['10 Great Balls', 'items'],
  ['Premier Balls have an increased catch rate', 'items'],
  ['Razz Berry ×5', 'items'],
  ['1 Star Piece', 'items'],
  ['Tiny Compass buddy souvenir', 'items'],
  ['Use a Charged TM to remove Frustration from Shadow Pokémon', 'rocket'],
  ['Eight-hour Party Play', 'other'],
];

test('categorizes real bonus text', () => {
  CASES.forEach(([bonus, category]) => assert.equal(categorizeBonus(bonus), category, bonus));
});
