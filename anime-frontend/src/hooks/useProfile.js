import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";

import { AuthContext } from "../context/AuthContext";
import {
    fetchProfile,
} from "../api/profile";
import { queryKeys } from "../lib/querykeys";


export function useProfile() {

    const {
        isAuthenticated,
        loading,
    } = useContext(AuthContext);

    return useQuery({
        queryKey:
            queryKeys.users.profile,

        queryFn:
            fetchProfile,

        enabled:
            !loading &&
            isAuthenticated,

        staleTime:
            1000 * 60 * 5,

    });
}