import { AnchorProvider, BN, Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

import { MINIMUM_REMAINING_TIME_UNTIL_EXPIRY, PROGRAM_ID } from "./constants";

// Create a function that gets the solana program that we created
export const getProgram = (connection, wallet) => {
  const IDL = require("./idl.json");
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );
  const program = new Program(IDL, PROGRAM_ID, provider);
  return program;
};

const getProgramAccountPk = async (seeds) => {
  return (await PublicKey.findProgramAddress(seeds, PROGRAM_ID))[0];
};

export const getMasterAccountPk = async () => {
  return await getProgramAccountPk([Buffer.from("master")]);
};

export const getBetAccountPk = async (id) => {
  return await getProgramAccountPk([
    Buffer.from("bet"),
    new BN(id).toArrayLike(Buffer, "le", 8),
  ]);
};
