use num_derive::FromPrimitive;
use solana_program::{
    decode_error::DecodeError,
    msg,
    program_error::{PrintProgramError, ProgramError},
};
use thiserror::Error;

#[derive(Error, Clone, Debug, Eq, PartialEq, FromPrimitive)]
pub enum BglGamePotError {
    /// 0 - Invalid System Program
    #[error("Invalid System Program")]
    InvalidSystemProgram,

    /// 1 - Error deserializing account
    #[error("Error deserializing account")]
    DeserializationError,

    /// 2 - Error serializing account
    #[error("Error serializing account")]
    SerializationError,

    /// 3 - Invalid Authority
    #[error("Invalid Authority")]
    InvalidAuthority,

    /// 4 - Pot Not Empty
    #[error("Pot Not Empty")]
    PotNotEmpty,

    /// 5 - Invalid Token Program
    #[error("Invalid Token Program")]
    InvalidTokenProgram,

    /// 6 - Invalid Token Mint
    #[error("Invalid Token Mint")]
    InvalidTokenMint,

    /// 7 - Invalid Derivation For Pot Account
    #[error("Invalid Derivation For Pot Account")]
    InvalidDerivationForPotAccount,

    /// 8 - Invalid Associated Token Program
    #[error("Invalid Associated Token Program")]
    InvalidAssociatedTokenProgram,

    /// 9 - Invalid Account Owner
    #[error("Invalid Account Owner")]
    InvalidAccountOwner,

    /// 10 - Invalid Token Mint for Token Account
    #[error("Invalid Token Mint for Token Account")]
    InvalidTokenMintForTokenAccount,

    /// 11 - Invalid Token Account Owner
    #[error("Invalid Token Account Owner")]
    InvalidTokenAccountOwner,

    /// 12 - Participant Not In Allowlist
    #[error("Participant Not In Allowlist")]
    ParticipantNotInAllowlist,

    /// 13 - Invalid Payment Type
    #[error("Invalid Payment Type")]
    InvalidPaymentType,
}

impl PrintProgramError for BglGamePotError {
    fn print<E>(&self) {
        msg!(&self.to_string());
    }
}

impl From<BglGamePotError> for ProgramError {
    fn from(e: BglGamePotError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

impl<T> DecodeError<T> for BglGamePotError {
    fn type_of() -> &'static str {
        "Bgl Game Pot Error"
    }
}
