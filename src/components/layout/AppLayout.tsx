import { Outlet, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { ProfileCompletionBanner } from '@/components/auth/ProfileCompletionBanner';
import type { AppUser } from '@/types/auth';

interface AppLayoutProps {
  currentUser: AppUser;
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  showProfileBanner: boolean;
}

export function AppLayout({ 
  currentUser, 
  currentLanguage, 
  onLanguageChange, 
  showProfileBanner 
}: AppLayoutProps) {
  const navigate = useNavigate();

  return (
    <>
      <Navigation 
        currentUser={currentUser}
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
      />
      {showProfileBanner && (
        <div className="container mx-auto px-4 pt-4">
          <ProfileCompletionBanner
            user={currentUser}
            onNavigateToProfile={() => navigate('/profile')}
            language={currentLanguage}
          />
        </div>
      )}
      <Outlet />
    </>
  );
}
