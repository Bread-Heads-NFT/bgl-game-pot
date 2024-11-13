import { addAmounts, generateSigner, lamports, publicKey, sol, subtractAmounts } from '@metaplex-foundation/umi';
import test from 'ava';
import { BGL_GAME_POT_PROGRAM_ID, GamePot, Key, createPotV1, fetchGamePot, findGamePotPda, payInSolV1, popParticipantV1 } from '../src';
import { createUmi } from './_setup';

test('it can pop a participant from the allowlist', async (t) => {
  // Given a Umi instance and a new signer.
  const umi = await createUmi();
  const participant = generateSigner(umi);
  await umi.rpc.airdrop(participant.publicKey, sol(1));

  // When we create a new account.
  await createPotV1(umi, {
    gameAuthority: umi.identity,
    tokenMint: publicKey("So11111111111111111111111111111111111111112"),
    paymentAmount: 100,
    feePercentage: 0
  }).sendAndConfirm(umi);

  let gamePotPda = findGamePotPda(umi, { gameAuthority: umi.identity.publicKey, tokenMint: publicKey("So11111111111111111111111111111111111111112") });
  // Then an account was created with the correct data.
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
      lamports: addAmounts(await umi.rpc.getRent(79 + 32), lamports(100)),
    },
    key: Key.GamePot,
    authority: umi.identity.publicKey,
    tokenMint: publicKey("So11111111111111111111111111111111111111112"),
    bump: gamePotPda[1],
    paymentAmount: 100n,
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

  // When we pop the participant from the allowlist.
  await popParticipantV1(umi, {
    pot: gamePotPda,
    gameAuthority: umi.identity,
    participant: participant.publicKey,
  }).sendAndConfirm(umi);

  // Then the account has been updated with the correct data.
  t.like(await fetchGamePot(umi, gamePotPda), <GamePot>{
    publicKey: publicKey(gamePotPda),
    header: {
      executable: false,
      owner: BGL_GAME_POT_PROGRAM_ID,
      lamports: addAmounts(await umi.rpc.getRent(79), lamports(100)),
    },
    key: Key.GamePot,
    authority: umi.identity.publicKey,
    tokenMint: publicKey("So11111111111111111111111111111111111111112"),
    bump: gamePotPda[1],
    paymentAmount: 100n,
    feePercentage: 0,
    allowlist: []
  });
});
