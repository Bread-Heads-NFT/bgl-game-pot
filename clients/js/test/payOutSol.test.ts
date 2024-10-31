import { addAmounts, generateSigner, lamports, publicKey, sol, subtractAmounts } from '@metaplex-foundation/umi';
import test from 'ava';
import { BGL_GAME_POT_PROGRAM_ID, GamePot, Key, createPotV1, fetchGamePot, findGamePotPda, payInSolV1, payOutSolV1 } from '../src';
import { createUmi } from './_setup';
import { createAndMint, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';

test('it can pay out SOL from a pot', async (t) => {
  // Given a Umi instance and a new signer.
  const umi = await createUmi();
  const tokenMint = generateSigner(umi);
  const participant = generateSigner(umi);
  await umi.rpc.airdrop(participant.publicKey, sol(1));
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

  // When we pay in SOL.
  await payInSolV1(umi, {
    pot: gamePotPda,
    participant,
  }).setFeePayer(participant).sendAndConfirm(umi);

  // Then the account has been updated with the correct data.
  t.like(await fetchGamePot(umi, gamePotPda), <GamePot>{
    publicKey: publicKey(gamePotPda),
    header: {
      executable: false,
      owner: BGL_GAME_POT_PROGRAM_ID,
      lamports: addAmounts(await umi.rpc.getRent(87 + 32), lamports(100)),
    },
    key: Key.GamePot,
    authority: umi.identity.publicKey,
    tokenMint: tokenMint.publicKey,
    bump: gamePotPda[1],
    paymentAmount: 100n,
    balance: 100n,
    feePercentage: 0,
    allowlist: [participant.publicKey]
  });
  // And the participant has the correct SOL balance.
  // 1 SOL minus rent for pubkey
  let expectedBalance = subtractAmounts(sol(1), subtractAmounts(await umi.rpc.getRent(32), await umi.rpc.getRent(0)));
  // minus payment amount
  expectedBalance = subtractAmounts(expectedBalance, lamports(100));
  // minus transaction fee
  expectedBalance = subtractAmounts(expectedBalance, lamports(5000));
  t.deepEqual(await umi.rpc.getBalance(participant.publicKey), expectedBalance);

  // When we pay out SOL.
  await payOutSolV1(umi, {
    pot: gamePotPda,
    gameAuthority: umi.identity,
    winner: participant.publicKey,
  }).sendAndConfirm(umi);

  // Then the account has been updated with the correct data.
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
  expectedBalance = addAmounts(expectedBalance, lamports(100));
  t.deepEqual(await umi.rpc.getBalance(participant.publicKey), expectedBalance);
});