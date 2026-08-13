export type UnitType = 'Miner' | 'Swordsman' | 'Archer' | 'Spearman' | 'Knight' | 'Mage' | 'Giant' | 'Healer';
export type Team = 'player' | 'enemy';
export type UnitState = 'idle' | 'marching' | 'attacking' | 'dying' | 'dead';
export type Phase = 'idle' | 'prep' | 'battle' | 'transition' | 'gameover';
export type Mode = 'ai' | 'pvp';

export interface UnitDef {
  cost: number;
  hp: number;
  dmg: number;
  range: number;
  speed: number;
  atkCd: number;
  income: number;
  label: string;
  desc: string;
}

export interface Unit {
  type: UnitType;
  team: Team;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  dmg: number;
  range: number;
  speed: number;
  atkCd: number;
  income: number;
  scale: number;
  state: UnitState;
  atkTimer: number;
  target: Unit | null;
  dir: number;
  wanderPhase: number;
  animTime: number;
  deathTimer: number;
  attackAnim: number;
  isGiant: boolean;
  isHealer: boolean;
  isMiner: boolean;
  isRanged: boolean;
  formationX: number;
  formationY: number;
  killCount: number;
  splash: boolean;
  healPower: number;
}

export interface Projectile {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  life: number;
  source: Unit;
  type: 'arrow' | 'magic';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface PlayerState {
  gold: number;
  income: number;
  units: Unit[];
}

export interface GameState {
  mode: Mode;
  phase: Phase;
  wave: number;
  prepTime: number;
  prepTimer: number;
  battleTimer: number;
  transitionTimer: number;
  time: number;
  player: PlayerState;
  enemy: PlayerState;
  projectiles: Projectile[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  pvpRound: number;
  pvpMaxRounds: number;
  pvpScore: { p1: number; p2: number };
  pvpArmySnapshot: { player: Unit[]; enemy: Unit[] };
  _aiTimer?: number;
  _lastTime?: number;
}
