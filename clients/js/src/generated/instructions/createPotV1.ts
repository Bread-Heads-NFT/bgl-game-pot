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
  u64,
  u8,
} from '@metaplex-foundation/umi/serializers';
import { findGamePotPda } from '../accounts';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  expectPublicKey,
  getAccountMetasAndSigners,
} from '../shared';

// Accounts.
export type CreatePotV1InstructionAccounts = {
  /** The address of the new game pot */
  pot?: PublicKey | Pda;
  /** The authority of the game pot */
  gameAuthority: Signer;
  /** The address of the token mint */
  tokenMint: PublicKey | Pda;
  /** The system program */
  systemProgram?: PublicKey | Pda;
};

// Data.
export type CreatePotV1InstructionData = {
  discriminator: number;
  paymentAmount: bigint;
  feePercentage: number;
};

export type CreatePotV1InstructionDataArgs = {
  paymentAmount: number | bigint;
  feePercentage: number;
};

export function getCreatePotV1InstructionDataSerializer(): Serializer<
  CreatePotV1InstructionDataArgs,
  CreatePotV1InstructionData
> {
  return mapSerializer<
    CreatePotV1InstructionDataArgs,
    any,
    CreatePotV1InstructionData
  >(
    struct<CreatePotV1InstructionData>(
      [
        ['discriminator', u8()],
        ['paymentAmount', u64()],
        ['feePercentage', u8()],
      ],
      { description: 'CreatePotV1InstructionData' }
    ),
    (value) => ({ ...value, discriminator: 0 })
  ) as Serializer<CreatePotV1InstructionDataArgs, CreatePotV1InstructionData>;
}

// Args.
export type CreatePotV1InstructionArgs = CreatePotV1InstructionDataArgs;

// Instruction.
export function createPotV1(
  context: Pick<Context, 'eddsa' | 'programs'>,
  input: CreatePotV1InstructionAccounts & CreatePotV1InstructionArgs
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
    tokenMint: {
      index: 2,
      isWritable: false as boolean,
      value: input.tokenMint ?? null,
    },
    systemProgram: {
      index: 3,
      isWritable: false as boolean,
      value: input.systemProgram ?? null,
    },
  } satisfies ResolvedAccountsWithIndices;

  // Arguments.
  const resolvedArgs: CreatePotV1InstructionArgs = { ...input };

  // Default values.
  if (!resolvedAccounts.pot.value) {
    resolvedAccounts.pot.value = findGamePotPda(context, {
      gameAuthority: expectPublicKey(resolvedAccounts.gameAuthority.value),
      tokenMint: expectPublicKey(resolvedAccounts.tokenMint.value),
    });
  }
  if (!resolvedAccounts.systemProgram.value) {
    resolvedAccounts.systemProgram.value = context.programs.getPublicKey(
      'splSystem',
      '11111111111111111111111111111111'
    );
    resolvedAccounts.systemProgram.isWritable = false;
  }

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
  const data = getCreatePotV1InstructionDataSerializer().serialize(
    resolvedArgs as CreatePotV1InstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}