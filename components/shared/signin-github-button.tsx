import { Button } from '../ui/button';
import { Github } from 'lucide-react';

export default function SignInGithupButton() {
	return (
		<Button variant="outline" className="flex items-center gap-2">
			<Github /> Github
		</Button>
	);
}
