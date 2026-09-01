
import { useQuery } from "@tanstack/react-query";
import api from "../../api/client";
import { queryKeys } from "../../lib/querykeys";


export function useDashboard() {

    return useQuery({

        queryKey: queryKeys.users.dashboard,

        queryFn: async () => {

            const response = await api.get(
                "/users/dashboard/"
            );

            return response.data?.data ?? {};

        },

    });

}

