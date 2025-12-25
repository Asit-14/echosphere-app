import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/axios';

interface ProfileFormData {
  fullName: string;
  bio: string;
  status: string;
  avatar: string;
}

export function ProfileSettings() {
  const { user, refreshUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<ProfileFormData>({
    defaultValues: {
      fullName: user?.name || '',
      bio: '',
      status: user?.status || '',
      avatar: user?.avatar || '',
    }
  });

  useEffect(() => {
    if (user) {
      setValue('fullName', user.name);
      setValue('status', user.status || '');
      setValue('avatar', user.avatar || '');
    }
  }, [user, setValue]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const newAvatarUrl = response.data.data.avatar;
      setValue('avatar', newAvatarUrl);
      toast.success('Profile picture updated');
      await refreshUser();
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await api.put('/users/profile', data);
      toast.success('Profile updated successfully');
      await refreshUser();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage your public profile information.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="font-medium">Profile Picture</h4>
            <p className="text-xs text-muted-foreground">
              JPG, GIF or PNG. Max size of 800K.
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            <Button 
              variant="outline" 
              size="sm" 
              type="button" 
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? 'Uploading...' : 'Upload new photo'}
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || ''} disabled className="bg-muted" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fullName">Display Name</Label>
            <Input id="fullName" {...register('fullName')} />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Tell us about yourself" className="resize-none" {...register('bio')} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Input id="status" placeholder="What's on your mind?" {...register('status')} />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}