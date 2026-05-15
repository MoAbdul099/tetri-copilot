import { SignIn } from '@clerk/clerk-react';
import AuthLayout from '../../../components/layout/AuthLayout.jsx';

export default function SignInPage() {
  return (
    <AuthLayout>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
      />
    </AuthLayout>
  );
}
