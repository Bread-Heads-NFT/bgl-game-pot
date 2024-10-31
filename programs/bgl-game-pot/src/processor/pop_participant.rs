use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{account_info::AccountInfo, entrypoint::ProgramResult, system_program};

use crate::{
    error::BglGamePotError,
    instruction::accounts::PopParticipantV1Accounts,
    state::{GamePot, PREFIX},
    utils::{assert_derivation_with_bump, assert_signer, resize_with_offset},
};

pub fn pop_participant<'a>(accounts: &'a [AccountInfo<'a>]) -> ProgramResult {
    // Accounts.
    let ctx = PopParticipantV1Accounts::context(accounts)?;

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

    // Validate System Program.
    if *ctx.accounts.system_program.key != system_program::ID {
        return Err(BglGamePotError::InvalidSystemProgram.into());
    }

    let index = game_pot
        .allowlist
        .iter()
        .position(|p| *p == *ctx.accounts.participant.key)
        .ok_or(BglGamePotError::ParticipantNotInAllowlist)?;
    game_pot.allowlist.swap_remove(index);

    let data_len = ctx.accounts.pot.data_len();
    resize_with_offset(
        ctx.accounts.pot,
        ctx.accounts.game_authority,
        ctx.accounts.system_program,
        data_len - 32,
    )?;

    game_pot.serialize(&mut *ctx.accounts.pot.data.borrow_mut())?;

    Ok(())
}
