import { useQuery, useQueryClient,useMutation } from "@tanstack/react-query";
import api from "../../api/client";
import { queryKeys } from "../../lib/querykeys";
import toast from "react-hot-toast";

export function useProfile() {
    return useQuery({
        queryKey: queryKeys.users.profile,
        queryFn: async () => {
            const res = await api.get("/users/profile/");
            return res.data.data; // ✅ FIXED HERE
        },
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) =>
            api.patch("/users/profile/update/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }),

        onSuccess: (res) => {
            
            queryClient.setQueryData(
                queryKeys.users.profile,
                res.data
            );
            toast.success("Profile updated!");
        },
        
        onError: () => {
            toast.error("Failed to update profile");
        }

    });
}