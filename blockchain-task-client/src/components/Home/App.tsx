import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "../../client";
import { useBlockchainContext } from "../../Context";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function Home() {
    const { isConnected, setIsConnected } = useBlockchainContext();
    // console.log("Home component rendered, isConnected:", isConnected);

    const navigate = useNavigate();
    const account = useActiveAccount();

    useEffect(() => {
        if (account?.address) {
            navigate("/Dashboard");
        }
    }, [account, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-bold mb-4">Welcome to the Blockchain Task Client</h1>
            <ConnectButton
                client={client}
                onConnect={() => {
                    toast.success("Connected successfully!", {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                    });
                    setIsConnected(true);
                }}
                onDisconnect={() => {
                    toast.info("Disconnected successfully!", {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                    });
                    setIsConnected(false);
                }}
            />
            <p className="mt-4">Connect your wallet to get started!</p>
        </div>
    );
}