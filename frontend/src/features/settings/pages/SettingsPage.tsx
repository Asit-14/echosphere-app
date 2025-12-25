import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettings } from '../components/ProfileSettings';
import { AppearanceSettings } from '../components/AppearanceSettings';
import { PrivacySettings } from '../components/PrivacySettings';
import { User, Shield, Palette, Globe } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Language</span>
          </TabsTrigger>
        </TabsList>

        <div className="bg-card border rounded-xl p-6 shadow-sm min-h-[400px]">
          <TabsContent value="profile" className="mt-0">
            <ProfileSettings />
          </TabsContent>
          
          <TabsContent value="appearance" className="mt-0">
            <AppearanceSettings />
          </TabsContent>
          
          <TabsContent value="privacy" className="mt-0">
            <PrivacySettings />
          </TabsContent>
          
          <TabsContent value="language" className="mt-0">
            <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <Globe className="h-12 w-12 text-muted-foreground/50" />
              <div>
                <h3 className="text-lg font-medium">Language Selection</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Multi-language support is coming soon. The application is currently available in English (US).
                </p>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}