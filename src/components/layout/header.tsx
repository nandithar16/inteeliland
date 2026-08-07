import { Button } from "@/components/ui/button";
import { MapPin, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
}

export function Header({ title = "Intelland", showBackButton = false, onBack, className }: HeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    try {
      if (onBack) return onBack();
      // default: navigate back in history, fall back to home
      navigate(-1);
    } catch (e) {
      navigate('/');
    }
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-lg shadow-sm supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container mx-auto flex h-20 max-w-screen-2xl items-center gap-4 px-4">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-9 w-9 rounded-full border border-border/50 bg-background/90 text-foreground"
            >
              ←
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-button">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground">Land Parcel Assessment Tool</p>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 shadow-sm">
            Professional, polished design
          </span>
        </div>
      </div>
    </header>
  );
}