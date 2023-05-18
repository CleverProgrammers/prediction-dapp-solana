import { createContext, useCallback, useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";

import { getProgram, getMasterAccountPk, getBetAccountPk } from "../utils";
import toast from "react-hot-toast";

export const GlobalContext = createContext({
  isConnected: null,
  wallet: null,
  hasUserAccount: null,
  allBets: null,
  fetchBets: null,
});

export const GlobalState = ({ children }) => {
  const [program, setProgram] = useState();
  const [isConnected, setIsConnected] = useState();
  const [masterAccount, setMasterAccount] = useState();
  const [allBets, setAllBets] = useState();
  const [userBets, setUserBets] = useState();

  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  // Set program
  useEffect(() => {
    if (connection) {
      setProgram(getProgram(connection, wallet ?? {}));
    } else {
      setProgram(null);
    }
  }, [connection, wallet]);

  // Check wallet connection
  useEffect(() => {
    setIsConnected(!!wallet?.publicKey);
  }, [wallet]);

  const fetchMasterAccount = useCallback(async () => {
    if (!program) return;

    try {
      const masterAccountPk = await getMasterAccountPk();
      const masterAccount = await program.account.master.fetch(masterAccountPk);
      setMasterAccount(masterAccount);
    } catch (e) {
      console.log("Couldn't fetch master account:", e.message);
      setMasterAccount(null);
    }
  }, [program]);

  // Check for user account
  useEffect(() => {
    if (!masterAccount && program) {
      fetchMasterAccount();
    }
  }, [masterAccount, program]);

  const fetchBets = useCallback(async () => {
    if (!program) return;
    // console.log(program)
    const allBetsResult = await program.account.bet.all();
    const allBets = allBetsResult.map((post) => post.account);
    setAllBets(allBets);

    // Filter user bets
    const userPk = program.provider.publicKey;
    const userBets = allBets.filter(
      (bet) =>
        userPk?.equals(bet.predictionA.player) ||
        (bet.PredictionB?.player && userPk.equals(bet.PredictionB.player))
    );
    setUserBets(userBets);
  }, [program]);

  // Get and update allBets
  useEffect(() => {
    // Fetch allBets if allBets don't exists
    if (!allBets) {
      fetchBets();
    }
  }, [allBets, fetchBets]);

  // Airdrop when the balance is less than 1 SOL
  const airdrop = async () => {
    if (!connection || !wallet?.publicKey) return;
    const balance = await connection.getBalance(wallet.publicKey);
    if (balance < LAMPORTS_PER_SOL) {
      const txHash = await connection.requestAirdrop(
        wallet.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(txHash);
    }
  };

  const createBet = useCallback(
    async (amount, price, duration, pythPriceKey) => {
      if (!masterAccount) return;

      try {
        await airdrop();
        const betId = masterAccount.lastBetId.addn(1);
        const res = await getBetAccountPk(betId);
        console.log({ betPk: res });
        const txHash = await program.methods
          .createBet(amount, price, duration, pythPriceKey)
          .accounts({
            bet: await getBetAccountPk(betId),
            master: await getMasterAccountPk(),
            player: wallet.publicKey,
          })
          .rpc();
        await connection.confirmTransaction(txHash);
        console.log("Created bet", txHash);
        toast.success("Created bet!");
      } catch (e) {
        toast.error("Failed to create bet!");
        console.log("Couldn't create bet:", e.message);
      }
    },
    [masterAccount]
  );

  const enterBet = useCallback(
    async (price, bet) => {
      console.log({ masterAccount });
      if (!masterAccount) return;

      try {
        await airdrop();
        const txHash = await program.methods
          .enterBet(price)
          .accounts({
            bet: await getBetAccountPk(bet.id),
            player: wallet.publicKey,
          })
          .rpc();
        console.log("Entered bet", txHash);
        toast.success("Entered bet!");
      } catch (e) {
        toast.error("Failed to enter bet!");
        console.log("Couldn't enter bet:", e.message);
      } finally {
        setState("");
      }
    },
    [masterAccount]
  );

  const claimBet = useCallback(
    async (bet) => {
      if (!masterAccount) return;

      try {
        await airdrop();
        const txHash = await program.methods
          .claimBet()
          .accounts({
            bet: await getBetAccountPk(bet.id),
            pyth: bet.pythPriceKey,
            playerA: bet.predictionA.player,
            playerB: bet.predictionB.player,
            signer: wallet.publicKey,
          })
          .rpc();
        console.log("Claimed bet", txHash);
        toast.success("Claimed bet!");
      } catch (e) {
        toast.error("Failed to claim bet!");
        console.log("Couldn't claim bet:", e.message);
      } finally {
        setState("");
      }
    },
    [masterAccount]
  );

  const closeBet = useCallback(
    async (bet) => {
      if (!masterAccount) return;

      try {
        await airdrop();
        const txHash = await program.methods
          .closeBet()
          .accounts({
            bet: await getBetAccountPk(bet.id),
            player: wallet.publicKey,
          })
          .rpc();
        console.log("Closed bet", txHash);
        toast.success("Closed bet!");
      } catch (e) {
        toast.error("Failed to close bet!");
        console.log("Couldn't close bet:", e.message);
      } finally {
        setState("");
      }
    },
    [masterAccount]
  );

  return (
    <GlobalContext.Provider
      value={{
        isConnected,
        wallet,
        allBets,
        userBets,
        fetchBets,
        createBet,
        enterBet,
        claimBet,
        closeBet,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
