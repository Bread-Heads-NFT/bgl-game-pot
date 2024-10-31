use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    program::{invoke, invoke_signed},
    program_pack::Pack,
    system_program,
};
use spl_token::state::Account;

use crate::{
    error::BglGamePotError,
    instruction::accounts::PayOutSplTokenV1Accounts,
    state::{GamePot, PREFIX},
    utils::{
        assert_derivation_with_bump, assert_owned_by, assert_signer, resize_with_offset,
        SPL_TOKEN_PROGRAM_IDS,
    },
};

pub fn pay_out_spl_token<'a>(accounts: &'a [AccountInfo<'a>]) -> ProgramResult {
    // Accounts.
    let ctx = PayOutSplTokenV1Accounts::context(accounts)?;

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

    // Validate Winner.
    // No validation needed.

    // Validate Token Mint.
    assert_owned_by(
        ctx.accounts.token_mint,
        ctx.accounts.token_program.key,
        BglGamePotError::InvalidAccountOwner,
    )?;

    if game_pot.token_mint != *ctx.accounts.token_mint.key {
        return Err(BglGamePotError::InvalidTokenMint.into());
    }

    // Validate Pot Token Account.
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

    // Validate Winner Token Account.
    // Create the winner token account if it doesn't exist.
    if ctx.accounts.winner_token_account.data_is_empty() {
        invoke(
            &spl_associated_token_account::instruction::create_associated_token_account(
                ctx.accounts.game_authority.key,
                ctx.accounts.winner.key,
                ctx.accounts.token_mint.key,
                ctx.accounts.token_program.key,
            ),
            &[
                ctx.accounts.game_authority.clone(),
                ctx.accounts.token_mint.clone(),
                ctx.accounts.token_program.clone(),
                ctx.accounts.winner_token_account.clone(),
            ],
        )?;
    }
    // Otherwise validate the winner token account.
    else {
        assert_owned_by(
            ctx.accounts.winner_token_account,
            ctx.accounts.token_program.key,
            BglGamePotError::InvalidAccountOwner,
        )?;

        let winner_token_account =
            Account::unpack(&ctx.accounts.winner_token_account.data.borrow())?;

        if winner_token_account.mint != *ctx.accounts.token_mint.key {
            return Err(BglGamePotError::InvalidTokenMintForTokenAccount.into());
        }

        if winner_token_account.owner != *ctx.accounts.winner.key {
            return Err(BglGamePotError::InvalidTokenAccountOwner.into());
        }
    }

    // Validate Game Authority Token Account.
    // Create the game authority token account if it doesn't exist.
    if ctx.accounts.game_authority_token_account.data_is_empty() {
        invoke(
            &spl_associated_token_account::instruction::create_associated_token_account(
                ctx.accounts.game_authority.key,
                ctx.accounts.game_authority.key,
                ctx.accounts.token_mint.key,
                ctx.accounts.token_program.key,
            ),
            &[
                ctx.accounts.game_authority.clone(),
                ctx.accounts.token_mint.clone(),
                ctx.accounts.token_program.clone(),
                ctx.accounts.game_authority_token_account.clone(),
            ],
        )?;
    }
    // Otherwise validate the game authority token account.
    else {
        assert_owned_by(
            ctx.accounts.game_authority_token_account,
            ctx.accounts.token_program.key,
            BglGamePotError::InvalidAccountOwner,
        )?;

        let game_authority_token_account =
            Account::unpack(&ctx.accounts.game_authority_token_account.data.borrow())?;

        if game_authority_token_account.mint != *ctx.accounts.token_mint.key {
            return Err(BglGamePotError::InvalidTokenMintForTokenAccount.into());
        }

        if game_authority_token_account.owner != *ctx.accounts.game_authority.key {
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

    let fee_amount = game_pot.balance * (game_pot.fee_percentage / 100u8) as u64;
    let winner_amount = game_pot.balance - fee_amount;

    // Transfer the fee to the game authority.
    invoke_signed(
        &spl_token::instruction::transfer(
            ctx.accounts.token_program.key,
            ctx.accounts.pot_token_account.key,
            ctx.accounts.game_authority_token_account.key,
            ctx.accounts.pot.key,
            &[],
            fee_amount,
        )?,
        &[
            ctx.accounts.pot_token_account.clone(),
            ctx.accounts.game_authority_token_account.clone(),
            ctx.accounts.pot.clone(),
        ],
        &[&[
            PREFIX.as_bytes(),
            ctx.accounts.game_authority.key.as_ref(),
            ctx.accounts.token_mint.key.as_ref(),
            &[game_pot.bump],
        ]],
    )?;

    // Transfer the token from the pot to the winner.
    invoke_signed(
        &spl_token::instruction::transfer(
            ctx.accounts.token_program.key,
            ctx.accounts.pot_token_account.key,
            ctx.accounts.winner_token_account.key,
            ctx.accounts.pot.key,
            &[],
            winner_amount,
        )?,
        &[
            ctx.accounts.pot_token_account.clone(),
            ctx.accounts.winner_token_account.clone(),
            ctx.accounts.pot.clone(),
        ],
        &[&[
            PREFIX.as_bytes(),
            ctx.accounts.game_authority.key.as_ref(),
            ctx.accounts.token_mint.key.as_ref(),
            &[game_pot.bump],
        ]],
    )?;

    game_pot.balance = 0;
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
