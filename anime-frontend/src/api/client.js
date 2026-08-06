import axios from "axios";
import { tokenService } from "../auth/tokenService";
import { AuthAPI } from "./auth.api";


const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        "http://127.0.0.1:8000/api"

});


let isRefreshing = false;

let failedQueue = [];


const processQueue = (error, token = null) => {

    failedQueue.forEach(prom => {

        if(error){
            prom.reject(error);
        }
        else{
            prom.resolve(token);
        }

    });

    failedQueue = [];
};



api.interceptors.request.use((config)=>{

    const token = tokenService.getAccess();

    if(token){
        config.headers.Authorization =
            `Bearer ${token}`;
    }

    return config;

});



api.interceptors.response.use(

    response => response,


    async error => {


        const original =
            error.config;


        if(
            error.response?.status === 401 &&
            !original._retry &&
            !original.url.includes("/auth/refresh/")
        ){


            if(isRefreshing){

                return new Promise(
                    (resolve,reject)=>{

                        failedQueue.push({
                            resolve,
                            reject
                        });

                    }
                )
                .then(token=>{

                    original.headers.Authorization =
                    `Bearer ${token}`;

                    return api(original);

                });

            }



            original._retry = true;

            isRefreshing = true;


            const refresh =
                tokenService.getRefresh();



            if(!refresh){

                tokenService.clear();

                window.location.href="/login";

                return Promise.reject(error);
            }



            try{


                const res =
                    await AuthAPI.refresh(refresh);


                const newAccess =
                    res.data.access;


                tokenService.setAccess(newAccess);



                processQueue(
                    null,
                    newAccess
                );



                original.headers.Authorization =
                    `Bearer ${newAccess}`;



                return api(original);



            }

            catch(err){


                processQueue(
                    err,
                    null
                );


                tokenService.clear();


                window.location.href="/login";


                return Promise.reject(err);

            }


            finally{

                isRefreshing=false;

            }

        }


        return Promise.reject(error);

    }

);


export default api;