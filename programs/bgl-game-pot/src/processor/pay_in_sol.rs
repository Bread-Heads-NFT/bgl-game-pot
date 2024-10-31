use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, program::invoke, system_instruction,
    system_program,
};

use crate::{
    error::BglGamePotError,
    instruction::accounts::PayInSolV1Accounts,
    state::{GamePot, PREFIX},
    utils::{assert_derivation_with_bump, assert_signer, resize_with_offset},
};

pub fn pay_in_sol<'a>(accounts: &'a [AccountInfo<'a>]) -> ProgramResult {
    // Accounts.
    let ctx = PayInSolV1Accounts::context(accounts)?;

    let mut game_pot = GamePot::try_from_slice(&ctx.accounts.pot.data.borrow())?;

    // Guards.
    // Validate Pot Account.
    assert_derivation_with_bump(
        &crate::ID,
        ctx.accounts.pot,
        &[
            PREFIX.as_bytes(),
            game_pot.authority.as_ref(),
            game_pot.token_mint.as_ref(),
            &[game_pot.bump],
        ],
        BglGamePotError::InvalidDerivationForPotAccount,
    )?;

    // Validate Participant.
    assert_signer(ctx.accounts.participant)?;

    // Validate System Program.
    if *ctx.accounts.system_program.key != system_program::id() {
        return Err(BglGamePotError::InvalidSystemProgram.into());
    }

    let data_len = ctx.accounts.pot.data_len();
    resize_with_offset(
        ctx.accounts.pot,
        ctx.accounts.participant,
        ctx.accounts.system_program,
        data_len + 32,
    )?;

    invoke(
        &system_instruction::transfer(
            ctx.accounts.participant.key,
            ctx.accounts.pot.key,
            game_pot.payment_amount,
        ),
        &[ctx.accounts.participant.clone(), ctx.accounts.pot.clone()],
    )?;

    game_pot.balance += game_pot.payment_amount;
    game_pot.allowlist.push(*ctx.accounts.participant.key);

    game_pot.serialize(&mut *ctx.accounts.pot.data.borrow_mut())?;

    Ok(())
}
