import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { RootState } from "../../app/store";

interface Props {
    children: JSX.Element;
}

export default function ProtectedRoute({ children }: Props) {
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}