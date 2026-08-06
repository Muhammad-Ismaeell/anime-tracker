import { useMemo } from "react";
import { useFavorites } from "./useFavorites";


export function useFavoriteIds(){

    const {
        data
    } = useFavorites();


    return useMemo(()=>{

        const favorites =
            data?.results ?? [];


        return new Set(
            favorites
            .map(item =>
                String(
                    item.anime?.id
                )
            )
            .filter(Boolean)
        );


    },[data]);

}