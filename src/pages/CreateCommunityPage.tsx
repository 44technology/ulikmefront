import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Globe, Lock, Camera, Instagram, Twitter, Youtube, Users } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateCommunityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a community name');
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('isPublic', formData.isPublic.toString());
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/communities`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create community');
      }

      const result = await response.json();
      setCreatedCommunityId(result.data.id);
      setShowFollowerDialog(true);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to create community');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            onClick={() => navigate('/communities')}
            className="p-2 -ml-2"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <h1 className="text-xl font-bold text-foreground">Create Community</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pb-6 space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Community Image</Label>
          <div className="flex items-center gap-4">
            {imagePreview ? (
              <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-border">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setSelectedImage(null);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground text-center px-2">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Upload a high-quality image for your community (max 5MB)
              </p>
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Community Name *</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g., Miami Tennis Club"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Tell people what your community is about..."
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </div>

        {/* Privacy */}
        <div className="space-y-3">
          <Label>Privacy</Label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-border cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="radio"
                name="isPublic"
                value="true"
                checked={formData.isPublic === true}
                onChange={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                formData.isPublic ? 'border-primary' : 'border-border'
              }`}>
                {formData.isPublic && <div className="w-3 h-3 rounded-full bg-primary" />}
              </div>
              <div className="flex items-center gap-2 flex-1">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Public</p>
                  <p className="text-xs text-muted-foreground">Anyone can find and join</p>
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-border cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="radio"
                name="isPublic"
                value="false"
                checked={formData.isPublic === false}
                onChange={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                !formData.isPublic ? 'border-primary' : 'border-border'
              }`}>
                {!formData.isPublic && <div className="w-3 h-3 rounded-full bg-primary" />}
              </div>
              <div className="flex items-center gap-2 flex-1">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Private</p>
                  <p className="text-xs text-muted-foreground">Only invited members can join</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-primary text-primary-foreground"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Community'}
        </Button>
      </form>

      {/* Social Media Followers Dialog */}
      <Dialog open={showFollowerDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Social Media Followers</DialogTitle>
            <DialogDescription>
              How many followers do you have across your main social media platforms (Instagram, Twitter, YouTube, etc.)?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="followerCount">Total Followers</Label>
              <Input
                id="followerCount"
                type="number"
                placeholder="e.g., 10000"
                value={followerCount}
                onChange={(e) => setFollowerCount(e.target.value)}
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                Add up your followers from Instagram, Twitter, YouTube, TikTok, etc.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted border border-border">
              <p className="text-sm font-medium text-foreground mb-2">What this means:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Less than 5,000: You can create communities</li>
                <li>• 5,000 or more: You can request to create classes</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  // Skip - don't save follower count
                  if (createdCommunityId) {
                    navigate(`/community/${createdCommunityId}`);
                  }
                }}
                className="flex-1"
              >
                Skip
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  if (!followerCount || parseInt(followerCount) < 0) {
                    toast.error('Please enter a valid follower count');
                    return;
                  }

                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users/social-followers`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        socialMediaFollowers: parseInt(followerCount),
                      }),
                    });

                    if (!response.ok) {
                      throw new Error('Failed to save follower count');
                    }

                    const followerCountNum = parseInt(followerCount);
                    if (followerCountNum >= 5000) {
                      toast.success('Follower count saved! You can now request to create classes.');
                    } else {
                      toast.success('Follower count saved! You can create communities.');
                    }

                    if (createdCommunityId) {
                      navigate(`/community/${createdCommunityId}`);
                    }
                  } catch (error: unknown) {
                    toast.error(error instanceof Error ? error.message : 'Failed to save follower count');
                  }
                }}
                className="flex-1 bg-gradient-primary text-primary-foreground"
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
