import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
    return (
        <AuthenticateWithRedirectCallback
            signInForceRedirectUrl="/user/dashboard"
            signUpForceRedirectUrl="/user/dashboard"
        />
    );
}
