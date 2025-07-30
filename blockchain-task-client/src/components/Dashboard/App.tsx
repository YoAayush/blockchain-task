"use client";

import { useEffect, useState } from "react";
import { useActiveAccount, useWalletBalance, useSendTransaction } from "thirdweb/react";
import { Clock, Copy, ExternalLink, Send, Wallet } from "lucide-react";
import { client } from "../../client";
import { sepolia } from "thirdweb/chains";
import { ConnectButton } from "thirdweb/react";
// import { TransactionButton } from "thirdweb/react";
import {
    getContract,
    // prepareContractCall,
} from "thirdweb";
import { parseUnits, ethers } from "ethers";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();
    const account = useActiveAccount();
    const { data, isLoading, isError } = useWalletBalance({
        chain: sepolia,
        address: account?.address,
        client,
    });

    // console.log("account", account);
    // console.log("data", data);
    // console.log("balance", data?.displayValue, data?.symbol);

    const contract = getContract({
        address: import.meta.env.VITE_CONTRACT_ADDRESS,
        client,
        chain: sepolia,
    });

    // console.log("contract", contract);
    // console.log("contract", contract?.address, contract?.chain.id);

    const [tab, setTab] = useState<"send" | "history">("send")
    const [recipientAddress, setRecipientAddress] = useState("")
    const [amount, setAmount] = useState("")
    const [loadinghistory, setLoadingHistory] = useState(false);
    const [transactionHistory, setTransactionHistory] = useState([]);
    const [balance, setBalance] = useState("");
    const [transactionPending, setTransactionPending] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    // const formatAddress = (address: string) => {
    //     return `${address.slice(0, 6)}...${address.slice(-4)}`
    // }

    const apiKey = import.meta.env.VITE_APIKEY;
    const apiKeyToken = import.meta.env.VITE_APIKEYTOKEN;

    const fetchTokenBalance = async () => {
        try {
            setLoadingHistory(true);
            const BalanceResponse = await axios.get(`${apiKey}/api?chainid=${sepolia.id}&module=account&action=balance&address=${account?.address}&tag=latest&apikey=${apiKeyToken}`);
            const TransactionListResponse = await axios.get(`${apiKey}/api?chainid=${sepolia.id}&module=account&action=txlist&address=${account?.address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${apiKeyToken}`);

            const BalanceResult = BalanceResponse.data;
            const TransactionListResult = TransactionListResponse.data;

            if (BalanceResult.status === "1" && TransactionListResult.status === "1") {
                const balance = ethers.formatEther(BalanceResult.result);
                const transactions = TransactionListResult.result;
                setBalance(balance);
                setTransactionHistory(transactions.reverse());
            } else {
                console.error("Error fetching token balance:", BalanceResult.message);
                console.error("Error fetching transaction list:", TransactionListResult.message);
            }
        } catch (error) {
            console.error("Error fetching token balance:", error);
            toast.error("Failed to fetch token balance or transaction history. Please try again later.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
            });
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchTokenBalance();

        // Call every 5 seconds
        const interval = setInterval(() => {
            fetchTokenBalance();
        }, 5000);

        return () => clearInterval(interval);

    }, [account?.address]);

    // const MakeTransaction = async () => {
    //     const parsedAmount = parseUnits(amount, 18);
    //     const transaction = prepareContractCall({
    //         contract,
    //         method: "function transfer(address to, uint256 amount)",
    //         params: [recipientAddress, ethers.parseEther("0.0001")],
    //     });
    //     return transaction;
    // }

    const { mutate: sendTransaction, isPending } = useSendTransaction();
    const MakeTransaction = async () => {
        if (!recipientAddress || !amount) {
            toast.error("Please enter a valid recipient address and amount.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
            });
            return;
        }
        sendTransaction({
            to: recipientAddress,
            value: parseUnits(amount, 18),
            chain: sepolia,
            client: client
        });
        setTransactionPending(true);

        setTimeout(() => {
            setTransactionPending(false);
            setRecipientAddress("");
            setAmount("");
            toast.success("Transaction sent successfully!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
            });
        }, 8000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Wallet Dashboard</h1>
                        <p className="text-slate-600">Manage your tokens and transactions securely</p>
                    </div>
                </div>

                <div className="max-w-2xl m-auto bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 p-6 rounded-2xl shadow-xl mb-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Wallet className="w-6 h-6" />
                            Wallet Overview
                        </h2>
                        {/* <button className="text-sm flex items-center gap-2 text-red-100 border border-red-200/50 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-all duration-200 backdrop-blur-sm">
                            <LogOut size={16} /> Disconnect
                        </button> */}
                        <ConnectButton
                            client={client}
                            onConnect={() => toast.success("Connected successfully!", {
                                position: "top-right",
                                autoClose: 5000,
                                hideProgressBar: false,
                            })}
                            onDisconnect={() => {
                                toast.success("Disconnected successfully!", {
                                    position: "top-right",
                                    autoClose: 5000,
                                    hideProgressBar: false,
                                }); navigate("/");
                            }}

                        />
                    </div>

                    <div className="mb-6 relative z-10">
                        <div className="bg-white/15 backdrop-blur-sm p-3 rounded-lg inline-flex items-center gap-3 border border-white/20">
                            <span className="font-mono text-sm">{account?.address ? account.address : "0x..."}</span>
                            <button
                                onClick={() => copyToClipboard(account?.address || "")}
                                className="hover:bg-white/20 p-1 rounded transition-colors"
                            >
                                <Copy size={16} className="cursor-pointer" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 relative z-10">
                        <div className="bg-white/15 backdrop-blur-sm p-5 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200">
                            <div className="flex justify-between items-center mb-3">
                                <p className="text-sm text-blue-100">ETH Balance</p>
                                {/* <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{network}</span> */}
                            </div>
                            <p className="text-2xl font-bold">
                                {isLoading ? "..." : balance || "0.0000"} {data?.symbol || "ETH"}
                            </p>
                        </div>
                        {/* <div className="bg-white/15 backdrop-blur-sm p-5 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200">
                            <div className="flex justify-between items-center mb-3">
                                <p className="text-sm text-blue-100">Token Balance</p>
                                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">MyToken</span>
                            </div>
                            <p className="text-2xl font-bold">{isLoading ? "..." : balance || "0.00"} MYT</p>
                        </div> */}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setTab("send")}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${tab === "send"
                                ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                                }`}
                        >
                            <Send size={16} />
                            Send Tokens
                        </button>
                        <button
                            onClick={() => setTab("history")}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${tab === "history"
                                ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                                }`}
                        >
                            <Clock size={16} />
                            Transaction History
                        </button>
                    </div>

                    {tab === "send" && (
                        <div className="p-6">
                            <h3 className="text-lg text-gray-700 font-semibold mb-6 flex items-center gap-2">
                                <Send className="w-5 h-5 text-green-600" />
                                Send MyTokens
                            </h3>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
                                    <input
                                        type="text"
                                        placeholder="0x..."
                                        value={recipientAddress}
                                        onChange={(e) => setRecipientAddress(e.target.value)}
                                        className="w-full border text-black border-gray-300 px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (MYT)</label>
                                    <input
                                        type="text"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full border text-black border-gray-300 px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    />
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <p className="text-sm text-amber-800 flex items-start gap-2">
                                        <span className="text-amber-600 font-semibold">⚠️</span>
                                        Make sure the recipient address is correct. Transactions cannot be reversed.
                                    </p>
                                </div>

                                <button
                                    disabled={!recipientAddress || !amount}
                                    className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all duration-200 ${recipientAddress && amount
                                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                                        : "bg-gray-300 cursor-not-allowed text-gray-500"
                                        }`}
                                    onClick={MakeTransaction}
                                >
                                    {/* <Send size={16} /> Send Tokens */}
                                    {transactionPending ? (
                                        <span>
                                            <Clock className="w-5 h-5" /> Sending...
                                        </span>
                                    ) : (
                                        <><Send size={16} /> send Tokens</>
                                    )}
                                </button>
                                {/* <TransactionButton
                                    transaction={() => { return MakeTransaction(); }}
                                    onTransactionConfirmed={() => alert("Transaction sent!")}
                                    onError={
                                        (error) => {
                                            console.error("Transaction error:", error);
                                            alert("Failed to send transaction. Please check the console for details.");
                                        }
                                    }
                                >
                                    Send Transaction
                                </TransactionButton> */}
                            </div>
                        </div>
                    )}

                    {tab === "history" && (
                        loadinghistory ? (
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-purple-600" />
                                    Loading Transaction History...
                                </h3>
                                <p className="text-gray-500">Please wait while we fetch your transaction history.</p>
                            </div>
                        ) : (
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-purple-600" />
                                    Transaction History
                                </h3>

                                {transactionHistory.length > 0 ? (
                                    <ul className="space-y-4">
                                        {transactionHistory.map((tx: any) => (
                                            <li key={tx.hash} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm text-gray-500">Hash:</span>
                                                    <span className="font-mono text-black text-sm">{tx.hash}</span>
                                                </div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm text-gray-500">From:</span>
                                                    <span className="font-mono text-black text-sm">{tx.from}</span>
                                                </div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm text-gray-500">To:</span>
                                                    <span className="font-mono text-black text-sm">{tx.to}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500">Amount:</span>
                                                    <span className="font-mono text-black text-sm">{ethers.formatEther(tx.value)} {data?.symbol}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">No transactions found.</p>
                                )}
                            </div>
                        )
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg text-gray-700 font-semibold mb-6 flex items-center gap-2">
                        Contract Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Token Name</p>
                                <p className="font-semibold text-gray-900">{contract?.chain.nativeCurrency?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Symbol</p>
                                <p className="font-semibold text-gray-900">{contract?.chain.nativeCurrency?.symbol}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Decimals</p>
                                <p className="font-semibold text-gray-900">{contract?.chain.nativeCurrency?.decimals}</p>
                            </div>
                            {/* <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Supply</p>
                                <p className="font-semibold text-gray-900">1,000,000 {contract?.chain.nativeCurrency?.symbol}</p>
                            </div> */}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <p className="text-sm font-medium text-gray-600 mb-3">Contract Address</p>
                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                            <span className="bg-white text-black px-3 py-2 rounded font-mono text-sm flex-1 border">{contract?.address}</span>
                            <button
                                onClick={() => copyToClipboard(contract?.address || "")}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <Copy size={16} className="cursor-pointer text-gray-600" />
                            </button>
                        </div>
                        {/* <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            {network}
                        </p> */}
                    </div>
                </div>
            </div>
        </div >
    );
}
