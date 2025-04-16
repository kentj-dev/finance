import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import getCroppedImg from '@/utils/cropImage';
import { useCallback, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';

interface CropDialogProps {
    imageSrc: string;
    open: boolean;
    onClose: () => void;
    onCropped: (file: File) => void;
    aspect?: number;
}

const CropDialog: React.FC<CropDialogProps> = ({ imageSrc, open, onClose, onCropped, aspect = 1 }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleCropDone = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
        const croppedFile = new File([croppedBlob], 'cropped.jpg', { type: 'image/jpeg' });
        onCropped(croppedFile);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Crop Image</DialogTitle>
                    <DialogDescription>Adjust the crop area to select the part of the image you want to keep.</DialogDescription>
                </DialogHeader>
                <div className="relative h-[300px] w-full overflow-hidden rounded-lg bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>
                <DialogFooter className="mt-4">
                    <Button onClick={handleCropDone}>Crop Image</Button>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CropDialog;
