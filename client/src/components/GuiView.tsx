import { motion, AnimatePresence } from "framer-motion";
import { useProjects, useTimeline, useCertifications, PERSONAL_INFO, CURRENT_STATUS } from "@/hooks/use-portfolio";
import { Github, Globe, Code, Send, Mail, Menu, X, Linkedin, FileDown, GraduationCap, Briefcase, ChevronLeft, ChevronRight, Target, Award, ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import linkedInPosts from "@/data/linkedin-posts.json";
import { ProfileCard } from "@/components/ProfileCard";
import { extractColorsFromImage, createGradientBorder } from "@/lib/color-extractor";
// --- Components ---

function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [gradientBorder, setGradientBorder] = useState<string>(
    'conic-gradient(from 180deg, #9f84bd, #c09bd8, #ebc3db, #ede3e9, #e6e4ce, #9f84bd)'
  );
  const profileImageUrl = "/images/avatar.png";

  // Disabled dynamic color extraction - using static Coolors palette
  // useEffect(() => {
  //   console.log('🎨 Extracting colors from profile image:', profileImageUrl);
  //   extractColorsFromImage(profileImageUrl).then(colors => {
  //     console.log('✨ Extracted color palette:', colors);
  //     setGradientBorder(createGradientBorder(colors));
  //   }).catch(err => {
  //     console.error('Failed to extract colors:', err);
  //   });
  // }, []);

  const navLinks = [
    { href: "#about", label: "About" },
    { href: "#timeline", label: "Timeline" },
    { href: "#certifications", label: "Certifications" },
    { href: "#projects", label: "Projects" },
    { href: "#content", label: "Posts" },
    { href: "#contact", label: "Contact" },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
      <div className="container max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Name */}
          <a href="#" className="flex items-center gap-2 group">
            <span className="font-bold text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {PERSONAL_INFO.name}
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Profile & Actions */}
          <div className="flex items-center gap-4">
            <a
              href="https://docs.google.com/document/d/1y8LIxoF9fO6Zmm6pl43nEtjpmpXpr1pT/edit?usp=sharing&ouid=107913718437429953691&rtpof=true&sd=true"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              aria-label="View Resume"
            >
              <FileDown size={18} />
              <span className="hidden lg:inline">Resume</span>
            </a>
            
            {/* Social Links */}
            <div className="hidden sm:flex items-center gap-2">
              <a
                href={PERSONAL_INFO.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href={PERSONAL_INFO.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>

            {/* Profile Picture */}
            <button
              onClick={() => setShowProfileCard(true)}
              className="relative cursor-pointer focus:outline-none group"
              aria-label="View profile"
            >
              <div 
                className="relative p-[2px] rounded-full transition-transform group-hover:scale-105"
                style={{ background: gradientBorder }}
              >
                {/* Subtle glow effect */}
                <div 
                  className="absolute inset-0 rounded-full opacity-40 blur-sm group-hover:opacity-60 transition-opacity"
                  style={{ background: gradientBorder }}
                />
                {/* Inner white border */}
                <div className="relative w-10 h-10 rounded-full p-[2px] bg-background">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img
                      src="/images/avatar.png"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden pt-4 pb-6 border-t mt-4"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="https://docs.google.com/document/d/1y8LIxoF9fO6Zmm6pl43nEtjpmpXpr1pT/edit?usp=sharing&ouid=107913718437429953691&rtpof=true&sd=true"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                <FileDown size={18} />
                View Resume
              </a>
              <div className="flex items-center gap-4 pt-4 border-t">
                <a
                  href={PERSONAL_INFO.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="GitHub"
                >
                  <Github size={20} />
                </a>
                <a
                  href={PERSONAL_INFO.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>

      {/* Profile Card Modal */}
      <ProfileCardModal
        isOpen={showProfileCard}
        onClose={() => setShowProfileCard(false)}
        avatarUrl="/images/avatar.png"
      />
    </>
  );
}

function ProfileCardModal({ 
  isOpen, 
  onClose, 
  avatarUrl 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  avatarUrl?: string;
}) {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <div className="min-h-screen flex items-center justify-center p-4 py-20">
            <div onClick={(e) => e.stopPropagation()}>
              <ProfileCard 
                avatarUrl={avatarUrl} 
                onClose={onClose}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}


function SectionHeader({ title, subtitle, id, gradientBorder }: { title: string; subtitle: string; id?: string; gradientBorder?: string }) {
  return (
    <div className="mb-12" id={id}>
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">{title}</h2>
      <div 
        className="h-1 w-20 rounded-full mb-4"
        style={{ background: gradientBorder || 'var(--primary)' }}
      />
      <p className="text-muted-foreground text-lg max-w-2xl">{subtitle}</p>
    </div>
  );
}

function ProjectCard({ project, index, gradientBorder }: { project: any; index: number; gradientBorder?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative bg-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      {/* Gradient border */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-[2px]"
        style={{ background: gradientBorder }}
      >
        <div className="w-full h-full bg-card rounded-2xl" />
      </div>
      {/* Static border */}
      <div className="absolute inset-0 rounded-2xl border group-hover:border-transparent transition-colors" />
      <div className="p-8 flex flex-col flex-grow relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Code size={24} />
          </div>
          <div className="flex gap-2">
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub">
                <Github size={20} />
              </a>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Live Demo">
                <Globe size={20} />
              </a>
            )}
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
        <p className="text-muted-foreground mb-6 flex-grow leading-relaxed">{project.description}</p>
        
        <div className="flex flex-wrap gap-2 mt-auto">
          {project.techStack.map((tech: string) => (
            <span key={tech} className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function TimelineItem({ item, index }: { item: any; index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative pl-8 border-l-2 border-border pb-12 last:pb-0"
    >
      <div className="absolute left-[-5px] top-0 h-3 w-3 rounded-full bg-primary" />
      
      <div className="text-sm font-semibold text-primary mb-1">{item.duration}</div>
      <div className="text-lg font-bold">{item.position}</div>
      <div className="text-base text-muted-foreground mb-2">{item.company}</div>
      <p className="text-muted-foreground leading-relaxed">{item.description}</p>
    </motion.div>
  );
}

function CurrentStatus({ gradientBorder }: { gradientBorder?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="relative bg-card rounded-2xl p-8 shadow-sm overflow-hidden"
    >
      {/* Gradient border */}
      <div 
        className="absolute inset-0 rounded-2xl p-[2px]"
        style={{ background: gradientBorder }}
      >
        <div className="w-full h-full bg-card rounded-2xl" />
      </div>
      {/* Subtle glow */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-20 blur-xl"
        style={{ background: gradientBorder }}
      />
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 relative z-10">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        What I'm Doing Now
      </h3>
      
      <div className="grid md:grid-cols-2 gap-8 relative z-10">
        {/* Education */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <GraduationCap size={20} />
            <span>Education</span>
          </div>
          <div>
            <p className="font-medium">{CURRENT_STATUS.education.degree}</p>
            <p className="text-sm text-muted-foreground">{CURRENT_STATUS.education.institution}</p>
            <p className="text-sm text-muted-foreground">{CURRENT_STATUS.education.year}</p>
            <p className="text-xs text-muted-foreground mt-1">{CURRENT_STATUS.education.location}</p>
          </div>
        </div>

        {/* Current Work */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Briefcase size={20} />
            <span>Current Roles</span>
          </div>
          <div className="space-y-3">
            {CURRENT_STATUS.work.map((work, idx) => (
              <div key={idx}>
                <p className="font-medium">{work.title}</p>
                <p className="text-sm text-muted-foreground">{work.organization}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                  {work.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="mt-6 pt-6 border-t">
        <p className="text-sm font-medium mb-3">Core Skills</p>
        <div className="flex flex-wrap gap-2">
          {CURRENT_STATUS.skills.map((skill, idx) => (
            <span key={idx} className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-lg">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    // Simulate sending
    console.log("Contact form submission:", formData);
    setTimeout(() => {
      setStatus("sent");
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 3000);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <input 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            placeholder="John Doe"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input 
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            placeholder="john@example.com"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Message</label>
        <textarea 
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={5}
          className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
          placeholder="Tell me about your project..."
          required
        />
      </div>
      <button 
        type="submit"
        disabled={status === "sending"}
        className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : status === "sent" ? "Sent! ✓" : (
          <>Send Message <Send size={18} /></>
        )}
      </button>
    </form>
  );
}

function LinkedInContentCard({ item, index, gradientBorder }: { item: any; index: number; gradientBorder?: string }) {
  return (
    <motion.a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group block bg-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full relative"
    >
      {/* Gradient border */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-[2px]"
        style={{ background: gradientBorder }}
      >
        <div className="w-full h-full bg-card rounded-2xl" />
      </div>
      {/* Static border */}
      <div className="absolute inset-0 rounded-2xl border group-hover:border-transparent transition-colors" />
      
      <div className="p-6 flex flex-col h-full min-h-[200px] relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            item.type === 'article' 
              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
              : 'bg-green-500/10 text-green-600 dark:text-green-400'
          }`}>
            {item.type === 'article' ? '📄 Article' : '💬 Post'}
          </span>
          <span className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
        </div>
        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
        <p className="text-muted-foreground text-sm mb-4 flex-grow line-clamp-3">{item.excerpt}</p>
        {(item.likes || item.comments) && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
            {item.likes > 0 && <span>👍 {item.likes} likes</span>}
            {item.comments > 0 && <span>💬 {item.comments} comments</span>}
          </div>
        )}
      </div>
    </motion.a>
  );
}

function LinkedInContent({ gradientBorder }: { gradientBorder?: string }) {
  const content = linkedInPosts;

  if (content.length === 0) {
    return (
      <div className="min-w-full text-center py-12">
        <p className="text-muted-foreground">Check out my latest posts and articles on LinkedIn!</p>
        <a
          href={PERSONAL_INFO.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all"
        >
          <Linkedin size={20} />
          Visit LinkedIn Profile
        </a>
      </div>
    );
  }

  return (
    <>
      {content.map((item, i) => (
        <div key={item.id} className="min-w-[350px] md:min-w-[450px] snap-start">
          <LinkedInContentCard item={item} index={i} gradientBorder={gradientBorder} />
        </div>
      ))}
    </>
  );
}

// --- Main View ---

export function GuiView() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: timeline } = useTimeline();
  const { data: certifications } = useCertifications();
  const projectsScrollRef = useRef<HTMLDivElement>(null);
  const postsScrollRef = useRef<HTMLDivElement>(null);
  const certificationsScrollRef = useRef<HTMLDivElement>(null);
  const [gradientBorder, setGradientBorder] = useState<string>(
    'conic-gradient(from 180deg, #9f84bd, #c09bd8, #ebc3db, #ede3e9, #e6e4ce, #9f84bd)'
  );
  const profileImageUrl = "/images/avatar.png";

  // Auto-scroll certifications
  useEffect(() => {
    const scrollContainer = certificationsScrollRef.current;
    if (!scrollContainer || !certifications || certifications.length === 0) return;

    // Start from the left side
    scrollContainer.scrollLeft = 0;
    
    let scrollDirection = 1; // 1 increases scrollLeft (content moves right to left)
    const scrollSpeed = 0.5; // pixels per frame
    let intervalId: NodeJS.Timeout | null = null;
    
    const autoScroll = () => {
      if (!scrollContainer) return;

      scrollContainer.scrollLeft += scrollSpeed * scrollDirection;

      // Check if we've reached the end or beginning
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth - 1) {
        scrollDirection = -1; // Reverse to scroll back
      } else if (scrollContainer.scrollLeft <= 1) {
        scrollDirection = 1; // Scroll forward again
      }
    };

    // Start auto-scrolling
    intervalId = setInterval(autoScroll, 16); // ~60fps

    // Pause on hover
    const handleMouseEnter = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    
    const handleMouseLeave = () => {
      if (!intervalId) {
        intervalId = setInterval(autoScroll, 16);
      }
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (intervalId) clearInterval(intervalId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [certifications]);

  // Disabled dynamic color extraction - using static Coolors palette
  // useEffect(() => {
  //   extractColorsFromImage(profileImageUrl).then(colors => {
  //     setGradientBorder(createGradientBorder(colors));
  //   }).catch(() => {
  //     // Keep default gradient on error
  //   });
  // }, []);

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 400;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20">
      
      {/* Navigation */}
      <Navigation />
      
      {/* Hero Section */}
      <section className="min-h-[90vh] flex items-center relative overflow-hidden pt-20" id="about">
        <div className="container max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
              {PERSONAL_INFO.subtitle}
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.1]">
              Hi, I'm <span className="text-primary">{PERSONAL_INFO.name.split(' ')[1]}</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
              {PERSONAL_INFO.bio}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <a 
                href="#contact" 
                className="relative px-8 py-4 font-semibold rounded-xl transition-all inline-flex items-center gap-2 group overflow-hidden"
              >
                {/* Gradient border */}
                <div 
                  className="absolute inset-0 rounded-xl p-[2px]"
                  style={{ background: gradientBorder }}
                >
                  <div className="w-full h-full bg-primary rounded-xl" />
                </div>
                {/* Glow effect */}
                <div 
                  className="absolute inset-0 rounded-xl opacity-30 blur-lg group-hover:opacity-50 transition-opacity"
                  style={{ background: gradientBorder }}
                />
                {/* Content */}
                <span className="relative z-10 text-primary-foreground">Get in touch</span>
              </a>
              <a href="#projects" className="px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-all border border-border">
                View Work
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Me Section */}
      <section className="py-24 bg-secondary/30" id="about-details">
        <div className="container max-w-6xl mx-auto px-6">
          <SectionHeader title="About Me" subtitle="Building, learning, and growing one project at a time." gradientBorder={gradientBorder} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              viewport={{ once: true }}
              className="bg-background rounded-2xl p-8 border shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="text-primary" size={24} />
                </div>
                <h3 className="font-bold text-xl">Education</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Currently pursuing my Bachelor's in Computer Science Engineering at VR Siddhartha Engineering College. 
                Focused on building strong foundations in programming, data structures, and modern web technologies. This phase marked my transition from curiosity-driven exploration to disciplined software engineering.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-background rounded-2xl p-8 border shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Code className="text-primary" size={24} />
                </div>
                <h3 className="font-bold text-xl">Development</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Hands-on experience building frontend interfaces, REST APIs, and analytics-focused applications using JavaScript, Python, and Node.js. 
                I focus on writing clean, understandable code and improving systems iteratively. My interest in technology began at a young age through exploration and experimentation, but my structured learning in programming and software design formally began during my CSE program. While many recent projects are web-based for faster iteration and deployment, my interests extend beyond a single platform.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-background rounded-2xl p-8 border shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="text-primary" size={24} />
                </div>
                <h3 className="font-bold text-xl">Innovation & Leadership</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Serving as Campus Innovator at SPARC Foundation, working on ideation and execution of student-focused technical initiatives, collaborating across teams. 
                Also Ideate Station Executive at TechnoVate-SAHE, facilitating brainstorming sessions and refining concepts into actionable proposals.
              </p>
            </motion.div>
          </div>

          {/* Core Skills Tags - Categorized */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <p className="text-sm font-semibold text-muted-foreground mb-6 text-center">Technologies I Work With</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* Frontend */}
              <div className="text-center">
                <p className="text-xs font-semibold text-muted-foreground mb-3">Frontend</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {["HTML", "CSS", "JavaScript", "React"].map((skill, idx) => (
                    <span key={idx} className="px-4 py-2 bg-background border rounded-full text-sm font-medium hover:bg-primary/5 transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Backend */}
              <div className="text-center">
                <p className="text-xs font-semibold text-muted-foreground mb-3">Backend</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {["Node.js", "Python", "C"].map((skill, idx) => (
                    <span key={idx} className="px-4 py-2 bg-background border rounded-full text-sm font-medium hover:bg-primary/5 transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tools */}
              <div className="text-center">
                <p className="text-xs font-semibold text-muted-foreground mb-3">Tools</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {["Git", "GitHub", "VS Code"].map((skill, idx) => (
                    <span key={idx} className="px-4 py-2 bg-background border rounded-full text-sm font-medium hover:bg-primary/5 transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24" id="timeline">
        <div className="container max-w-4xl mx-auto px-6">
          <SectionHeader title="Timeline" subtitle="My journey through education, innovation, and development." gradientBorder={gradientBorder} />
          
          <div className="space-y-0 mb-12">
            {timeline?.map((item: any, idx: number) => (
              <TimelineItem key={item.id} item={item} index={idx} />
            ))}
          </div>

          {/* Current Status */}
          <CurrentStatus gradientBorder={gradientBorder} />
        </div>
      </section>

      {/* How I Build Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container max-w-4xl mx-auto px-6">
          <SectionHeader title="How I Build" subtitle="My approach to development and problem-solving." gradientBorder={gradientBorder} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              viewport={{ once: true }}
              className="bg-card border rounded-xl p-6"
            >
              <h4 className="font-semibold mb-2">Break Down Problems</h4>
              <p className="text-muted-foreground text-sm">
                I break complex problems into small, manageable components that can be tested and improved individually.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-card border rounded-xl p-6"
            >
              <h4 className="font-semibold mb-2">Clarity Over Complexity</h4>
              <p className="text-muted-foreground text-sm">
                I prefer writing clear, understandable code over clever solutions that are hard to maintain.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-card border rounded-xl p-6"
            >
              <h4 className="font-semibold mb-2">Test Ideas Quickly</h4>
              <p className="text-muted-foreground text-sm">
                I build quick prototypes to validate concepts early rather than planning everything upfront.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-card border rounded-xl p-6"
            >
              <h4 className="font-semibold mb-2">Iterate Based on Feedback</h4>
              <p className="text-muted-foreground text-sm">
                I continuously improve my code based on real-world usage and constructive feedback.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What I'm Exploring Section */}
      <section className="py-24">
        <div className="container max-w-4xl mx-auto px-6">
          <SectionHeader title="What I'm Exploring" subtitle="Areas of software development I'm actively learning and experimenting with." gradientBorder={gradientBorder} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              viewport={{ once: true }}
              className="bg-card border rounded-xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Code className="text-primary" size={24} />
              </div>
              <h4 className="font-semibold mb-2">Mobile Application Fundamentals</h4>
              <p className="text-muted-foreground text-sm">
                Understanding mobile development patterns and platform-specific considerations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-card border rounded-xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Code className="text-primary" size={24} />
              </div>
              <h4 className="font-semibold mb-2">Backend Systems & APIs</h4>
              <p className="text-muted-foreground text-sm">
                Building scalable server-side architectures and designing effective API interfaces.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-card border rounded-xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Code className="text-primary" size={24} />
              </div>
              <h4 className="font-semibold mb-2">Platform Selection Strategy</h4>
              <p className="text-muted-foreground text-sm">
                Choosing appropriate technologies based on problem constraints and iteration needs.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-24" id="certifications">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Certifications</h2>
              <div 
                className="h-1 w-20 rounded-full mb-4"
                style={{ background: gradientBorder }}
              />
              <p className="text-muted-foreground text-lg max-w-2xl">Professional certifications and achievements.</p>
            </div>
          </div>
          
          <div 
            ref={certificationsScrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {certifications?.map((cert, index) => (
              <div key={cert.id} className="min-w-[350px] md:min-w-[400px] flex-shrink-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group block bg-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full relative"
                >
                  {/* Gradient border */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-[2px]"
                    style={{ background: gradientBorder }}
                  >
                    <div className="w-full h-full bg-card rounded-2xl" />
                  </div>
                  {/* Static border */}
                  <div className="absolute inset-0 rounded-2xl border group-hover:border-transparent transition-colors" />
                  
                  <div className="p-6 flex items-start gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Award className="text-primary" size={24} />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{cert.name}</h3>
                      <p className="text-muted-foreground text-sm font-medium mb-2">{cert.issuer}</p>
                      <p className="text-muted-foreground text-xs mb-3">{cert.issueDate}</p>
                      {cert.credentialId && (
                        <p className="text-muted-foreground text-xs mb-2">ID: {cert.credentialId}</p>
                      )}
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-all duration-200 border-2 border-foreground rounded-md px-3 py-1.5 hover:bg-foreground/5"
                        >
                          View Credential <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-24 bg-secondary/30" id="projects">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Featured Projects</h2>
              <div 
                className="h-1 w-20 rounded-full mb-4"
                style={{ background: gradientBorder }}
              />
              <p className="text-muted-foreground text-lg max-w-2xl">A selection of my recent work.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scroll(projectsScrollRef, 'left')}
                className="p-3 rounded-full border-2 border-foreground/20 bg-background hover:border-primary hover:bg-primary/5 transition-all shadow-sm"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} className="text-foreground" />
              </button>
              <button
                onClick={() => scroll(projectsScrollRef, 'right')}
                className="p-3 rounded-full border-2 border-foreground/20 bg-background hover:border-primary hover:bg-primary/5 transition-all shadow-sm"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} className="text-foreground" />
              </button>
            </div>
          </div>
          
          <div 
            ref={projectsScrollRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {projectsLoading ? (
              [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="min-w-[350px] md:min-w-[400px] h-96 bg-muted rounded-2xl animate-pulse snap-start"></div>
              ))
            ) : (
              projects?.map((project: any, idx: number) => (
                <div key={project.id} className="min-w-[350px] md:min-w-[400px] snap-start">
                  <ProjectCard project={project} index={idx} gradientBorder={gradientBorder} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* LinkedIn Content Section */}
      <section className="py-24" id="content">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Posts & Articles</h2>
              <div 
                className="h-1 w-20 rounded-full mb-4"
                style={{ background: gradientBorder }}
              />
              <p className="text-muted-foreground text-lg max-w-2xl">Curated technical posts, learnings, and experiences shared on LinkedIn and during workshops.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scroll(postsScrollRef, 'left')}
                className="p-3 rounded-full border-2 border-foreground/20 bg-background hover:border-primary hover:bg-primary/5 transition-all shadow-sm"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} className="text-foreground" />
              </button>
              <button
                onClick={() => scroll(postsScrollRef, 'right')}
                className="p-3 rounded-full border-2 border-foreground/20 bg-background hover:border-primary hover:bg-primary/5 transition-all shadow-sm"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} className="text-foreground" />
              </button>
            </div>
          </div>
          
          <div 
            ref={postsScrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <LinkedInContent gradientBorder={gradientBorder} />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-secondary/30" id="contact">
        <div className="container max-w-4xl mx-auto px-6">
          <SectionHeader title="Let's Talk" subtitle="Have a project in mind? Send me a message." gradientBorder={gradientBorder} />
          
          <p className="text-center text-muted-foreground mb-8">
            Open to internships, collaborations, and learning-focused opportunities.
          </p>
          
          <div className="relative bg-card rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/5">
            {/* Gradient border */}
            <div 
              className="absolute inset-0 rounded-3xl p-[2px]"
              style={{ background: gradientBorder }}
            >
              <div className="w-full h-full bg-card rounded-3xl" />
            </div>
            {/* Subtle glow */}
            <div 
              className="absolute inset-0 rounded-3xl opacity-10 blur-2xl"
              style={{ background: gradientBorder }}
            />
            <div className="relative z-10">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Terminal Mode Highlight */}
      <section className="py-16 bg-secondary/30">
        <div className="container max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-2xl font-bold mb-4">Want a More Technical View?</h3>
            <p className="text-muted-foreground mb-6">
              Explore this portfolio through an interactive terminal interface. Navigate using commands like a developer would.
            </p>
            <button
              onClick={() => {
                const terminalButton = document.querySelector('[aria-label="Toggle Terminal Mode"]') as HTMLButtonElement;
                if (terminalButton) terminalButton.click();
              }}
              className="relative px-8 py-4 font-semibold rounded-xl transition-all inline-flex items-center gap-2 group overflow-hidden"
            >
              {/* Gradient border on hover */}
              <div 
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity p-[2px]"
                style={{ background: gradientBorder }}
              >
                <div className="w-full h-full bg-primary rounded-xl" />
              </div>
              {/* Content */}
              <div className="relative z-10 flex items-center gap-2 text-primary-foreground">
                <Code size={20} />
                Launch Terminal Mode
              </div>
              {/* Glow effect */}
              <div 
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity"
                style={{ background: gradientBorder }}
              />
            </button>
            <p className="text-xs text-muted-foreground mt-4">
              Keyboard shortcut: <kbd className="px-2 py-1 bg-muted rounded text-foreground">Ctrl+K</kbd>
            </p>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} {PERSONAL_INFO.name}. Built with React & Tailwind.</p>
      </footer>
    </div>
  );
}
