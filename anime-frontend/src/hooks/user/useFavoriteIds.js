import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";

import { AuthContext } from "../../context/AuthContext";
import { FavoriteAPI } from "../../api/favorites";


export function useFavoriteIds() {

    const {
        user,
        isAuthenticated,
        loading,
    } = useContext(AuthContext);


    const userId = user?.id ?? null;


    const query = useQuery({

        queryKey: [
            "favoriteIds",
            userId,
        ],


        queryFn: async () => {
            const ids = await FavoriteAPI.listIds();


            const result = new Set(
                ids
                    .filter((id) => id != null)
                    .map(String)
            );

        

            return result;
        },


        enabled:
            !loading &&
            isAuthenticated &&
            userId !== null,


        staleTime:
            1000 * 60 * 5,


        placeholderData:
            (previousData) =>
                previousData,
    });


    return (
        query.data ??
        new Set()
    );
}