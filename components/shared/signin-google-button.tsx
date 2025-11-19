import { SignInWithGoogle } from '@/lib/actions/user.actions';
import { Button } from '../ui/button';

export default function SignInGoogleButton() {
	return (
		<form action={SignInWithGoogle}>
			<Button variant="outline">Sign in with Google</Button>
		</form>
	);
}
