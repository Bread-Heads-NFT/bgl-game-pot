mod close_pot;
mod create_pot;
mod pay_in_sol;
mod pay_in_spl_token;
mod pay_out_sol;
mod pay_out_spl_token;
mod pop_participant;

pub use close_pot::*;
pub use create_pot::*;
pub use pay_in_sol::*;
pub use pay_in_spl_token::*;
pub use pay_out_sol::*;
pub use pay_out_spl_token::*;
pub use pop_participant::*;

use borsh::BorshDeserialize;
use solana_program::{account_info::AccountInfo, entrypoint::ProgramResult, msg, pubkey::Pubkey};

use crate::instruction::BglGamePotInstruction;

pub fn process_instruction<'a>(
    _program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction: BglGamePotInstruction =
        BglGamePotInstruction::try_from_slice(instruction_data)?;
    match instruction {
        BglGamePotInstruction::CreatePotV1(args) => {
            msg!("Instruction: CreatePotV1");
            create_pot(accounts, args)
        }
        BglGamePotInstruction::ClosePotV1 => {
            msg!("Instruction: ClosePotV1");
            close_pot(accounts)
        }
        BglGamePotInstruction::PopParticipantV1 => {
            msg!("Instruction: PopParticipantV1");
            pop_participant(accounts)
        }
        BglGamePotInstruction::PayInSolV1 => {
            msg!("Instruction: PayInSolV1");
            pay_in_sol(accounts)
        }
        BglGamePotInstruction::PayOutSolV1 => {
            msg!("Instruction: PayOutSolV1");
            pay_out_sol(accounts)
        }
        BglGamePotInstruction::PayInSplTokenV1 => {
            msg!("Instruction: PayInSplTokenV1");
            pay_in_spl_token(accounts)
        }
        BglGamePotInstruction::PayOutSplTokenV1 => {
            msg!("Instruction: PayOutSplTokenV1");
            pay_out_spl_token(accounts)
        }
    }
}
