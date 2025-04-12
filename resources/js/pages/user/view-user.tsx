import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import { User, type BreadcrumbItem } from '@/types';
import getCroppedImg from '@/utils/cropImage';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { Dialog } from '@radix-ui/react-dialog';
import { FormEventHandler, useCallback, useRef, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { toast } from 'sonner';

interface ViewUserProps {
    user: User;
}

type UpdateUserForm = {
    name: string;
    new_avatar: File | null;
    email: string;
};

const ViewUser: React.FC<ViewUserProps> = ({ user }) => {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: `User #${user.name}`,
            href: `/view-user/${user.id}`,
        },
    ];

    const getInitials = useInitials();

    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const inputFileRef = useRef<HTMLInputElement | null>(null);
    const [showCropModal, setShowCropModal] = useState(false);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
            setShowCropModal(true);
        };
        reader.readAsDataURL(file);
    };

    const onCropComplete = useCallback((_: Area, croppedPixels: { x: number; y: number; width: number; height: number }) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleCropDone = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
        const croppedFile = new File([croppedBlob], 'cropped-avatar.jpg', {
            type: 'image/jpeg',
        });

        setData('new_avatar', croppedFile);
        setShowCropModal(false);
    };

    const { data, setData, errors, post, processing, recentlySuccessful, reset } = useForm<Required<UpdateUserForm>>({
        name: user.name,
        new_avatar: null,
        email: user.email,
    });

    const updateUser: FormEventHandler = (e) => {
        e.preventDefault();

        const promise = new Promise<void>((resolve, reject) => {
            post(route('dashboard.update-user', user.id), {
                preserveScroll: true,
                onSuccess: () => {
                    reset('new_avatar');
                    resolve();
                    setCrop({ x: 0, y: 0 });
                    setZoom(1);
                },
                onError: () => {
                    reject();
                },
            });
        });

        toast.promise(promise, {
            loading: 'Updating user...',
            success: 'User updated!',
            error: 'Failed to update user.',
            duration: 5000,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View User" />
            <div className="px-4 py-6">
                <Heading title="View User" description={`User #${user.name}`} />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl">
                    <Avatar className="size-16 rounded-md">
                        <AvatarImage src={`/storage/${user.avatar}`} alt={user.name} className="object-cover" />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <form onSubmit={updateUser}>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            value={data.name}
                            placeholder="Name"
                            className="mb-4"
                            required
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} />
                        <Label htmlFor="avatar">New Avatar</Label>
                        <Input type="file" id="avatar" name="avatar" accept="image/*" className="mb-4" onChange={onFileChange} ref={inputFileRef} />
                        <InputError message={errors.new_avatar} />
                        <Label htmlFor="email">Email</Label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            value={data.email}
                            placeholder="Email"
                            className="mb-4"
                            required
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} />
                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white inset-shadow-sm inset-shadow-blue-400 disabled:bg-blue-600"
                                disabled={processing}
                            >
                                Update User
                            </button>
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </div>
            {showCropModal && (
                <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Crop Image</DialogTitle>
                        </DialogHeader>

                        <div className="relative h-[300px] w-full bg-black">
                            <Cropper
                                image={imageSrc!}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>

                        <DialogFooter className="mt-4">
                            <Button onClick={handleCropDone}>Crop</Button>
                            <Button variant="ghost" onClick={() => setShowCropModal(false)}>
                                Cancel
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </AppLayout>
    );
};

export default ViewUser;
