'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoonIcon, SunIcon, SunMoon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ModeToggle() {
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();

	useEffect(function () {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant={'ghost'}>
						{theme === 'system' ? <SunMoon /> : theme === 'light' ? <SunIcon /> : <MoonIcon />}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent onCloseAutoFocus={e => e.preventDefault()}>
					<DropdownMenuLabel>Appearance</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuCheckboxItem checked={theme === 'light'} onClick={() => setTheme('light')}>
						<SunIcon /> Light
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem checked={theme === 'dark'} onClick={() => setTheme('dark')}>
						<MoonIcon /> Dark
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem checked={theme === 'system'} onClick={() => setTheme('system')}>
						<SunMoon /> System
					</DropdownMenuCheckboxItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
