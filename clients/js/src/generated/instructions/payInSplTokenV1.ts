/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { findAssociatedTokenPda } from '@metaplex-foundation/mpl-toolbox';
import {
  Context,
  Pda,
  PublicKey,
  Signer,
  TransactionBuilder,
  publicKey,
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
  expectPublicKey,
  getAccountMetasAndSigners,
} from '../shared';

// Accounts.
export type PayInSplTokenV1InstructionAccounts = {
  /** The address of the game pot */
  pot: PublicKey | Pda;
  /** The participant */
  participant: Signer;
  /** The address of the token mint */
  tokenMint: PublicKey | Pda;
  /** The source token account */
  participantTokenAccount?: PublicKey | Pda;
  /** The destination token account */
  potTokenAccount?: PublicKey | Pda;
  /** The token program */
  tokenProgram?: PublicKey | Pda;
  /** The associated token program */
  associatedTokenProgram?: PublicKey | Pda;
  /** The system program */
  systemProgram?: PublicKey | Pda;
};

// Data.
export type PayInSplTokenV1InstructionData = { discriminator: number };

export type PayInSplTokenV1InstructionDataArgs = {};

export function getPayInSplTokenV1InstructionDataSerializer(): Serializer<
  PayInSplTokenV1InstructionDataArgs,
  PayInSplTokenV1InstructionData
> {
  return mapSerializer<
    PayInSplTokenV1InstructionDataArgs,
    any,
    PayInSplTokenV1InstructionData
  >(
    struct<PayInSplTokenV1InstructionData>([['discriminator', u8()]], {
      description: 'PayInSplTokenV1InstructionData',
    }),
    (value) => ({ ...value, discriminator: 5 })
  ) as Serializer<
    PayInSplTokenV1InstructionDataArgs,
    PayInSplTokenV1InstructionData
  >;
}

// Instruction.
export function payInSplTokenV1(
  context: Pick<Context, 'eddsa' | 'programs'>,
  input: PayInSplTokenV1InstructionAccounts
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'bglGamePot',
    'BHPoT3HQSWiPD8AczqvCbudyicPmE8RN8bpcyZLzMGmb'
  );

  // Accounts.
  const resolvedAccounts = {
    pot: { index: 0, isWritable: true as boolean, value: input.pot ?? null },
    participant: {
      index: 1,
      isWritable: true as boolean,
      value: input.participant ?? null,
    },
    tokenMint: {
      index: 2,
      isWritable: false as boolean,
      value: input.tokenMint ?? null,
    },
    participantTokenAccount: {
      index: 3,
      isWritable: true as boolean,
      value: input.participantTokenAccount ?? null,
    },
    potTokenAccount: {
      index: 4,
      isWritable: true as boolean,
      value: input.potTokenAccount ?? null,
    },
    tokenProgram: {
      index: 5,
      isWritable: false as boolean,
      value: input.tokenProgram ?? null,
    },
    associatedTokenProgram: {
      index: 6,
      isWritable: false as boolean,
      value: input.associatedTokenProgram ?? null,
    },
    systemProgram: {
      index: 7,
      isWritable: false as boolean,
      value: input.systemProgram ?? null,
    },
  } satisfies ResolvedAccountsWithIndices;

  // Default values.
  if (!resolvedAccounts.participantTokenAccount.value) {
    resolvedAccounts.participantTokenAccount.value = findAssociatedTokenPda(
      context,
      {
        mint: expectPublicKey(resolvedAccounts.tokenMint.value),
        owner: expectPublicKey(resolvedAccounts.participant.value),
      }
    );
  }
  if (!resolvedAccounts.potTokenAccount.value) {
    resolvedAccounts.potTokenAccount.value = findAssociatedTokenPda(context, {
      mint: expectPublicKey(resolvedAccounts.tokenMint.value),
      owner: expectPublicKey(resolvedAccounts.pot.value),
    });
  }
  if (!resolvedAccounts.tokenProgram.value) {
    resolvedAccounts.tokenProgram.value = context.programs.getPublicKey(
      'splToken',
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
    );
    resolvedAccounts.tokenProgram.isWritable = false;
  }
  if (!resolvedAccounts.associatedTokenProgram.value) {
    resolvedAccounts.associatedTokenProgram.value = publicKey(
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
    );
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
  const data = getPayInSplTokenV1InstructionDataSerializer().serialize({});

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}