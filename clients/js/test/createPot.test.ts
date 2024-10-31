import { generateSigner, publicKey } from '@metaplex-foundation/umi';
import test from 'ava';
import { BGL_GAME_POT_PROGRAM_ID, GamePot, Key, createPotV1, fetchGamePot, findGamePotPda } from '../src';
import { createUmi } from './_setup';
import { createAndMint, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';

test('it can create a new pot', async (t) => {
  // Given a Umi instance and a new signer.
  const umi = await createUmi();
  const tokenMint = generateSigner(umi);
  await createAndMint(umi, {
    mint: tokenMint,
    name: 'CRUMBS',
    uri: 'https://example.com',
    sellerFeeBasisPoints: {
      basisPoints: 0n,
      identifier: '%',
      decimals: 2
    },
    decimals: 9,
    tokenStandard: TokenStandard.Fungible,
    amount: 100,
  }).sendAndConfirm(umi);

  // When we create a new account.
  await createPotV1(umi, {
    gameAuthority: umi.identity,
    tokenMint: tokenMint.publicKey,
    paymentAmount: 100,
    feePercentage: 0
  }).sendAndConfirm(umi);

  let gamePotPda = findGamePotPda(umi, { gameAuthority: umi.identity.publicKey, tokenMint: tokenMint.publicKey });
  // Then an account was created with the correct data.
  t.like(await fetchGamePot(umi, gamePotPda), <GamePot>{
    publicKey: publicKey(gamePotPda),
    header: {
      executable: false,
      owner: BGL_GAME_POT_PROGRAM_ID,
      lamports: await umi.rpc.getRent(87),
    },
    key: Key.GamePot,
    authority: umi.identity.publicKey,
    tokenMint: tokenMint.publicKey,
    bump: gamePotPda[1],
    paymentAmount: 100n,
    balance: 0n,
    feePercentage: 0,
    allowlist: []
  });
});
