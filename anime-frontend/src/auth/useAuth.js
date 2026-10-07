import { useMutation } from "@tanstack/react-query";
import { AuthAPI } from "../api/auth.api";


export function useLogin() {

    return useMutation({
        mutationFn: AuthAPI.login
    });

}

export function useRegister() {

    return useMutation({
        mutationFn: AuthAPI.register
    });

}

export function useResendVerification() {
    return useMutation({
        mutationFn: AuthAPI.resendVerification,
    });
}