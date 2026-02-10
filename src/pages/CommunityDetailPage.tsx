import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Plus, GraduationCap, Settings, Globe, Lock, Calendar, MapPin, Clock, DollarSign, User } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import UserAvatar from '@/components/ui/UserAvatar';

interface Community {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isPublic: boolean;
  creator: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  memberCount: number;
  isMember: boolean;
  isOwner: boolean;
}

interface Class {
  id: string;
  title: string;
  description: string;
  skill: string;
  category?: string;
  image?: string;
  startTime: string;
  endTime?: string;
  maxStudents?: number;
  price?: number;
  schedule?: string;
}

export default function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreateClassDialog, setShowCreateClassDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'classes' | 'members'>('classes');
  
  // TODO: Fetch community from API
  const [community, setCommunity] = useState<Community | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  
  const [classFormData, setClassFormData] = useState({
    title: '',
    description: '',
    skill: '',
    category: '',
    startTime: '',
    endTime: '',
    maxStudents: '',
    price: '',
    schedule: '',
  });

  const handleClassFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClassFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!classFormData.title || !classFormData.skill || !classFormData.startTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...classFormData,
          communityId: id,
          maxStudents: classFormData.maxStudents ? parseInt(classFormData.maxStudents) : null,
          price: classFormData.price ? parseFloat(classFormData.price) : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create class');
      }

      const result = await response.json();
      toast.success('Class created successfully!');
      setShowCreateClassDialog(false);
      setClassFormData({
        title: '',
        description: '',
        skill: '',
        category: '',
        startTime: '',
        endTime: '',
        maxStudents: '',
        price: '',
        schedule: '',
      });
      // TODO: Refresh classes list
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to create class');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinCommunity = async () => {
    if (!user) {
      toast.error('Please login to join');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/communities/${id}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to join community');
      }

      toast.success('Joined community successfully!');
      // TODO: Refresh community data
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to join community');
    } finally {
      setIsLoading(false);
    }
  };

  if (!community) {
    return (
      <MobileLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading community...</p>
        </div>
      </MobileLayout>
    );
  }

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
          <h1 className="text-xl font-bold text-foreground flex-1 truncate">{community.name}</h1>
          {community.isOwner && (
            <motion.button
              onClick={() => navigate(`/community/${id}/settings`)}
              className="p-2"
              whileTap={{ scale: 0.9 }}
            >
              <Settings className="w-6 h-6 text-foreground" />
            </motion.button>
          )}
        </div>
      </div>

      <div className="pb-6">
        {/* Community Header */}
        <div className="relative">
          <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20">
            {community.image && (
              <img src={community.image} alt={community.name} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">{community.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {community.isPublic ? (
                    <Globe className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>{community.memberCount} members</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {community.description && (
          <div className="px-4 pt-4">
            <p className="text-muted-foreground">{community.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="px-4 pt-4 flex gap-2">
          {!community.isMember && (
            <Button
              onClick={handleJoinCommunity}
              className="flex-1 bg-gradient-primary text-primary-foreground"
              disabled={isLoading}
            >
              <Users className="w-4 h-4 mr-2" />
              Join Community
            </Button>
          )}
          {community.isMember && (
            <Button
              onClick={() => setShowCreateClassDialog(true)}
              className="flex-1 bg-gradient-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Class
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="px-4 pt-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'classes' | 'members')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>

            <TabsContent value="classes" className="mt-4 space-y-3">
              {classes.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground font-medium mb-2">No classes yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {community.isMember ? 'Create the first class in this community' : 'Join to create classes'}
                  </p>
                  {community.isMember && (
                    <Button
                      onClick={() => setShowCreateClassDialog(true)}
                      className="bg-gradient-primary text-primary-foreground"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Class
                    </Button>
                  )}
                </div>
              ) : (
                classes.map((classItem) => (
                  <motion.div
                    key={classItem.id}
                    onClick={() => navigate(`/class/${classItem.id}`)}
                    className="card-elevated overflow-hidden cursor-pointer"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-1">{classItem.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{classItem.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(classItem.startTime).toLocaleDateString()}</span>
                        </div>
                        {classItem.price && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span>${classItem.price}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent value="members" className="mt-4 space-y-3">
              {members.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No members yet</p>
                </div>
              ) : (
                members.map((member) => (
                  <motion.div
                    key={member.id}
                    onClick={() => navigate(`/user/${member.user.id}`)}
                    className="card-elevated overflow-hidden cursor-pointer"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3 p-4">
                      <UserAvatar user={member.user} size="md" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{member.user.displayName}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Class Dialog */}
      <Dialog open={showCreateClassDialog} onOpenChange={setShowCreateClassDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Class</DialogTitle>
            <DialogDescription>Create a new class in this community</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateClass} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Class Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Beginner Tennis"
                value={classFormData.title}
                onChange={handleClassFormChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill">Skill/Category *</Label>
              <Input
                id="skill"
                name="skill"
                placeholder="e.g., Tennis"
                value={classFormData.skill}
                onChange={handleClassFormChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your class..."
                value={classFormData.description}
                onChange={handleClassFormChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="datetime-local"
                  value={classFormData.startTime}
                  onChange={handleClassFormChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="datetime-local"
                  value={classFormData.endTime}
                  onChange={handleClassFormChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxStudents">Max Students</Label>
                <Input
                  id="maxStudents"
                  name="maxStudents"
                  type="number"
                  placeholder="10"
                  value={classFormData.maxStudents}
                  onChange={handleClassFormChange}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={classFormData.price}
                  onChange={handleClassFormChange}
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule</Label>
              <Input
                id="schedule"
                name="schedule"
                placeholder="e.g., Every Saturday 10am-12pm"
                value={classFormData.schedule}
                onChange={handleClassFormChange}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateClassDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-primary text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Class'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </MobileLayout>
  );
}
