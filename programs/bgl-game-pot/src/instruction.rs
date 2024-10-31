use borsh::{BorshDeserialize, BorshSerialize};
use shank::{ShankContext, ShankInstruction};

use crate::processor::CreatePotV1Args;

#[derive(BorshDeserialize, BorshSerialize, Clone, Debug, ShankContext, ShankInstruction)]
#[rustfmt::skip]
pub enum BglGamePotInstruction {
    /// Create a game pot.
    /// Create a new game pot that is a PDA of the authority and token mint.
    #[account(0, writable, name="pot", desc = "The address of the new game pot")]
    #[account(1, writable, signer, name="game_authority", desc = "The authority of the game pot")]
    #[account(2, name="token_mint", desc = "The address of the token mint")]
    #[account(3, name="system_program", desc = "The system program")]
    CreatePotV1(CreatePotV1Args),

    /// Close a game pot.
    #[account(0, writable, name="pot", desc = "The address of the game pot")]
    #[account(1, writable, signer, name="game_authority", desc = "The authority of the game pot")]
    ClosePotV1,

    /// Pop a participant from the allowlist.
    #[account(0, writable, name="pot", desc = "The address of the game pot")]
    #[account(1, writable, signer, name="game_authority", desc = "The authority of the game pot")]
    #[account(2, name="participant", desc = "The participant to remove from the allowlist")]
    #[account(3, name="system_program", desc = "The system program")]
    PopParticipantV1,

    /// Pay In SOL
    /// Pays a SOL amount to the pot.
    #[account(0, writable, name="pot", desc = "The address of the game pot")]
    #[account(1, writable, signer, name="participant", desc = "The participant")]
    #[account(2, name="system_program", desc = "The system program")]
    PayInSolV1,

    /// Pay Out SOL
    /// Pays out a SOL amount to the authority.
    #[account(0, writable, name="pot", desc = "The address of the game pot")]
    #[account(1, writable, signer, name="game_authority", desc = "The authority of the game pot")]
    #[account(2, writable, name="winner", desc = "The account receiving the payout")]
    #[account(3, name="system_program", desc = "The system program")]
    PayOutSolV1,

    /// Pay In Spl Token
    /// Pays a SPL token amount to the pot.
    #[account(0, writable, name="pot", desc = "The address of the game pot")]
    #[account(1, writable, signer, name="participant", desc = "The participant")]
    #[account(2, name="token_mint", desc = "The address of the token mint")]
    #[account(3, writable, name="participant_token_account", desc = "The source token account")]
    #[account(4, writable, name="pot_token_account", desc = "The destination token account")]
    #[account(5, name="token_program", desc = "The token program")]
    #[account(6, name="associated_token_program", desc = "The associated token program")]
    #[account(7, name="system_program", desc = "The system program")]
    PayInSplTokenV1,

    /// Pay Out Spl Token
    /// Pays out a SPL token amount to the authority.
    #[account(0, writable, name="pot", desc = "The address of the game pot")]
    #[account(1, writable, signer, name="game_authority", desc = "The authority of the game pot")]
    #[account(2, name="winner", desc = "The account receiving the payout")]
    #[account(3, name="token_mint", desc = "The address of the token mint")]
    #[account(4, writable, name="pot_token_account", desc = "The source token account")]
    #[account(5, writable, name="winner_token_account", desc = "The destination token account")]
    #[account(6, writable, name="game_authority_token_account", desc = "The token account of the game authority")]
    #[account(7, name="token_program", desc = "The token program")]
    #[account(8, name="associated_token_program", desc = "The associated token program")]
    #[account(9, name="system_program", desc = "The system program")]
    PayOutSplTokenV1,
}
