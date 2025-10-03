'use client';

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

export default function ProductImages({images}: {images: string[]}) {
  const [current, setCurrent] = useState(0);

  return (
    <div className='space-y-4'>
      <Image src={images[current]} width={1000} height={1000} className="min-h-[300px] object-cover object-center" alt="Product Image" />

      <div className="flex gap-2">
      {images.map((image, index) => <div key={index} onClick={() => setCurrent(index)} className={cn('cursor-pointer border hover:border-orange-600', current === index && 'border-orange-600')}>
        <Image src={image} width={100} height={100} alt={'Product Image'} />
      </div>)}
      </div>
    </div>
  )
}
