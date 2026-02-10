import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, Lock, Globe, ArrowRight, Image as ImageIcon } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Community {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isPublic: boolean;
  memberCount: number;
  creator: {
    id: string;
    displayName: string;
    avatar?: string;
  };
}

export default function CommunitiesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // TODO: Fetch communities from API
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Communities</h1>
            <Button
              onClick={() => navigate('/create-community')}
              size="sm"
              className="bg-gradient-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading communities...</p>
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium mb-2">No communities yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery ? 'No communities match your search' : 'Create your first community to get started'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => navigate('/create-community')}
                className="bg-gradient-primary text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Community
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCommunities.map((community) => (
              <motion.div
                key={community.id}
                onClick={() => navigate(`/community/${community.id}`)}
                className="card-elevated overflow-hidden cursor-pointer"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex gap-4 p-4">
                  {/* Community Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                    {community.image ? (
                      <img src={community.image} alt={community.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Community Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">{community.name}</h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {community.isPublic ? (
                          <Globe className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    
                    {community.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {community.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{community.memberCount} members</span>
                      </div>
                      <span>•</span>
                      <span>by {community.creator.displayName}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </MobileLayout>
  );
}
