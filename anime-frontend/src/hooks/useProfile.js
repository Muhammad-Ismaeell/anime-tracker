import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import api from "../../api/client";
import { queryKeys } from "../../lib/querykeys";
import toast from "react-hot-toast";


export function useProfile() {
    return useQuery({
        queryKey: queryKeys.users.profile,

        queryFn: async () => {
            const res = await api.get(
                "/users/profile/"
            );

            return res.data.data;
        },
    });
}


export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData) => {
            const response = await api.patch(
                "/users/profile/update/",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            return response;
        },

        onSuccess: async (response) => {
            const updatedProfile =
                response.data.data;

            // Immediately update the cached value.
            queryClient.setQueryData(
                queryKeys.users.profile,
                updatedProfile
            );

            // Then mark it stale and refetch the
            // current profile query.
            await queryClient.invalidateQueries({
                queryKey: queryKeys.users.profile,
            });

            toast.success(
                "Profile updated!"
            );
        },

        onError: (error) => {
            const message =
                error.response?.data?.detail ||
                "Failed to update profile.";

            toast.error(message);
        },
    });
}