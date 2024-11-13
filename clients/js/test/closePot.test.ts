import { publicKey } from '@metaplex-foundation/umi';
import test from 'ava';
import { BGL_GAME_POT_PROGRAM_ID, closePotV1, createPotV1, fetchGamePot, findGamePotPda, GamePot, Key } from '../src';
import { createUmi } from './_setup';

test('it can close an empty pot', async (t) => {
  // Given a Umi instance and a new signer.
  const umi = await createUmi();

  // When we create a new account.
  await createPotV1(umi, {
    gameAuthority: umi.identity,
    tokenMint: publicKey("So11111111111111111111111111111111111111112"),
    paymentAmount: 100,
    feePercentage: 0
  }).sendAndConfirm(umi);

  let gamePotPda = findGamePotPda(umi, { gameAuthority: umi.identity.publicKey, tokenMint: publicKey("So11111111111111111111111111111111111111112") });

  t.like(await fetchGamePot(umi, gamePotPda), <GamePot>{
    publicKey: publicKey(gamePotPda),
    header: {
      executable: false,
      owner: BGL_GAME_POT_PROGRAM_ID,
      lamports: await umi.rpc.getRent(79),
    },
    key: Key.GamePot,
    authority: umi.identity.publicKey,
    tokenMint: publicKey("So11111111111111111111111111111111111111112"),
    bump: gamePotPda[1],
    paymentAmount: 100n,
    feePercentage: 0,
    allowlist: []
  });

  // When we close the pot.
  await closePotV1(umi, {
    gameAuthority: umi.identity,
    pot: gamePotPda,
  }).sendAndConfirm(umi);

  // Then the pot was closed.
  t.assert(!((await umi.rpc.getAccount(publicKey(gamePotPda))).exists));
});
