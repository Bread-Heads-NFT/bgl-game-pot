use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, program::invoke, program_pack::Pack,
    system_program,
};
use spl_token::state::Account;

use crate::{
    error::BglGamePotError,
    instruction::accounts::PayInSplTokenV1Accounts,
    state::{GamePot, PREFIX},
    utils::{
        assert_derivation_with_bump, assert_owned_by, assert_signer, resize_with_offset,
        SPL_TOKEN_PROGRAM_IDS,
    },
};

pub fn pay_in_spl_token<'a>(accounts: &'a [AccountInfo<'a>]) -> ProgramResult {
    // Accounts.
    let ctx = PayInSplTokenV1Accounts::context(accounts)?;

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

    // Validate participant.
    assert_signer(ctx.accounts.participant)?;

    // Validate Token Mint.
    assert_owned_by(
        ctx.accounts.token_mint,
        ctx.accounts.token_program.key,
        BglGamePotError::InvalidAccountOwner,
    )?;

    if game_pot.token_mint != *ctx.accounts.token_mint.key {
        return Err(BglGamePotError::InvalidTokenMint.into());
    }

    // Validate Participant Token Account.
    assert_owned_by(
        ctx.accounts.participant_token_account,
        ctx.accounts.token_program.key,
        BglGamePotError::InvalidAccountOwner,
    )?;

    let participant_token_account =
        Account::unpack(&ctx.accounts.participant_token_account.data.borrow())?;

    if participant_token_account.mint != *ctx.accounts.token_mint.key {
        return Err(BglGamePotError::InvalidTokenMintForTokenAccount.into());
    }

    if participant_token_account.owner != *ctx.accounts.participant.key {
        return Err(BglGamePotError::InvalidTokenAccountOwner.into());
    }

    // Validate pot token account.
    // Create the pot token account if it doesn't exist.
    if ctx.accounts.pot_token_account.data_is_empty() {
        if *ctx.accounts.associated_token_program.key != spl_associated_token_account::ID {
            return Err(BglGamePotError::InvalidAssociatedTokenProgram.into());
        }

        invoke(
            &spl_associated_token_account::instruction::create_associated_token_account(
                ctx.accounts.participant.key,
                ctx.accounts.pot.key,
                ctx.accounts.token_mint.key,
                ctx.accounts.token_program.key,
            ),
            &[
                ctx.accounts.participant.clone(),
                ctx.accounts.pot.clone(),
                ctx.accounts.token_mint.clone(),
                ctx.accounts.token_program.clone(),
                ctx.accounts.pot_token_account.clone(),
            ],
        )?;
    }
    // Otherwise validate the pot token account.
    else {
        assert_owned_by(
            ctx.accounts.pot_token_account,
            ctx.accounts.token_program.key,
            BglGamePotError::InvalidAccountOwner,
        )?;

        let pot_token_account = Account::unpack(&ctx.accounts.pot_token_account.data.borrow())?;

        if pot_token_account.mint != *ctx.accounts.token_mint.key {
            return Err(BglGamePotError::InvalidTokenMintForTokenAccount.into());
        }

        if pot_token_account.owner != *ctx.accounts.pot.key {
            return Err(BglGamePotError::InvalidTokenAccountOwner.into());
        }
    }

    // Validate Token Program.
    if !SPL_TOKEN_PROGRAM_IDS.contains(ctx.accounts.token_program.key) {
        return Err(BglGamePotError::InvalidTokenProgram.into());
    }

    // Validate Associated Token Program.
    if *ctx.accounts.associated_token_program.key != spl_associated_token_account::ID {
        return Err(BglGamePotError::InvalidAssociatedTokenProgram.into());
    }

    // Validate System Program.
    if *ctx.accounts.system_program.key != system_program::ID {
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
        &spl_token::instruction::transfer(
            ctx.accounts.token_program.key,
            ctx.accounts.participant_token_account.key,
            ctx.accounts.pot_token_account.key,
            ctx.accounts.participant.key,
            &[],
            game_pot.payment_amount,
        )?,
        &[
            ctx.accounts.participant_token_account.clone(),
            ctx.accounts.pot_token_account.clone(),
            ctx.accounts.participant.clone(),
        ],
    )?;

    game_pot.allowlist.push(*ctx.accounts.participant.key);

    game_pot.serialize(&mut *ctx.accounts.pot.data.borrow_mut())?;

    Ok(())
}
