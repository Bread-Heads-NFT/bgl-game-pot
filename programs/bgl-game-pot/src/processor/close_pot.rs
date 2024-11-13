use borsh::BorshDeserialize;
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, program_pack::Pack, rent::Rent,
    sysvar::Sysvar,
};
use spl_token::state::Account;

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
    if !game_pot.allowlist.is_empty() {
        return Err(BglGamePotError::PotNotEmpty.into());
    }

    // Validate pot balance.
    if game_pot.token_mint == spl_token::native_mint::ID {
        let lamports = ctx.accounts.pot.lamports();

        if lamports > Rent::get()?.minimum_balance(ctx.accounts.pot.data_len()) {
            return Err(BglGamePotError::PotNotEmpty.into());
        }
    } else {
        let Some(token_account) = ctx.accounts.pot_token_account else {
            return Err(BglGamePotError::PotTokenAccountNotFound.into());
        };

        let token_account_info = Account::unpack(&token_account.data.borrow())?;
        if token_account_info.amount > 0 {
            return Err(BglGamePotError::PotNotEmpty.into());
        }
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
