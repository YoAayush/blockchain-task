
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home/App";
import Dashboard from "./components/Dashboard/App";
import ProtectedRoute from "./ProtectedRoute";

export function App() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
		</Routes>
	);
}
