use borsh::BorshDeserialize;
use solana_program::{account_info::AccountInfo, entrypoint::ProgramResult};

use crate::{
    error::BglGamePotError,
    instruction::accounts::ClosePotV1Accounts,
    state::{GamePot, PREFIX},
    utils::{assert_derivation_with_bump, assert_signer, close_account_raw},
};

pub fn close_pot<'a>(accounts: &'a [AccountInfo<'a>]) -> ProgramResult {
    // Accounts.
    let ctx = ClosePotV1Accounts::context(accounts)?;

    let game_pot = GamePot::try_from_slice(&ctx.accounts.pot.data.borrow())?;

    // Guards.
    // Validate Pot Account.
    if game_pot.balance > 0 || !game_pot.allowlist.is_empty() {
        return Err(BglGamePotError::PotNotEmpty.into());
    }

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

    close_account_raw(ctx.accounts.game_authority, ctx.accounts.pot)?;

    Ok(())
}
