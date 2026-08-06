import { GoogleLogin } from "@react-oauth/google";

export default function GoogleSignIn({onSuccess,onError}) {

    return (
        <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
        />
    );

}