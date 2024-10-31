import { generateSigner, publicKey } from "@metaplex-foundation/umi";
// eslint-disable-next-line import/no-extraneous-dependencies
import test from "ava";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { createPotV1, findGamePotPda } from '../src';
import { createUmi } from "./_setup";
import { createAndMint, TokenStandard } from "@metaplex-foundation/mpl-token-metadata";

test('create a new account', async (t) => {
    // Given an Umi instance and a new signer.
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
    });

    // When we create a new account.
    const tx = await createPotV1(umi, {
        gameAuthority: umi.identity,
        tokenMint: tokenMint.publicKey,
        paymentAmount: 100,
        feePercentage: 0
    }).sendAndConfirm(umi);

    const compute = Number((await umi.rpc.getTransaction(tx.signature))?.meta.computeUnitsConsumed);
    const account = await umi.rpc.getAccount(publicKey(findGamePotPda(umi, { gameAuthority: umi.identity.publicKey, tokenMint: tokenMint.publicKey })));
    const space = account.exists ? account.data.length : 0;

    const cuResult = {
        name: `CU: ${t.title}`,
        unit: "Compute Units",
        value: compute,
    }

    const spaceResult = {
        name: `Space: ${t.title}`,
        unit: "Bytes",
        value: space,
    }

    // Read the results array from output.json
    let output = [];
    if (existsSync("./output.json")) {
        output = JSON.parse(readFileSync("./output.json", 'utf-8'));
    }

    // Push the result to the array
    output.push(cuResult);
    output.push(spaceResult);
    // Write the array to output.json
    writeFileSync("./output.json", JSON.stringify(output, null, 2));

    t.pass();
});
