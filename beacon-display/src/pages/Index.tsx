import { Link } from "react-router-dom";
import { useMongoAuth } from "@/hooks/useMongoAuth";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { InfoBar } from "@/components/InfoBar";
import { Monitor, ArrowRight, Users, Zap, Globe, Shield } from "lucide-react";

export default function Index() {
  const { user } = useMongoAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20 pb-20">
        {/* Hero Section */}
        <section className="relative py-20 px-6 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-primary">
                Real-time Digital Signage
              </span>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              KU <span className="text-gradient">Notice Board</span>
            </h1>

            <p
              className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              A modern digital display system for managing and presenting
              notices in real-time across all connected displays.
            </p>

            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <Link to="/display">
                <Button variant="glow" size="xl" className="gap-2">
                  <Monitor className="w-5 h-5" />
                  View Display
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>

              {user ? (
                <Link to="/dashboard">
                  <Button variant="outline" size="xl">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="xl">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
              <p className="text-muted-foreground">
                Everything you need for digital sign
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Zap,
                  title: "Real-time Updates",
                  description:
                    "Changes appear instantly on all connected display",
                },
                {
                  icon: Users,
                  title: "Role-based Access",
                  description:
                    "Admin and user roles with appropriate permission",
                },
                {
                  icon: Globe,
                  title: "Access Anywhere",
                  description: "Manage notices from any device, anywhere",
                },
                {
                  icon: Shield,
                  title: "Secure System",
                  description:
                    "Protected with authentication and authorization",
                },
              ].map((feature, i) => (
                <div
                  key={feature.title}
                  className="glass-panel p-6 text-center animate-fade-in"
                  style={{ animationDelay: `${0.1 * (i + 1)}s` }}
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/20 flex items-center justify-center">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="glass-panel p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
              <div className="relative">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Sign in to manage notices or view the display screen
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/display">
                    <Button variant="glow" size="lg" className="gap-2">
                      <Monitor className="w-5 h-5" />
                      Open Display
                    </Button>
                  </Link>
                  {!user && (
                    <Link to="/auth">
                      <Button variant="outline" size="lg">
                        Sign In to Manage
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <InfoBar />
    </div>
  );
}
