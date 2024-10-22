const path = require("path");
const { generateIdl } = require("@metaplex-foundation/shank-js");

const idlDir = path.join(__dirname, "..", "idls");
const binaryInstallDir = path.join(__dirname, "..", ".crates");
const programDir = path.join(__dirname, "..", "programs");

generateIdl({
  generator: "shank",
  programName: "bgl_game_pot_program",
  programId: "BHPoT3HQSWiPD8AczqvCbudyicPmE8RN8bpcyZLzMGmb",
  idlDir,
  binaryInstallDir,
  programDir: path.join(programDir, "bgl-game-pot"),
});
