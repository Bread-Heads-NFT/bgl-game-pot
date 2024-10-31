use borsh::{BorshDeserialize, BorshSerialize};
use shank::ShankAccount;
use solana_program::pubkey::Pubkey;

pub const PREFIX: &str = "pot";

#[derive(Clone, BorshSerialize, BorshDeserialize, Debug)]
pub enum Key {
    Uninitialized,
    GamePot,
}

#[repr(C)]
#[derive(Clone, BorshSerialize, BorshDeserialize, Debug, ShankAccount)]
pub struct GamePot {
    pub key: Key,               // 1
    pub authority: Pubkey,      // 32
    pub token_mint: Pubkey,     // 32
    pub bump: u8,               // 1
    pub payment_amount: u64,    // 8
    pub balance: u64,           // 8
    pub fee_percentage: u8,     // 1
    pub allowlist: Vec<Pubkey>, // 4 + (32 * n)
}

impl GamePot {
    pub const BASE_LEN: usize = 1 + 32 + 32 + 1 + 8 + 8 + 1 + 4;
}
