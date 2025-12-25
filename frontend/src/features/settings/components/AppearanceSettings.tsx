import { useTheme } from '@/context/ThemeContext';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Moon, Sun, Monitor } from 'lucide-react';

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-medium">Theme</h3>
        <p className="text-sm text-muted-foreground">
          Select your preferred theme for the application.
        </p>
      </div>
      
      <RadioGroup 
        defaultValue={theme} 
        onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
        className="grid grid-cols-3 gap-4"
      >
        <div>
          <RadioGroupItem value="light" id="light" className="peer sr-only" />
          <Label
            htmlFor="light"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
          >
            <Sun className="mb-3 h-6 w-6" />
            Light
          </Label>
        </div>
        <div>
          <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
          <Label
            htmlFor="dark"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
          >
            <Moon className="mb-3 h-6 w-6" />
            Dark
          </Label>
        </div>
        <div>
          <RadioGroupItem value="system" id="system" className="peer sr-only" />
          <Label
            htmlFor="system"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
          >
            <Monitor className="mb-3 h-6 w-6" />
            System
          </Label>
        </div>
      </RadioGroup>

      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-2">Density</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Adjust the information density of the interface.
        </p>
        {/* Placeholder for density toggle */}
        <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20 opacity-50 cursor-not-allowed">
           <span className="text-sm font-medium">Compact Mode</span>
           <span className="text-xs text-muted-foreground ml-auto">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}