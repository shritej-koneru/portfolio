import { motion } from "framer-motion";
import { useProjects, useSkills, useExperience, useContactMutation } from "@/hooks/use-portfolio";
import { Github, Globe, Mail, Send, Calendar, Briefcase, Code, Terminal as TerminalIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMessageSchema, type InsertMessage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// --- Components ---

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-12">
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{title}</h2>
      <div className="h-1 w-20 bg-primary rounded-full mb-4"></div>
      <p className="text-muted-foreground text-lg max-w-2xl">{subtitle}</p>
    </div>
  );
}

function ProjectCard({ project, index }: { project: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full"
    >
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Code size={24} />
          </div>
          <div className="flex gap-2">
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Github size={20} />
              </a>
            )}
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
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

function ExperienceItem({ item, index }: { item: any; index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative pl-8 md:pl-0 border-l-2 border-border md:border-none pb-12 last:pb-0"
    >
      {/* Timeline connector for mobile */}
      <div className="absolute left-[-5px] top-0 h-3 w-3 rounded-full bg-primary md:hidden" />

      <div className="md:grid md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4 text-right pr-8 relative hidden md:block">
           <div className="text-sm font-semibold text-primary mb-1">{item.duration}</div>
           <div className="text-lg font-bold">{item.company}</div>
           <div className="absolute right-[-21px] top-1 h-4 w-4 rounded-full border-4 border-background bg-primary z-10 shadow-sm" />
        </div>
        
        <div className="md:col-span-1 relative hidden md:block">
          <div className="h-full w-[2px] bg-border mx-auto relative"></div>
        </div>

        <div className="md:col-span-7">
          <div className="md:hidden mb-2">
            <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded">{item.duration}</span>
          </div>
          <h3 className="text-xl font-bold mb-1">{item.role}</h3>
          <h4 className="text-lg text-muted-foreground mb-4 md:hidden">{item.company}</h4>
          <p className="text-muted-foreground leading-relaxed">{item.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ContactForm() {
  const { toast } = useToast();
  const mutation = useContactMutation();
  const form = useForm<InsertMessage>({
    resolver: zodResolver(insertMessageSchema),
    defaultValues: { name: "", email: "", message: "" }
  });

  const onSubmit = (data: InsertMessage) => {
    mutation.mutate(data, {
      onSuccess: () => {
        toast({ title: "Message sent!", description: "I'll get back to you soon." });
        form.reset();
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <input 
            {...form.register("name")}
            className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            placeholder="John Doe"
          />
          {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input 
            {...form.register("email")}
            className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            placeholder="john@example.com"
          />
           {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Message</label>
        <textarea 
          {...form.register("message")}
          rows={5}
          className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
          placeholder="Tell me about your project..."
        />
         {form.formState.errors.message && <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>}
      </div>
      <button 
        disabled={mutation.isPending}
        className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {mutation.isPending ? "Sending..." : <>Send Message <Send size={18} /></>}
      </button>
    </form>
  );
}

// --- Main View ---

export function GuiView() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: skills, isLoading: skillsLoading } = useSkills();
  const { data: experience, isLoading: expLoading } = useExperience();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20">
      
      {/* Hero Section */}
      <section className="min-h-[90vh] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        <div className="container max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
              Available for hire
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.1]">
              Building digital <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
                experiences that matter.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
              I'm a Full Stack Engineer passionate about crafting accessible, pixel-perfect user interfaces that blend art and engineering.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <a href="#contact" className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                Get in touch
              </a>
              <a href="#projects" className="px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-all">
                View Work
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-6">
          <SectionHeader title="Technical Skills" subtitle="The technologies I use to bring ideas to life." />
          
          {skillsLoading ? (
             <div className="animate-pulse h-32 bg-muted rounded-2xl"></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {['Frontend', 'Backend', 'Tools'].map((category, idx) => (
                <motion.div 
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-background rounded-2xl p-6 border shadow-sm"
                >
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills?.filter((s: any) => s.category === category).map((skill: any) => (
                      <span key={skill.id} className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm rounded-lg hover:bg-primary/10 transition-colors cursor-default">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-24" id="experience">
        <div className="container max-w-4xl mx-auto px-6">
          <SectionHeader title="Experience" subtitle="My professional journey through the tech industry." />
          
          <div className="space-y-0">
            {expLoading ? (
              <p>Loading...</p>
            ) : (
              experience?.sort((a: any, b: any) => a.order - b.order).map((item: any, idx: number) => (
                <ExperienceItem key={item.id} item={item} index={idx} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-24 bg-secondary/30" id="projects">
        <div className="container max-w-6xl mx-auto px-6">
          <SectionHeader title="Featured Projects" subtitle="A selection of my recent work." />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projectsLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse"></div>)
            ) : (
              projects?.map((project: any, idx: number) => (
                <ProjectCard key={project.id} project={project} index={idx} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24" id="contact">
        <div className="container max-w-4xl mx-auto px-6">
          <SectionHeader title="Let's Talk" subtitle="Have a project in mind? Send me a message." />
          
          <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/5">
            <ContactForm />
          </div>
        </div>
      </section>

      <footer className="py-12 border-t text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} Developer Portfolio. Built with React & Tailwind.</p>
      </footer>
    </div>
  );
}
