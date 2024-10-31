/* eslint-disable import/no-extraneous-dependencies */
import { createUmi as basecreateUmi } from '@metaplex-foundation/umi-bundle-tests';
import { bglGamePot } from '../src';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';

export const createUmi = async () =>
  (await basecreateUmi()).use(bglGamePot()).use(mplTokenMetadata());
