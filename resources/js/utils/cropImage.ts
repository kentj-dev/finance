interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
}

export default function getCroppedImg(imageSrc: string, pixelCrop: PixelCrop): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = pixelCrop.width;
            canvas.height = pixelCrop.height;
            const ctx = canvas.getContext('2d');

            if (!ctx) return reject('No 2d context');

            ctx.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                pixelCrop.width,
                pixelCrop.height
            );

            canvas.toBlob((blob) => {
                if (!blob) return reject('Canvas is empty');
                resolve(blob);
            }, 'image/jpeg');
        };
        image.onerror = () => reject('Image load error');
    });
}
