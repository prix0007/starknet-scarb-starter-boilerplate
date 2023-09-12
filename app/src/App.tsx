import { useBlock, useContract } from "@starknet-react/core";
import WalletBar from "./components/WalletBar";
import { ReactNode, useEffect, useState } from "react";
import { useStarknet } from "@starknet-react/core/dist/providers";

import { ABIForm, CallbackReturnType } from "starknet-abi-forms";
import "starknet-abi-forms/index.css";
function App() {
  const { data, isLoading, isError } = useBlock({
    refetchInterval: 3000,
  });

  const [inputContract, setContract] = useState<string | undefined>(undefined);

  const [abi, setAbi] = useState<any>();

  const { library } = useStarknet();
  useEffect(() => {
    if (inputContract) {
      library
        .getClassAt(inputContract)
        .then((res) => {
          setAbi(res?.abi);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [inputContract]);

  const { contract } = useContract({
    abi,
    address: inputContract,
  });
  const [responses, setResponses] = useState<Record<string, ReactNode>>({});

  const handleCallback = async (res: CallbackReturnType) => {
    try {
      if (res.stateMutability === "view") {
        const l_res = await contract?.call(res.functionName, res?.starknetjs);
        setResponses({
          ...responses,
          [res.functionName]: <div>0x{l_res?.toString(16)}</div>,
        });
      }
      if (res.stateMutability === "external") {
        const l_res = await contract?.invoke(res.functionName, res?.starknetjs);
        setResponses({
          ...responses,
          [res.functionName]: (
            <div> Transaction : {l_res?.transaction_hash}</div>
          ),
        });
      }
    } catch (e: any) {
      console.error(e?.message ?? e);
    }
  };

  return (
    <main>
      <p>
        Get started by editing&nbsp;
        <code>pages/index.tsx</code>
      </p>
      <input
        placeholder="Input contract address here"
        value={inputContract}
        onChange={(e) => setContract(e.target.value)}
      />
      <div>
        {isLoading
          ? "Loading..."
          : isError
          ? "Error while fetching the latest block hash"
          : `Latest block hash: ${data?.block_hash}`}
      </div>
      <WalletBar />
      <ABIForm abi={abi} callBackFn={handleCallback} responses={responses} />
    </main>
  );
}

export default App;
