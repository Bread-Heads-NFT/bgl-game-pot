import { UmiPlugin } from '@metaplex-foundation/umi';
import { createBglGamePotProgram } from './generated';

export const bglGamePot = (): UmiPlugin => ({
  install(umi) {
    umi.programs.add(createBglGamePotProgram(), false);
  },
});
