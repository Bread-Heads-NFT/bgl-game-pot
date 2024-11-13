//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! [https://github.com/metaplex-foundation/kinobi]
//!

use num_derive::FromPrimitive;
use thiserror::Error;

#[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
pub enum BglGamePotError {
    /// 0 (0x0) - Invalid System Program
    #[error("Invalid System Program")]
    InvalidSystemProgram,
    /// 1 (0x1) - Error deserializing account
    #[error("Error deserializing account")]
    DeserializationError,
    /// 2 (0x2) - Error serializing account
    #[error("Error serializing account")]
    SerializationError,
    /// 3 (0x3) - Invalid Authority
    #[error("Invalid Authority")]
    InvalidAuthority,
    /// 4 (0x4) - Pot Not Empty
    #[error("Pot Not Empty")]
    PotNotEmpty,
    /// 5 (0x5) - Invalid Token Program
    #[error("Invalid Token Program")]
    InvalidTokenProgram,
    /// 6 (0x6) - Invalid Token Mint
    #[error("Invalid Token Mint")]
    InvalidTokenMint,
    /// 7 (0x7) - Invalid Derivation For Pot Account
    #[error("Invalid Derivation For Pot Account")]
    InvalidDerivationForPotAccount,
    /// 8 (0x8) - Invalid Associated Token Program
    #[error("Invalid Associated Token Program")]
    InvalidAssociatedTokenProgram,
    /// 9 (0x9) - Invalid Account Owner
    #[error("Invalid Account Owner")]
    InvalidAccountOwner,
    /// 10 (0xA) - Invalid Token Mint for Token Account
    #[error("Invalid Token Mint for Token Account")]
    InvalidTokenMintForTokenAccount,
    /// 11 (0xB) - Invalid Token Account Owner
    #[error("Invalid Token Account Owner")]
    InvalidTokenAccountOwner,
    /// 12 (0xC) - Participant Not In Allowlist
    #[error("Participant Not In Allowlist")]
    ParticipantNotInAllowlist,
    /// 13 (0xD) - Invalid Payment Type
    #[error("Invalid Payment Type")]
    InvalidPaymentType,
    /// 14 (0xE) - Pot Token Account Not Found
    #[error("Pot Token Account Not Found")]
    PotTokenAccountNotFound,
    /// 15 (0xF) - Numerical Overflow
    #[error("Numerical Overflow")]
    NumericalOverflow,
}

impl solana_program::program_error::PrintProgramError for BglGamePotError {
    fn print<E>(&self) {
        solana_program::msg!(&self.to_string());
    }
}
