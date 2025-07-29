import { useContext, createContext, useState, Dispatch, SetStateAction } from "react";

type BlockchainContextType = {
    isConnected: boolean;
    setIsConnected: Dispatch<SetStateAction<boolean>>;
};

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export const BlockchainContextProvider = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {

    const [isConnected, setIsConnected] = useState(false);

    return (
        <BlockchainContext.Provider value={{ isConnected, setIsConnected }}>
            {children}
        </BlockchainContext.Provider>
    );
}

export const useBlockchainContext = () => {
    const context = useContext(BlockchainContext);
    if (!context) {
        throw new Error("useBlockchainContext must be used within a BlockchainContextProvider");
    }
    return context;
};