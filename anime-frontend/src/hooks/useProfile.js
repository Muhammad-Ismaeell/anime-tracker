import { useContext } from "react";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { AuthContext } from "../context/AuthContext";
import {
    fetchProfile,
    updateProfile,
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


export function useUpdateProfile() {

    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            updateProfile,

        onSuccess: (updatedProfile) => {

            queryClient.setQueryData(
                queryKeys.users.profile,
                updatedProfile
            );

            queryClient.invalidateQueries({
                queryKey:
                    queryKeys.users.profile,
            });
        },
    });
}