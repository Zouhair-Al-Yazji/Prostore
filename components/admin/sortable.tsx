'use client';

import {
	Alert,
	AlertContent,
	AlertDescription,
	AlertIcon,
	AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sortable, SortableItem, SortableItemHandle } from '@/components/ui/sortable';
import { formatBytes } from '@/hooks/use-file-upload';
import { useUploadThing } from '@/lib/uploadthing';
import { cn } from '@/lib/utils';
import { CircleX, CloudUpload, GripVertical, ImageIcon, TriangleAlert, XIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ImageFile {
	id: string;
	file: File;
	preview: string;
	progress: number;
	status: 'uploading' | 'completed' | 'error';
	error?: string;
	url?: string;
}

type SortableImage = {
	id: string;
	src: string;
	alt: string;
	type: 'default' | 'uploaded';
};

interface ImageUploadProps {
	maxFiles?: number;
	maxSize?: number;
	accept?: string;
	className?: string;
	value?: string[];
	onValueChange?: (imageUrls: string[]) => void;
	onImagesChange?: (images: ImageFile[]) => void;
	onUploadComplete?: (images: ImageFile[]) => void;
}

export default function SortableImageUpload({
	maxFiles = 5, // Changed to 5 as per UI reference
	maxSize = 10 * 1024 * 1024, // 10MB as per UI reference
	accept = 'image/*',
	className,
	value = [],
	onValueChange,
	onImagesChange,
	onUploadComplete,
}: ImageUploadProps) {
	const [images, setImages] = useState<ImageFile[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const [errors, setErrors] = useState<string[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [allImages, setAllImages] = useState<SortableImage[]>([]);

	const onClientUploadComplete = useCallback(
		(res: { name: string; size: number; key: string; ufsUrl: string }[] | undefined) => {
			if (!res) {
				return;
			}
			setImages(prevImages => {
				const updatedImages = prevImages.map(imageFile => {
					const uploadedFile = res.find(uploaded => uploaded.name === imageFile.file.name);
					if (uploadedFile) {
						return {
							...imageFile,
							status: 'completed' as const,
							progress: 100,
							url: uploadedFile.ufsUrl,
						};
					}
					return imageFile;
				});
				return updatedImages;
			});

			setAllImages(prevAllImages =>
				prevAllImages.map(sortableImg => {
					const uploadedFile = res.find(r => r.name === sortableImg.alt);
					if (uploadedFile) {
						return {
							...sortableImg,
							src: uploadedFile.ufsUrl,
						};
					}
					return sortableImg;
				})
			);

			const completedImageUrls = res.map(file => file.ufsUrl);
			if (completedImageUrls.length > 0 && onValueChange) {
				onValueChange([...(value || []), ...completedImageUrls]);
			}

			// onUploadComplete?.(updatedImages); // updatedImages is not available here
			toast.success('Upload completed successfully!');
		},
		[onValueChange, value]
	);

	const onUploadError = useCallback((err: Error) => {
		toast.error(`Upload failed: ${err.message}`);
		setImages(prev =>
			prev.map(img =>
				img.status === 'uploading' ? { ...img, status: 'error', error: err.message } : img
			)
		);
	}, []);

	const onUploadProgress = useCallback((progress: number) => {
		setImages(prev => prev.map(img => (img.status === 'uploading' ? { ...img, progress } : img)));
	}, []);

	const { isUploading, startUpload } = useUploadThing('imageUploader', {
		onClientUploadComplete,
		onUploadError,
		onUploadProgress,
	});

	// Helper function to create SortableImage from ImageFile
	const createSortableImage = useCallback(
		(imageFile: ImageFile): SortableImage => ({
			id: imageFile.id,
			src: imageFile.preview,
			alt: imageFile.file.name,
			type: 'uploaded',
		}),
		[]
	);

	// Sync allImages with the value prop
	useEffect(() => {
		const existingImageUrls = allImages.map(img => img.src);
		const newUrls = (value || []).filter(url => !existingImageUrls.includes(url));

		if (newUrls.length > 0) {
			const imagesToAdd: SortableImage[] = newUrls.map(url => ({
				id: url, // Use URL as a stable ID
				src: url,
				alt: `Product image`,
				type: 'default',
			}));
			setAllImages(prev => [...prev, ...imagesToAdd]);
		}

		// Remove images that are no longer in value
		const urlsInValue = new Set(value || []);
		const imagesToRemove = allImages.filter(
			img => img.type === 'default' && !urlsInValue.has(img.src)
		);

		if (imagesToRemove.length > 0) {
			setAllImages(prev => prev.filter(img => !imagesToRemove.some(rem => rem.id === img.id)));
		}
	}, [value, allImages]);

	const validateFile = (file: File): string | null => {
		if (!file.type.startsWith('image/')) {
			return 'File must be an image';
		}
		if (file.size > maxSize) {
			return `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
		}
		return null;
	};

	const addImages = useCallback(
		async (files: FileList | File[]) => {
			const newImageFiles: ImageFile[] = [];
			const newErrors: string[] = [];

			const currentTotal = images.length + value.length;
			const availableSlots = maxFiles - currentTotal;

			if (files.length > availableSlots) {
				newErrors.push(
					`You can only upload ${availableSlots > 0 ? availableSlots : 0} more image(s).`
				);
			}

			const filesToProcess = Array.from(files).slice(0, availableSlots);

			for (const file of filesToProcess) {
				const error = validateFile(file);
				if (error) {
					newErrors.push(`${file.name}: ${error}`);
					continue;
				}
				newImageFiles.push({
					id: `${file.name}-${file.size}`, // More stable ID
					file,
					preview: URL.createObjectURL(file),
					progress: 0,
					status: 'uploading',
				});
			}

			if (newErrors.length > 0) {
				setErrors(prev => [...prev, ...newErrors]);
			}

			if (newImageFiles.length > 0) {
				setImages(prev => [...prev, ...newImageFiles]);
				setAllImages(prev => [...prev, ...newImageFiles.map(createSortableImage)]);

				const filesToUpload = newImageFiles.map(img => img.file);
				await startUpload(filesToUpload);
			}
		},
		[
			maxFiles,
			maxSize,
			value,
			onImagesChange,
			createSortableImage,
			startUpload,
			images.length, // Dependency on length is lighter than the whole array
		]
	);

	const removeImage = useCallback(
		(id: string) => {
			const imageToRemove = allImages.find(img => img.id === id);
			if (!imageToRemove) return;

			// Remove from the main display list
			setAllImages(prev => prev.filter(img => img.id !== id));

			if (imageToRemove.type === 'uploaded') {
				// If it's a file being uploaded or a completed upload from this session
				setImages(prev => prev.filter(img => img.id !== id));
				URL.revokeObjectURL(imageToRemove.src); // Revoke blob URL
			}

			// If it was a completed upload (from this session or initial value), remove from form value
			if (onValueChange) {
				onValueChange(value.filter(url => url !== imageToRemove.src));
			}
		},
		[allImages, value, onValueChange]
	);

	const handleDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);

			const files = e.dataTransfer.files;
			if (files.length > 0) {
				addImages(files);
			}
		},
		[addImages]
	);

	const openFileDialog = useCallback(() => {
		const input = document.createElement('input');
		input.type = 'file';
		input.multiple = true;
		input.accept = accept;
		input.onchange = e => {
			const target = e.target as HTMLInputElement;
			if (target.files) {
				addImages(target.files);
			}
		};
		input.click();
	}, [accept, addImages]);

	// Handle reordering and update form value
	const handleReorder = useCallback(
		(newItemIds: string[]) => {
			const imageMap = new Map(allImages.map(img => [img.id, img]));
			const newAllImages = newItemIds
				.map(id => imageMap.get(id))
				.filter((item): item is SortableImage => !!item);

			setAllImages(newAllImages);

			const orderedUrls = newAllImages
				.map(item => item.src)
				.filter(url => !url.startsWith('blob:')); // Exclude URLs of images that are still uploading

			if (onValueChange) {
				onValueChange(orderedUrls);
			}

			toast.success('Images reordered successfully!');
		},
		[allImages, onValueChange]
	);

	const totalUploadedImages = images.filter(img => img.status === 'completed').length;
	const totalExistingImages = value?.length || 0;

	return (
		<div className={cn('w-full mx-auto max-w-4xl', className)}>
			{/* Instructions */}
			<div className="mb-4 text-center">
				<p className="text-sm text-muted-foreground">
					Upload up to {maxFiles} images (JPG, PNG, GIF, WebP, max {formatBytes(maxSize)} each).{' '}
					<br />
					Drag and drop images to reorder.
					{images.length > 0 && ` ${images.length}/${maxFiles} uploaded.`}
				</p>
			</div>

			{/* Image Grid with Sortable */}
			<div className="mb-6">
				{/* Combined Images Sortable */}
				<Sortable
					value={allImages.map(item => item.id)}
					onValueChange={handleReorder}
					getItemValue={item => item}
					strategy="grid"
					className="grid grid-cols-5 gap-2.5 auto-rows-fr"
					onDragStart={event => setActiveId(event.active.id as string)}
					onDragEnd={() => setActiveId(null)}
				>
					{allImages.map(item => (
						<SortableItem key={item.id} value={item.id}>
							<div className="flex items-center justify-center rounded-md bg-accent/50 shadow-none shrink-0 relative group border border-border hover:z-10 data-[dragging=true]:z-50 transition-all duration-200 hover:bg-accent/70">
								<img
									src={item.src}
									className="h-[120px] w-full object-cover rounded-md pointer-events-none"
									alt={item.alt}
								/>

								{/* Drag Handle */}
								<SortableItemHandle className="absolute top-2 start-2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing">
									<Button variant="outline" size="icon" className="size-6 rounded-full">
										<GripVertical className="size-3.5" />
									</Button>
								</SortableItemHandle>

								{/* Remove Button Overlay */}
								<Button
									onClick={() => removeImage(item.id)}
									type="button"
									variant="outline"
									size="icon"
									className="shadow-sm absolute top-2 end-2 size-6 opacity-0 group-hover:opacity-100 rounded-full"
								>
									<XIcon className="size-3.5" />
								</Button>
							</div>
						</SortableItem>
					))}
				</Sortable>
			</div>

			{/* Upload Area */}
			<Card
				className={cn(
					'border-dashed shadow-none rounded-md transition-colors',
					isDragging
						? 'border-primary bg-primary/5'
						: 'border-muted-foreground/25 hover:border-muted-foreground/50'
				)}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<CardContent className="text-center">
					<div className="flex items-center justify-center size-8 rounded-full border border-border mx-auto mb-3">
						<CloudUpload className="size-4" />
					</div>
					<h3 className="text-2sm text-foreground font-semibold mb-0.5">
						Choose a file or drag & drop here.
					</h3>
					<span className="text-xs text-secondary-foreground font-normal block mb-3">
						JPEG, PNG, up to {formatBytes(maxSize)}.
					</span>
					<Button
						size="sm"
						onClick={openFileDialog}
						disabled={isUploading || totalUploadedImages + totalExistingImages >= maxFiles}
						type="button"
					>
						{isUploading ? 'Uploading...' : 'Browse File'}
					</Button>
				</CardContent>
			</Card>

			{/* Upload Progress Cards */}
			{images.length > 0 && (
				<div className="mt-6 space-y-3">
					{images.map(imageFile => (
						<Card key={imageFile.id} className="shadow-none rounded-md">
							<CardContent className="flex items-center gap-2 p-3">
								<div className="flex items-center justify-center size-8 rounded-md border border-border shrink-0">
									<ImageIcon className="size-4 text-muted-foreground" />
								</div>
								<div className="flex flex-col gap-1.5 w-full">
									<div className="flex items-center justify-between gap-2.5 -mt-2 w-full">
										<div className="flex items-center gap-2.5">
											<span className="text-xs text-foreground font-medium leading-none">
												{imageFile.file.name}
											</span>
											<span className="text-xs text-muted-foreground font-normal leading-none">
												{formatBytes(imageFile.file.size)}
											</span>
											{imageFile.status === 'uploading' && (
												<p className="text-xs text-muted-foreground">
													Uploading... {imageFile.progress}%
												</p>
											)}
											{imageFile.status === 'completed' && (
												<p className="text-xs text-green-600 font-medium">✓ Uploaded</p>
											)}
											{imageFile.status === 'error' && (
												<p className="text-xs text-red-600 font-medium">✗ Failed</p>
											)}
										</div>
										<Button
											onClick={() => removeImage(imageFile.id)}
											type="button"
											variant="ghost"
											size="icon"
											className="size-6"
										>
											<CircleX className="size-3.5" />
										</Button>
									</div>

									<Progress
										value={imageFile.progress}
										className={cn(
											'h-1 transition-all duration-300',
											imageFile.status === 'completed' && '[&>div]:bg-green-600',
											imageFile.status === 'error' && '[&>div]:bg-red-600',
											imageFile.status === 'uploading' && '[&>div]:bg-blue-600'
										)}
									/>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

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
		</div>
	);
}
