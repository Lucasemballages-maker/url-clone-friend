import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter,
  Play,
  Heart,
  MoreHorizontal,
  Eye,
  ThumbsUp,
  MessageCircle,
  Share2,
  Facebook,
  Instagram
} from "lucide-react";

const platforms = ["Tous", "Facebook", "Instagram", "TikTok", "Google"];

const ads = [
  {
    id: 1,
    product: "Smart Posture Corrector",
    shop: "PosturePro",
    platform: "Facebook",
    platformIcon: Facebook,
    views: "2.4M",
    likes: "45K",
    comments: "3.2K",
    shares: "12K",
    duration: "Active depuis 45 jours",
    thumbnail: "🎯",
  },
  {
    id: 2,
    product: "Portable Blender USB",
    shop: "BlendGo",
    platform: "Instagram",
    platformIcon: Instagram,
    views: "1.8M",
    likes: "89K",
    comments: "5.6K",
    shares: "8.9K",
    duration: "Active depuis 30 jours",
    thumbnail: "🥤",
  },
  {
    id: 3,
    product: "LED Galaxy Projector",
    shop: "NightSky",
    platform: "TikTok",
    platformIcon: Play,
    views: "5.2M",
    likes: "234K",
    comments: "18K",
    shares: "45K",
    duration: "Active depuis 60 jours",
    thumbnail: "🌌",
  },
  {
    id: 4,
    product: "Magnetic Phone Mount",
    shop: "DriveEasy",
    platform: "Facebook",
    platformIcon: Facebook,
    views: "890K",
    likes: "23K",
    comments: "1.8K",
    shares: "4.5K",
    duration: "Active depuis 21 jours",
    thumbnail: "📱",
  },
  {
    id: 5,
    product: "Heated Eye Mask",
    shop: "RelaxZone",
    platform: "Instagram",
    platformIcon: Instagram,
    views: "1.2M",
    likes: "67K",
    comments: "4.1K",
    shares: "9.2K",
    duration: "Active depuis 38 jours",
    thumbnail: "😌",
  },
  {
    id: 6,
    product: "Mini Drone Camera",
    shop: "SkyView",
    platform: "TikTok",
    platformIcon: Play,
    views: "3.8M",
    likes: "156K",
    comments: "12K",
    shares: "28K",
    duration: "Active depuis 52 jours",
    thumbnail: "🚁",
  },
];

const TopAds = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("Tous");

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Top Ads</h1>
          <p className="text-muted-foreground">
            Découvre les publicités qui performent le mieux sur toutes les plateformes.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher une pub ou un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>

          {/* Platforms */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {platforms.map((platform) => (
              <Button
                key={platform}
                variant={selectedPlatform === platform ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedPlatform(platform)}
                className="shrink-0"
              >
                {platform}
              </Button>
            ))}
          </div>

          {/* More Filters */}
          <Button variant="outline" className="gap-2 shrink-0">
            <Filter className="w-4 h-4" />
            Plus de filtres
          </Button>
        </div>

        {/* Ads Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {ads.map((ad) => {
            const PlatformIcon = ad.platformIcon;
            return (
              <div
                key={ad.id}
                className="glass rounded-xl overflow-hidden card-hover border-gradient group"
              >
                {/* Ad Preview */}
                <div className="relative aspect-video bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                  <span className="text-6xl">{ad.thumbnail}</span>
                  
                  {/* Play button overlay */}
                  <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-primary-foreground fill-current ml-1" />
                    </div>
                  </div>

                  {/* Platform badge */}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-lg flex items-center gap-1.5 text-xs font-medium">
                    <PlatformIcon className="w-3 h-3" />
                    {ad.platform}
                  </div>

                  {/* Duration badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-success/20 text-success backdrop-blur-sm rounded-lg text-xs font-medium">
                    Active
                  </div>
                </div>

                {/* Ad Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold line-clamp-1">{ad.product}</h3>
                      <p className="text-sm text-muted-foreground">{ad.shop}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4">{ad.duration}</p>

                  {/* Engagement Stats */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-secondary rounded-lg p-2">
                      <Eye className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs font-medium">{ad.views}</p>
                    </div>
                    <div className="bg-secondary rounded-lg p-2">
                      <ThumbsUp className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs font-medium">{ad.likes}</p>
                    </div>
                    <div className="bg-secondary rounded-lg p-2">
                      <MessageCircle className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs font-medium">{ad.comments}</p>
                    </div>
                    <div className="bg-secondary rounded-lg p-2">
                      <Share2 className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs font-medium">{ad.shares}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 pt-0">
                  <Button variant="hero" size="sm" className="w-full">
                    Voir la pub complète
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More */}
        <div className="flex justify-center mt-8">
          <Button variant="outline" size="lg">
            Charger plus de publicités
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TopAds;
