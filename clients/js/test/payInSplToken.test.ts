import { generateSigner, publicKey, sol } from '@metaplex-foundation/umi';
import test from 'ava';
import { BGL_GAME_POT_PROGRAM_ID, GamePot, Key, createPotV1, fetchGamePot, findGamePotPda, payInSplTokenV1 } from '../src';
import { createUmi } from './_setup';
import { createAndMint, fetchDigitalAssetWithAssociatedToken, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';

test('it can pay in an SPL Token to a pot', async (t) => {
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
    tokenOwner: participant.publicKey,
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
      lamports: await umi.rpc.getRent(79),
    },
    key: Key.GamePot,
    authority: umi.identity.publicKey,
    tokenMint: tokenMint.publicKey,
    bump: gamePotPda[1],
    paymentAmount: 100n,
    feePercentage: 0,
    allowlist: []
  });

  // When we pay in SOL.
  await payInSplTokenV1(umi, {
    pot: gamePotPda,
    participant,
    tokenMint: tokenMint.publicKey,
  }).setFeePayer(participant).sendAndConfirm(umi);

  // Then the account has been updated with the correct data.
  t.like(await fetchGamePot(umi, gamePotPda), <GamePot>{
    publicKey: publicKey(gamePotPda),
    header: {
      executable: false,
      owner: BGL_GAME_POT_PROGRAM_ID,
      lamports: await umi.rpc.getRent(79 + 32),
    },
    key: Key.GamePot,
    authority: umi.identity.publicKey,
    tokenMint: tokenMint.publicKey,
    bump: gamePotPda[1],
    paymentAmount: 100n,
    feePercentage: 0,
    allowlist: [participant.publicKey]
  });

  // And the participant has the correct SPL Token balance.
  t.is((await fetchDigitalAssetWithAssociatedToken(umi, tokenMint.publicKey, participant.publicKey)).token.amount, 0n);

  // And the pot has the correct SPL Token balance.
  t.is((await fetchDigitalAssetWithAssociatedToken(umi, tokenMint.publicKey, publicKey(gamePotPda))).token.amount, 100n);
});
