/* eslint-disable import/no-extraneous-dependencies */
import { createUmi as basecreateUmi } from '@metaplex-foundation/umi-bundle-tests';
import { bglGamePot } from '../src';

export const createUmi = async () =>
  (await basecreateUmi()).use(bglGamePot());
