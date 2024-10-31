mod account;
mod assertions;

pub use account::*;
pub use assertions::*;
use solana_program::{pubkey, pubkey::Pubkey};

pub static SPL_TOKEN_PROGRAM_IDS: [Pubkey; 2] = [
    pubkey!("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    pubkey!("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
];
