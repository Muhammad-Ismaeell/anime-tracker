import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { AuthAPI } from "../api/auth.api";
import { useNavigate } from "react-router-dom";
import GoogleSignIn from "./GoogleSignIn";


export default function GoogleLoginButton(){

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [error,setError] = useState(null);


    const handleGoogleLogin = async (credentialResponse)=>{

        console.log("STEP 1 GOOGLE CALLBACK");

        try {

            const res = await AuthAPI.googleLogin(
                credentialResponse.credential
            );

            console.log("STEP 2 BACKEND:", res.data);


            const {
                access,
                refresh,
                user
            } = res.data;


            console.log("STEP 3 TOKENS:", access);


            login(
                access,
                refresh,
                user
            );


            console.log("STEP 4 BEFORE NAV");

            navigate("/");

        }
        catch(err){

            console.log("GOOGLE ERROR", err);

        }

    };


    return (
        <>
            <GoogleSignIn
                onSuccess={handleGoogleLogin}
                onError={()=>{
                    setError("Google login failed");
                }}
            />

            {error && <p>{error}</p>}
        </>
    );
}