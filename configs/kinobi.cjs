const path = require("path");
const k = require("@metaplex-foundation/kinobi");

// Paths.
const clientDir = path.join(__dirname, "..", "clients");
const idlDir = path.join(__dirname, "..", "idls");

// Instanciate Kinobi.
const kinobi = k.createFromIdls([path.join(idlDir, "bgl_game_pot_program.json")]);

// Update programs.
kinobi.update(
  new k.updateProgramsVisitor({
    bglGamePotProgram: { name: "bglGamePot" },
  })
);

// Update accounts.
kinobi.update(
  new k.updateAccountsVisitor({
    gamePot: {
      seeds: [
        k.constantPdaSeedNodeFromString("pot"),
        k.variablePdaSeedNode("gameAuthority", k.publicKeyTypeNode(), "The address of the game authority"),
        k.variablePdaSeedNode("tokenMint", k.publicKeyTypeNode(), "The address of the token mint"),
      ],
    },
  }),
);

kinobi.update(
  k.setInstructionAccountDefaultValuesVisitor([
    {
      account: "pot",
      defaultValue: k.pdaValueNode("gamePot"),
    },
  ])
);

// ATA PDA default.
const ataPdaDefault = (mint = "mint", owner = "owner") =>
  k.pdaValueNode(k.pdaLinkNode("associatedToken", "mplToolbox"), [
    k.pdaSeedValueNode("mint", k.accountValueNode(mint)),
    k.pdaSeedValueNode("owner", k.accountValueNode(owner))
  ]);

// Update instructions.
kinobi.update(
  k.updateInstructionsVisitor({
    payInSplTokenV1: {
      accounts: {
        participantTokenAccount: { defaultValue: ataPdaDefault("tokenMint", "participant") },
        potTokenAccount: { defaultValue: ataPdaDefault("tokenMint", "pot") },
        associatedTokenProgram: { defaultValue: k.publicKeyValueNode("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL") },
      },
    },
    payOutSplTokenV1: {
      accounts: {
        winnerTokenAccount: { defaultValue: ataPdaDefault("tokenMint", "winner") },
        gameAuthorityTokenAccount: { defaultValue: ataPdaDefault("tokenMint", "gameAuthority") },
        potTokenAccount: { defaultValue: ataPdaDefault("tokenMint", "pot") },
        associatedTokenProgram: { defaultValue: k.publicKeyValueNode("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL") },
      },
    },
  })
);

// Set ShankAccount discriminator.
const key = (name) => ({ field: "key", value: k.enumValueNode("Key", name) });
kinobi.update(
  new k.setAccountDiscriminatorFromFieldVisitor({
    gamePot: key("GamePot"),
  })
);

// Render JavaScript.
const jsDir = path.join(clientDir, "js", "src", "generated");
const prettier = require(path.join(clientDir, "js", ".prettierrc.json"));
kinobi.accept(new k.renderJavaScriptVisitor(jsDir, { prettier }));

// Render Rust.
const crateDir = path.join(clientDir, "rust");
const rustDir = path.join(clientDir, "rust", "src", "generated");
kinobi.accept(
  new k.renderRustVisitor(rustDir, {
    formatCode: true,
    crateFolder: crateDir,
  })
);
