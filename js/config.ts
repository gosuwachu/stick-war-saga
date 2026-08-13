import type { GameState, UnitDef, UnitType } from './types';

export function createGameState(overrides?: Partial<GameState>): GameState {
  const state: GameState = {
    mode: 'ai', phase: 'idle', wave: 1,
    prepTime: 25, prepTimer: 25, battleTimer: 0, transitionTimer: 0, time: 0,
    player: { gold: 400, income: 0, units: [] },
    enemy:  { gold: 200, income: 0, units: [] },
    projectiles: [], particles: [], floatingTexts: [],
    pvpRound: 1, pvpMaxRounds: 5, pvpScore: { p1: 0, p2: 0 }, pvpArmySnapshot: { player: [], enemy: [] },
  };
  if (overrides) Object.assign(state, overrides);
  return state;
}

export const UNIT_TYPES: Record<UnitType, UnitDef> = {
  Miner:    { cost: 80,  hp: 40,  dmg: 4,  range: 25, speed: 50, atkCd: 1.0, income: 3, label: 'Miner',    desc: '+3g/s income' },
  Swordsman:{ cost: 100, hp: 100, dmg: 14, range: 30, speed: 55, atkCd: 0.8, income: 0, label: 'Swordsman', desc: 'Balanced melee' },
  Archer:   { cost: 140, hp: 55,  dmg: 10, range: 220, speed: 45, atkCd: 1.0, income: 0, label: 'Archer',   desc: 'Ranged attacker' },
  Spearman: { cost: 120, hp: 120, dmg: 12, range: 40, speed: 50, atkCd: 0.9, income: 0, label: 'Spearman',  desc: 'Tough melee' },
  Knight:   { cost: 200, hp: 140, dmg: 20, range: 30, speed: 75, atkCd: 0.7, income: 0, label: 'Knight',    desc: 'Fast & strong' },
  Mage:     { cost: 240, hp: 45,  dmg: 22, range: 200, speed: 40, atkCd: 1.2, income: 0, label: 'Mage',      desc: 'AoE damage' },
  Giant:    { cost: 400, hp: 400, dmg: 35, range: 40, speed: 30, atkCd: 1.0, income: 0, label: 'Giant',     desc: 'Massive & tough' },
  Healer:   { cost: 180, hp: 60,  dmg: 0,  range: 160, speed: 45, atkCd: 2.0, income: 0, label: 'Healer',    desc: 'Heals allies' },
};

export const UNIT_ORDER: UnitType[] = ['Miner','Swordsman','Archer','Spearman','Knight','Mage','Giant','Healer'];

export const P1_KEYS: Record<string, UnitType> = { '1':'Miner', 'q':'Swordsman', 'a':'Archer', 'z':'Spearman', 'x':'Knight', 's':'Mage', 'w':'Giant', '2':'Healer' };
export const P2_KEYS: Record<string, UnitType> = { '=':'Miner', '[':'Swordsman', ';':'Archer', '.':'Spearman', ',':'Knight', 'l':'Mage', 'p':'Giant', '-':'Healer' };
export const KEY_NAMES: Record<string, string> = { '1':'1','q':'Q','a':'A','z':'Z','x':'X','s':'S','w':'W','2':'2', '=':'=', '[':'[', ';':';', '.':'.', ',':',', 'l':'L', 'p':'P', '-':'-' };

export function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }

export function dist(a: { x: number; y: number }, b: { x: number; y: number }): number { return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2); }

export function rand(min: number, max: number): number { return Math.random() * (max - min) + min; }

export function randInt(min: number, max: number): number { return Math.floor(rand(min, max+1)); }

export function clamp(v: number, min: number, max: number): number { return Math.max(min, Math.min(max, v)); }
