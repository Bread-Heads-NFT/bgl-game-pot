/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Account,
  Context,
  Pda,
  PublicKey,
  RpcAccount,
  RpcGetAccountOptions,
  RpcGetAccountsOptions,
  assertAccountExists,
  deserializeAccount,
  gpaBuilder,
  publicKey as toPublicKey,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  array,
  mapSerializer,
  publicKey as publicKeySerializer,
  string,
  struct,
  u64,
  u8,
} from '@metaplex-foundation/umi/serializers';
import { Key, KeyArgs, getKeySerializer } from '../types';

export type GamePot = Account<GamePotAccountData>;

export type GamePotAccountData = {
  key: Key;
  authority: PublicKey;
  tokenMint: PublicKey;
  bump: number;
  paymentAmount: bigint;
  feePercentage: number;
  allowlist: Array<PublicKey>;
};

export type GamePotAccountDataArgs = {
  authority: PublicKey;
  tokenMint: PublicKey;
  bump: number;
  paymentAmount: number | bigint;
  feePercentage: number;
  allowlist: Array<PublicKey>;
};

export function getGamePotAccountDataSerializer(): Serializer<
  GamePotAccountDataArgs,
  GamePotAccountData
> {
  return mapSerializer<GamePotAccountDataArgs, any, GamePotAccountData>(
    struct<GamePotAccountData>(
      [
        ['key', getKeySerializer()],
        ['authority', publicKeySerializer()],
        ['tokenMint', publicKeySerializer()],
        ['bump', u8()],
        ['paymentAmount', u64()],
        ['feePercentage', u8()],
        ['allowlist', array(publicKeySerializer())],
      ],
      { description: 'GamePotAccountData' }
    ),
    (value) => ({ ...value, key: Key.GamePot })
  ) as Serializer<GamePotAccountDataArgs, GamePotAccountData>;
}

export function deserializeGamePot(rawAccount: RpcAccount): GamePot {
  return deserializeAccount(rawAccount, getGamePotAccountDataSerializer());
}

export async function fetchGamePot(
  context: Pick<Context, 'rpc'>,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions
): Promise<GamePot> {
  const maybeAccount = await context.rpc.getAccount(
    toPublicKey(publicKey, false),
    options
  );
  assertAccountExists(maybeAccount, 'GamePot');
  return deserializeGamePot(maybeAccount);
}

export async function safeFetchGamePot(
  context: Pick<Context, 'rpc'>,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions
): Promise<GamePot | null> {
  const maybeAccount = await context.rpc.getAccount(
    toPublicKey(publicKey, false),
    options
  );
  return maybeAccount.exists ? deserializeGamePot(maybeAccount) : null;
}

export async function fetchAllGamePot(
  context: Pick<Context, 'rpc'>,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions
): Promise<GamePot[]> {
  const maybeAccounts = await context.rpc.getAccounts(
    publicKeys.map((key) => toPublicKey(key, false)),
    options
  );
  return maybeAccounts.map((maybeAccount) => {
    assertAccountExists(maybeAccount, 'GamePot');
    return deserializeGamePot(maybeAccount);
  });
}

export async function safeFetchAllGamePot(
  context: Pick<Context, 'rpc'>,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions
): Promise<GamePot[]> {
  const maybeAccounts = await context.rpc.getAccounts(
    publicKeys.map((key) => toPublicKey(key, false)),
    options
  );
  return maybeAccounts
    .filter((maybeAccount) => maybeAccount.exists)
    .map((maybeAccount) => deserializeGamePot(maybeAccount as RpcAccount));
}

export function getGamePotGpaBuilder(
  context: Pick<Context, 'rpc' | 'programs'>
) {
  const programId = context.programs.getPublicKey(
    'bglGamePot',
    'BHPoT3HQSWiPD8AczqvCbudyicPmE8RN8bpcyZLzMGmb'
  );
  return gpaBuilder(context, programId)
    .registerFields<{
      key: KeyArgs;
      authority: PublicKey;
      tokenMint: PublicKey;
      bump: number;
      paymentAmount: number | bigint;
      feePercentage: number;
      allowlist: Array<PublicKey>;
    }>({
      key: [0, getKeySerializer()],
      authority: [1, publicKeySerializer()],
      tokenMint: [33, publicKeySerializer()],
      bump: [65, u8()],
      paymentAmount: [66, u64()],
      feePercentage: [74, u8()],
      allowlist: [75, array(publicKeySerializer())],
    })
    .deserializeUsing<GamePot>((account) => deserializeGamePot(account))
    .whereField('key', Key.GamePot);
}

export function findGamePotPda(
  context: Pick<Context, 'eddsa' | 'programs'>,
  seeds: {
    /** The address of the game authority */
    gameAuthority: PublicKey;
    /** The address of the token mint */
    tokenMint: PublicKey;
  }
): Pda {
  const programId = context.programs.getPublicKey(
    'bglGamePot',
    'BHPoT3HQSWiPD8AczqvCbudyicPmE8RN8bpcyZLzMGmb'
  );
  return context.eddsa.findPda(programId, [
    string({ size: 'variable' }).serialize('pot'),
    publicKeySerializer().serialize(seeds.gameAuthority),
    publicKeySerializer().serialize(seeds.tokenMint),
  ]);
}

export async function fetchGamePotFromSeeds(
  context: Pick<Context, 'eddsa' | 'programs' | 'rpc'>,
  seeds: Parameters<typeof findGamePotPda>[1],
  options?: RpcGetAccountOptions
): Promise<GamePot> {
  return fetchGamePot(context, findGamePotPda(context, seeds), options);
}

export async function safeFetchGamePotFromSeeds(
  context: Pick<Context, 'eddsa' | 'programs' | 'rpc'>,
  seeds: Parameters<typeof findGamePotPda>[1],
  options?: RpcGetAccountOptions
): Promise<GamePot | null> {
  return safeFetchGamePot(context, findGamePotPda(context, seeds), options);
}
