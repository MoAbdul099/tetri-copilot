import { SignUp } from '@clerk/clerk-react';
import AuthLayout from '../../../components/layout/AuthLayout.jsx';

export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/dashboard"
      />
    </AuthLayout>
  );
}
