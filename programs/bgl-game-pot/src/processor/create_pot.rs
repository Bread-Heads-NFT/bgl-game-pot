use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{account_info::AccountInfo, entrypoint::ProgramResult, system_program};

use crate::{
    error::BglGamePotError,
    instruction::accounts::CreatePotV1Accounts,
    state::{GamePot, Key, PREFIX},
    utils::{
        assert_derivation, assert_owner_in, assert_signer, create_or_allocate_account_raw,
        SPL_TOKEN_PROGRAM_IDS,
    },
};

pub fn create_pot<'a>(accounts: &'a [AccountInfo<'a>], args: CreatePotV1Args) -> ProgramResult {
    // Accounts.
    let ctx = CreatePotV1Accounts::context(accounts)?;

    // Guards.
    // Validate Pot Account.
    let bump = assert_derivation(
        &crate::ID,
        ctx.accounts.pot,
        &[
            PREFIX.as_bytes(),
            ctx.accounts.game_authority.key.as_ref(),
            ctx.accounts.token_mint.key.as_ref(),
        ],
        BglGamePotError::InvalidDerivationForPotAccount,
    )?;

    // Validate Game Authority.
    assert_signer(ctx.accounts.game_authority)?;

    // Validate Token Mint.
    assert_owner_in(
        ctx.accounts.token_mint,
        &SPL_TOKEN_PROGRAM_IDS,
        BglGamePotError::InvalidAccountOwner,
    )?;

    // Validate System Program.
    if *ctx.accounts.system_program.key != system_program::id() {
        return Err(BglGamePotError::InvalidSystemProgram.into());
    }

    create_or_allocate_account_raw(
        crate::ID,
        ctx.accounts.pot,
        ctx.accounts.system_program,
        ctx.accounts.game_authority,
        GamePot::BASE_LEN,
        &[
            PREFIX.as_bytes(),
            ctx.accounts.game_authority.key.as_ref(),
            ctx.accounts.token_mint.key.as_ref(),
            &[bump],
        ],
    )?;

    let game_pot = GamePot {
        key: Key::GamePot,
        authority: *ctx.accounts.game_authority.key,
        token_mint: *ctx.accounts.token_mint.key,
        bump,
        payment_amount: args.payment_amount,
        balance: 0,
        fee_percentage: args.fee_percentage,
        allowlist: vec![],
    };

    game_pot.serialize(&mut *ctx.accounts.pot.data.borrow_mut())?;

    Ok(())
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct CreatePotV1Args {
    /// Payment amount
    /// The payment amount of the game pot.
    pub payment_amount: u64,

    /// Fee percentage
    /// The fee percentage of the game pot.
    pub fee_percentage: u8,
}
