import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Linkedin, Mail, MapPin, ExternalLink, X } from "lucide-react";
import { PERSONAL_INFO } from "@/hooks/use-portfolio";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { extractColorsFromImage, createGradientBorder } from "@/lib/color-extractor";

interface ProfileCardProps {
  avatarUrl?: string;
  onClose?: () => void;
}

export function ProfileCard({ avatarUrl, onClose }: ProfileCardProps) {
  const [gradientBorder, setGradientBorder] = useState<string>(
    'conic-gradient(from 180deg, #9f84bd, #c09bd8, #ebc3db, #ede3e9, #e6e4ce, #9f84bd)'
  );

  // Disabled dynamic color extraction - using static Coolors palette
  // useEffect(() => {
  //   const imageUrl = "/images/avatar.png";
  //   console.log('🎨 Extracting colors for ProfileCard from:', imageUrl);
  //   extractColorsFromImage(imageUrl).then(colors => {
  //     console.log('✨ ProfileCard color palette:', colors);
  //     setGradientBorder(createGradientBorder(colors));
  //   }).catch(err => {
  //     console.error('Failed to extract colors for ProfileCard:', err);
  //   });
  // }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ 
        duration: 0.3, 
        ease: [0.16, 1, 0.3, 1] // Custom easing for smooth bounce
      }}
    >
      <Card className="w-[380px] overflow-hidden border-border/50 shadow-2xl">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-background/80 hover:bg-background border border-border/50 text-muted-foreground hover:text-foreground transition-all hover:scale-110"
            aria-label="Close profile card"
          >
            <X size={16} />
          </button>
        )}
        
        <div className="relative p-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {/* Gradient Border Container */}
              <div 
                className="relative p-1 rounded-full"
                style={{ 
                  background: gradientBorder,
                  filter: 'blur(0px)',
                }}
              >
                {/* Glow Effect */}
                <div 
                  className="absolute inset-0 rounded-full opacity-60 blur-md"
                  style={{ background: gradientBorder }}
                />
                {/* Inner white border */}
                <div className="relative w-32 h-32 rounded-full p-1 bg-background">
                  {/* Avatar Container */}
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <img
                      src="/images/avatar.png"
                      alt={PERSONAL_INFO.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Username Badge */}
            <div className="mt-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-sm font-medium text-primary">@{PERSONAL_INFO.github.split('/').pop()}</span>
            </div>
          </div>

          {/* Name */}
          <div className="text-center mb-3">
            <h3 className="text-2xl font-bold tracking-tight">
              {PERSONAL_INFO.name}
            </h3>
          </div>

          {/* Title/Role */}
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground font-medium">
              {PERSONAL_INFO.title}
            </p>
            {PERSONAL_INFO.subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {PERSONAL_INFO.subtitle}
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              {PERSONAL_INFO.bio}
            </p>
          </div>

          {/* Location */}
          <div className="flex items-center justify-center gap-2 mb-6 text-sm text-muted-foreground">
            <MapPin size={16} className="text-primary" />
            <span>{PERSONAL_INFO.location}</span>
          </div>

          {/* Divider */}
          <div className="h-px bg-border mb-6" />

          {/* Social Links */}
          <div className="flex flex-col gap-2">
            <a
              href={PERSONAL_INFO.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Button
                variant="outline"
                className="w-full justify-between hover:bg-primary/5 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Github size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium">GitHub Profile</span>
                </div>
                <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>
            </a>

            <a
              href={PERSONAL_INFO.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Button
                variant="outline"
                className="w-full justify-between hover:bg-primary/5 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Linkedin size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium">LinkedIn</span>
                </div>
                <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>
            </a>

            <a
              href={`mailto:${PERSONAL_INFO.email}`}
              className="group"
            >
              <Button
                variant="outline"
                className="w-full justify-between hover:bg-primary/5 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium">Email Me</span>
                </div>
                <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>
            </a>
          </div>

          {/* Status Badge */}
          <div className="mt-6 flex items-center justify-center">
            <Badge variant="secondary" className="px-4 py-1.5">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Available for opportunities
            </Badge>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
