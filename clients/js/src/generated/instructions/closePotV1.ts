/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Context,
  Pda,
  PublicKey,
  Signer,
  TransactionBuilder,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  mapSerializer,
  struct,
  u8,
} from '@metaplex-foundation/umi/serializers';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  getAccountMetasAndSigners,
} from '../shared';

// Accounts.
export type ClosePotV1InstructionAccounts = {
  /** The address of the game pot */
  pot: PublicKey | Pda;
  /** The authority of the game pot */
  gameAuthority: Signer;
};

// Data.
export type ClosePotV1InstructionData = { discriminator: number };

export type ClosePotV1InstructionDataArgs = {};

export function getClosePotV1InstructionDataSerializer(): Serializer<
  ClosePotV1InstructionDataArgs,
  ClosePotV1InstructionData
> {
  return mapSerializer<
    ClosePotV1InstructionDataArgs,
    any,
    ClosePotV1InstructionData
  >(
    struct<ClosePotV1InstructionData>([['discriminator', u8()]], {
      description: 'ClosePotV1InstructionData',
    }),
    (value) => ({ ...value, discriminator: 1 })
  ) as Serializer<ClosePotV1InstructionDataArgs, ClosePotV1InstructionData>;
}

// Instruction.
export function closePotV1(
  context: Pick<Context, 'programs'>,
  input: ClosePotV1InstructionAccounts
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'bglGamePot',
    'BHPoT3HQSWiPD8AczqvCbudyicPmE8RN8bpcyZLzMGmb'
  );

  // Accounts.
  const resolvedAccounts = {
    pot: { index: 0, isWritable: true as boolean, value: input.pot ?? null },
    gameAuthority: {
      index: 1,
      isWritable: true as boolean,
      value: input.gameAuthority ?? null,
    },
  } satisfies ResolvedAccountsWithIndices;

  // Accounts in order.
  const orderedAccounts: ResolvedAccount[] = Object.values(
    resolvedAccounts
  ).sort((a, b) => a.index - b.index);

  // Keys and Signers.
  const [keys, signers] = getAccountMetasAndSigners(
    orderedAccounts,
    'programId',
    programId
  );

  // Data.
  const data = getClosePotV1InstructionDataSerializer().serialize({});

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}