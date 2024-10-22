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
  mapSerializer,
  publicKey as publicKeySerializer,
  struct,
} from '@metaplex-foundation/umi/serializers';
import {
  Key,
  KeyArgs,
  MyData,
  MyDataArgs,
  getKeySerializer,
  getMyDataSerializer,
} from '../types';

export type MyAccount = Account<MyAccountAccountData>;

export type MyAccountAccountData = {
  key: Key;
  authority: PublicKey;
  data: MyData;
};

export type MyAccountAccountDataArgs = {
  authority: PublicKey;
  data: MyDataArgs;
};

export function getMyAccountAccountDataSerializer(): Serializer<
  MyAccountAccountDataArgs,
  MyAccountAccountData
> {
  return mapSerializer<MyAccountAccountDataArgs, any, MyAccountAccountData>(
    struct<MyAccountAccountData>(
      [
        ['key', getKeySerializer()],
        ['authority', publicKeySerializer()],
        ['data', getMyDataSerializer()],
      ],
      { description: 'MyAccountAccountData' }
    ),
    (value) => ({ ...value, key: Key.MyAccount })
  ) as Serializer<MyAccountAccountDataArgs, MyAccountAccountData>;
}

export function deserializeMyAccount(rawAccount: RpcAccount): MyAccount {
  return deserializeAccount(rawAccount, getMyAccountAccountDataSerializer());
}

export async function fetchMyAccount(
  context: Pick<Context, 'rpc'>,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions
): Promise<MyAccount> {
  const maybeAccount = await context.rpc.getAccount(
    toPublicKey(publicKey, false),
    options
  );
  assertAccountExists(maybeAccount, 'MyAccount');
  return deserializeMyAccount(maybeAccount);
}

export async function safeFetchMyAccount(
  context: Pick<Context, 'rpc'>,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions
): Promise<MyAccount | null> {
  const maybeAccount = await context.rpc.getAccount(
    toPublicKey(publicKey, false),
    options
  );
  return maybeAccount.exists ? deserializeMyAccount(maybeAccount) : null;
}

export async function fetchAllMyAccount(
  context: Pick<Context, 'rpc'>,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions
): Promise<MyAccount[]> {
  const maybeAccounts = await context.rpc.getAccounts(
    publicKeys.map((key) => toPublicKey(key, false)),
    options
  );
  return maybeAccounts.map((maybeAccount) => {
    assertAccountExists(maybeAccount, 'MyAccount');
    return deserializeMyAccount(maybeAccount);
  });
}

export async function safeFetchAllMyAccount(
  context: Pick<Context, 'rpc'>,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions
): Promise<MyAccount[]> {
  const maybeAccounts = await context.rpc.getAccounts(
    publicKeys.map((key) => toPublicKey(key, false)),
    options
  );
  return maybeAccounts
    .filter((maybeAccount) => maybeAccount.exists)
    .map((maybeAccount) => deserializeMyAccount(maybeAccount as RpcAccount));
}

export function getMyAccountGpaBuilder(
  context: Pick<Context, 'rpc' | 'programs'>
) {
  const programId = context.programs.getPublicKey(
    'bglGamePot',
    'BHPoT3HQSWiPD8AczqvCbudyicPmE8RN8bpcyZLzMGmb'
  );
  return gpaBuilder(context, programId)
    .registerFields<{ key: KeyArgs; authority: PublicKey; data: MyDataArgs }>({
      key: [0, getKeySerializer()],
      authority: [1, publicKeySerializer()],
      data: [33, getMyDataSerializer()],
    })
    .deserializeUsing<MyAccount>((account) => deserializeMyAccount(account))
    .whereField('key', Key.MyAccount);
}

export function getMyAccountSize(): number {
  return 39;
}
