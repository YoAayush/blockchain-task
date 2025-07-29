import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBlockchainContext } from "./Context";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const { isConnected } = useBlockchainContext();
    // console.log("ProtectedRoute isConnected:", isConnected);

    useEffect(() => {
        if (!isConnected) {
            navigate("/");
        }
    }, [isConnected, navigate]);

    if (!isConnected) return null;

    return <>{children}</>;
}
