'use client';

import {
	Alert,
	AlertContent,
	AlertDescription,
	AlertIcon,
	AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useFileUpload, type FileWithPreview } from '@/hooks/use-file-upload';
import { cn } from '@/lib/utils';
import { CloudUpload, ImageIcon, TriangleAlert, Upload, XIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface BannerUploadProps {
	maxSize?: number;
	accept?: string;
	className?: string;
	onBannerChange?: (banner: FileWithPreview | null) => void;
	onRemove?: () => void;
	defaultBanner?: string;
}

export default function CoverUpload({
	maxSize = 4 * 1024 * 1024, // 4MB default
	accept = 'image/*',
	className,
	onBannerChange,
	onRemove,
	defaultBanner,
}: BannerUploadProps) {
	const [
		{ files, isDragging, errors },
		{
			handleDragEnter,
			handleDragLeave,
			handleDragOver,
			handleDrop,
			openFileDialog,
			removeFile,
			getInputProps,
			clearFiles,
		},
	] = useFileUpload({
		maxFiles: 1,
		maxSize,
		accept,
		multiple: false,
	});

	const currentFile = files[0];
	const previewUrl = currentFile?.preview || defaultBanner;
	const prevDefaultBannerRef = useRef(defaultBanner);

	useEffect(() => {
		const prevDefaultBanner = prevDefaultBannerRef.current;
		if (currentFile && defaultBanner && prevDefaultBanner !== defaultBanner) {
			clearFiles();
		}
		prevDefaultBannerRef.current = defaultBanner;
	}, [defaultBanner, currentFile, clearFiles]);

	useEffect(() => {
		onBannerChange?.(currentFile || null);
	}, [currentFile, onBannerChange]);

	const removeBannerImage = () => {
		if (currentFile) {
			removeFile(currentFile.id);
		} else if (defaultBanner) {
			onRemove?.();
		}
	};

	return (
		<div className={cn('w-full space-y-4', className)}>
			{/* Banner Upload Area */}
			<div
				className={cn(
					'group relative overflow-hidden rounded-xl transition-all duration-200 border border-border',
					isDragging
						? 'border-dashed border-primary bg-primary/5'
						: previewUrl
						? 'border-border bg-background hover:border-primary/50'
						: 'border-dashed border-muted-foreground/25 bg-muted/30 hover:border-primary hover:bg-primary/5'
				)}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				{/* Hidden file input */}
				<input {...getInputProps()} className="sr-only" />

				{previewUrl ? (
					<>
						{/* Banner Image Display */}
						<div className="relative aspect-29/7 w-full">
							{/* Actual image */}
							<img
								src={previewUrl}
								alt="Banner"
								className={cn('h-full w-full object-cover transition-opacity duration-300')}
							/>

							{/* Overlay on hover */}
							<div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/40" />

							{/* Action buttons overlay */}
							<div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
								<div className="flex gap-2">
									<Button
										onClick={openFileDialog}
										variant="secondary"
										size="sm"
										className="bg-white/90 text-gray-900 hover:bg-white"
										type="button"
									>
										<Upload />
										Change Banner
									</Button>
									<Button onClick={removeBannerImage} variant="destructive" type="button" size="sm">
										<XIcon />
										Remove
									</Button>
								</div>
							</div>
						</div>
					</>
				) : (
					/* Empty State */
					<div
						className="flex aspect-21/7 w-full cursor-pointer flex-col items-center justify-center gap-4 p-8 text-center"
						onClick={openFileDialog}
					>
						<div className="rounded-full bg-primary/10 p-4">
							<CloudUpload className="size-8 text-primary" />
						</div>

						<div className="space-y-2">
							<h3 className="text-lg font-semibold">Upload Banner Image</h3>
							<p className="text-sm text-muted-foreground">
								Drag and drop an image here, or click to browse
							</p>
							<p className="text-xs text-muted-foreground">
								Recommended size: 1200x514px • Max size 4MB
							</p>
						</div>

						<Button variant="outline" size="sm" type="button">
							<ImageIcon />
							Browse Files
						</Button>
					</div>
				)}
			</div>

			{/* Error Messages */}
			{errors.length > 0 && (
				<Alert variant="destructive" appearance="light" className="mt-5">
					<AlertIcon>
						<TriangleAlert />
					</AlertIcon>
					<AlertContent>
						<AlertTitle>File upload error(s)</AlertTitle>
						<AlertDescription>
							{errors.map((error, index) => (
								<p key={index} className="last:mb-0">
									{error}
								</p>
							))}
						</AlertDescription>
					</AlertContent>
				</Alert>
			)}

			{/* Upload Tips */}
			<div className="rounded-lg bg-muted/50 p-4">
				<h4 className="mb-2 text-sm font-medium">Banner Image Guidelines</h4>
				<ul className="space-y-1 text-xs text-muted-foreground">
					<li>• Use high-quality images with good lighting and composition</li>
					<li>• Recommended aspect ratio: 21:7 (ultrawide) for best results</li>
					<li>• Avoid images with important content near the edges</li>
					<li>• Supported formats: JPG, PNG, WebP</li>
				</ul>
			</div>
		</div>
	);
}
