'use client';

import { useState } from 'react';
import { useFileUpload, type FileMetadata, type FileWithPreview } from '@/hooks/use-file-upload';
import {
	Alert,
	AlertContent,
	AlertDescription,
	AlertIcon,
	AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CloudUpload, ImageIcon, TriangleAlert, Upload, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUploadThing } from '@/lib/uploadthing';
import { toast } from 'sonner';

interface CoverUploadProps {
	maxSize?: number;
	accept?: string;
	className?: string;
	onImageChange?: (imageUrl: string | null) => void;
	defaultCoverImage?: string;
}

export default function BannerUpload({
	maxSize = 4 * 1024 * 1024, // 4MB
	accept = 'image/*',
	className,
	onImageChange,
	defaultCoverImage = '',
}: CoverUploadProps) {
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [imageLoading, setImageLoading] = useState(true);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [imageUrl, setImageUrl] = useState(defaultCoverImage);

	const { isUploading, startUpload } = useUploadThing('imageUploader', {
		onClientUploadComplete: res => {
			setUploadError(null);
			setUploadProgress(0);
			setImageLoading(true);
			onImageChange?.(res[0].ufsUrl);
			setImageUrl(res[0].ufsUrl);
			toast.success('Image uploaded successfully');
		},
		onUploadError: err => {
			setUploadError(err.message);
			setUploadProgress(0);
			setImageLoading(false);
			setImageUrl('');
			toast.error('Error uploading file');
		},
		onUploadProgress: progress => {
			setUploadProgress(progress);
		},
	});

	const [
		{ files, isDragging, errors },
		{ handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, getInputProps },
	] = useFileUpload({
		maxFiles: 1,
		maxSize,
		accept,
		multiple: false,
		onFilesChange: files => {
			if (files.length > 0) {
				startUpload([files[0].file as File]);
			}
		},
	});

	const removeBannerImage = () => {
		setImageUrl('');
		onImageChange?.(null);
	};

	const retryUpload = () => {
		setUploadError(null);
		openFileDialog();
	};

	const currentFile = files[0] as FileWithPreview;
	console.log('currentFile: ', currentFile);
	const previewUrl = currentFile?.preview;
	console.log('previewUrl: ', previewUrl);
	const displayUrl = isUploading ? previewUrl : imageUrl;
	console.log('displayUrl: ', displayUrl);
	console.log('imgUrl', imageUrl);
	const hasImage = !!displayUrl;
	console.log('hasImage: ', hasImage);

	return (
		<div className={cn('w-full space-y-4', className)}>
			{/* Banner Upload Area */}
			<div
				className={cn(
					'group relative overflow-hidden rounded-xl transition-all duration-200 border border-border',
					isDragging
						? 'border-dashed border-primary bg-primary/5'
						: hasImage
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

				{hasImage ? (
					<>
						{/* Cover Image Display */}
						<div className="relative aspect-21/7 w-full">
							{/* Loading placeholder */}
							{imageLoading && (
								<div className="absolute inset-0 animate-pulse bg-muted flex items-center justify-center">
									<div className="flex flex-col items-center gap-2 text-muted-foreground">
										<ImageIcon className="size-5" />
										<span className="text-sm">Loading image...</span>
									</div>
								</div>
							)}

							{/* Actual image */}
							<img
								key={displayUrl}
								src={displayUrl}
								alt="Banner"
								className={cn(
									'h-full w-full object-cover object-center transition-opacity duration-300',
									imageLoading ? 'opacity-0' : 'opacity-100'
								)}
								onLoad={() => setImageLoading(false)}
								onError={() => setImageLoading(false)}
							/>

							{/* Overlay on hover */}
							{!isUploading && (
								<div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/40" />
							)}

							{/* Action buttons overlay */}
							{!isUploading && (
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
											Change Cover
										</Button>
										<Button
											onClick={removeBannerImage}
											type="button"
											variant="destructive"
											size="sm"
										>
											<XIcon />
											Remove
										</Button>
									</div>
								</div>
							)}

							{/* Upload progress */}
							{isUploading && (
								<div className="absolute inset-0 flex items-center justify-center bg-black/40">
									<div className="relative">
										<svg className="size-16 -rotate-90" viewBox="0 0 64 64">
											<circle
												cx="32"
												cy="32"
												r="28"
												fill="none"
												stroke="currentColor"
												strokeWidth="4"
												className="text-white/20"
											/>
											<circle
												cx="32"
												cy="32"
												r="28"
												fill="none"
												stroke="currentColor"
												strokeWidth="4"
												strokeDasharray={`${2 * Math.PI * 28}`}
												strokeDashoffset={`${2 * Math.PI * 28 * (1 - uploadProgress / 100)}`}
												className="text-white transition-all duration-300"
												strokeLinecap="round"
											/>
										</svg>
										<div className="absolute inset-0 flex items-center justify-center">
											<span className="text-sm font-medium text-white">
												{Math.round(uploadProgress)}%
											</span>
										</div>
									</div>
								</div>
							)}
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
								Recommended size: 1200x514px • Max size: 4MB
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

			{/* Upload Error */}
			{uploadError && (
				<Alert variant="destructive" appearance="light" className="mt-5">
					<AlertIcon>
						<TriangleAlert />
					</AlertIcon>
					<AlertContent>
						<AlertTitle>Upload failed</AlertTitle>
						<AlertDescription>
							<p>{uploadError}</p>
							<Button onClick={retryUpload} variant="destructive" size="sm">
								Retry Upload
							</Button>
						</AlertDescription>
					</AlertContent>
				</Alert>
			)}

			{/* Upload Tips */}
			<div className="rounded-lg bg-muted/50 p-4">
				<h4 className="mb-2 text-sm font-medium">Banner Image Guidelines</h4>
				<ul className="space-y-1 text-xs text-muted-foreground">
					<li>• Use high-quality images with good lighting and composition</li>
					<li>• Recommended aspect ratio: 21:9 (ultrawide) for best results</li>
					<li>• Avoid images with important content near the edges</li>
					<li>• Supported formats: JPG, PNG, WebP</li>
				</ul>
			</div>
		</div>
	);
}
