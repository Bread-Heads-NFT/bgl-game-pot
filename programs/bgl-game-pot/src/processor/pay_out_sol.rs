use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, rent::Rent, system_program,
    sysvar::Sysvar,
};

use crate::{
    error::BglGamePotError,
    instruction::accounts::PayOutSolV1Accounts,
    state::{GamePot, PREFIX},
    utils::{assert_derivation_with_bump, assert_signer, resize_with_offset},
};

pub fn pay_out_sol<'a>(accounts: &'a [AccountInfo<'a>]) -> ProgramResult {
    // Accounts.
    let ctx = PayOutSolV1Accounts::context(accounts)?;

    let mut game_pot = GamePot::try_from_slice(&ctx.accounts.pot.data.borrow())?;

    // Guards.
    // Validate Pot Account.
    assert_derivation_with_bump(
        &crate::ID,
        ctx.accounts.pot,
        &[
            PREFIX.as_bytes(),
            ctx.accounts.game_authority.key.as_ref(),
            game_pot.token_mint.as_ref(),
            &[game_pot.bump],
        ],
        BglGamePotError::InvalidDerivationForPotAccount,
    )?;

    // Validate Game Authority.
    assert_signer(ctx.accounts.game_authority)?;

    if game_pot.authority != *ctx.accounts.game_authority.key {
        return Err(BglGamePotError::InvalidAuthority.into());
    }

    // Validate Winner.
    // No validation needed.

    // Validate System Program.
    if *ctx.accounts.system_program.key != system_program::id() {
        return Err(BglGamePotError::InvalidSystemProgram.into());
    }

    let balance = ctx
        .accounts
        .pot
        .lamports()
        .checked_sub(Rent::get()?.minimum_balance(ctx.accounts.pot.data_len()))
        .ok_or(BglGamePotError::NumericalOverflow)?;
    let fee_amount = (balance * game_pot.fee_percentage as u64) / 100u64;
    let winner_amount = balance - fee_amount;

    // Transfer the fee to the game authority.
    **ctx.accounts.pot.try_borrow_mut_lamports()? -= fee_amount;
    **ctx.accounts.game_authority.try_borrow_mut_lamports()? += fee_amount;
    // Transfer the winner amount to the winner.
    **ctx.accounts.pot.try_borrow_mut_lamports()? -= winner_amount;
    **ctx.accounts.winner.try_borrow_mut_lamports()? += winner_amount;

    game_pot.allowlist = vec![];

    resize_with_offset(
        ctx.accounts.pot,
        ctx.accounts.game_authority,
        ctx.accounts.system_program,
        GamePot::BASE_LEN,
    )?;

    game_pot.serialize(&mut *ctx.accounts.pot.data.borrow_mut())?;

    Ok(())
}
