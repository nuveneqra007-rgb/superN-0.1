// =============================================================
// BotInstance.ts — Instancia encapsulada de Bot / Combatiente
// Usado para escalabilidad a múltiples bots (FASE C, D, E)
// =============================================================

import { BotFaction, BotSlotConfig } from './BotData';
import { BotFSMData } from './BotFSM';
import { GrenadeInventory } from './GrenadeSystem';
import { PlayerController } from './PlayerController';
import { PlayerState } from './PlayerState';

export interface BotInstance {
  id: number;
  slot: number;
  slotConfig?: BotSlotConfig;
  faction: BotFaction;
  state: PlayerState;
  ai: BotFSMData;
  grenades: GrenadeInventory;
  controller?: PlayerController;
  quiet: boolean;
  color: string;
  score: number;
}
