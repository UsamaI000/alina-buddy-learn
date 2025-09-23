import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Mail, Shield, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { validatePassword } from '@/utils/passwordValidation';
import type { AppUser } from '@/types/auth';

interface ProfileProps {
  user: AppUser;
  language: string;
}

interface SessionInfo {
  ip: string;
  user_agent: string;
  created_at: string;
  last_seen: string;
}

export default function Profile({ user, language }: ProfileProps) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    apprenticeship: '',
    company: ''
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [newEmail, setNewEmail] = useState('');
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const { toast } = useToast();

  const t = {
    de: {
      profile: 'Profil',
      security: 'Sicherheit',
      sessions: 'Sitzungen',
      personalInfo: 'Persönliche Informationen',
      firstName: 'Vorname',
      lastName: 'Nachname',
      apprenticeship: 'Ausbildung',
      company: 'Unternehmen',
      email: 'E-Mail',
      role: 'Rolle',
      updateProfile: 'Profil aktualisieren',
      changePassword: 'Passwort ändern',
      currentPassword: 'Aktuelles Passwort',
      newPassword: 'Neues Passwort',
      confirmPassword: 'Passwort bestätigen',
      changeEmail: 'E-Mail ändern',
      newEmail: 'Neue E-Mail',
      updateEmail: 'E-Mail aktualisieren',
      activeSessions: 'Aktive Sitzungen',
      terminateSession: 'Sitzung beenden',
      terminateAll: 'Alle Sitzungen beenden',
      profileUpdated: 'Profil erfolgreich aktualisiert',
      passwordChanged: 'Passwort erfolgreich geändert',
      emailChanged: 'E-Mail erfolgreich geändert',
      passwordsNoMatch: 'Passwörter stimmen nicht überein',
      weakPassword: 'Passwort ist zu schwach'
    }
  };

  const texts = t[language as keyof typeof t] || t.de;

  useEffect(() => {
    loadProfile();
    loadSessions();
  }, []);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          apprenticeship: data.apprenticeship || '',
          company: data.company || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadSessions = async () => {
    // Mock sessions data - in real app, this would come from auth logs
    setSessions([
      {
        ip: '192.168.1.1',
        user_agent: 'Chrome 91.0 on Windows',
        created_at: new Date().toISOString(),
        last_seen: new Date().toISOString()
      }
    ]);
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: texts.profileUpdated,
        description: "Ihre Profildaten wurden erfolgreich aktualisiert."
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Profil konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      toast({
        title: texts.passwordsNoMatch,
        variant: "destructive"
      });
      return;
    }

    const validation = validatePassword(passwords.new);
    if (!validation.isValid) {
      toast({
        title: texts.weakPassword,
        description: validation.feedback.join(', '),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      setPasswords({ current: '', new: '', confirm: '' });
      toast({
        title: texts.passwordChanged,
        description: "Ihr Passwort wurde erfolgreich geändert."
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Passwort konnte nicht geändert werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const changeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      toast({
        title: texts.emailChanged,
        description: "Bestätigungslink wurde an die neue E-Mail-Adresse gesendet."
      });
      setNewEmail('');
    } catch (error) {
      toast({
        title: "Fehler",
        description: "E-Mail konnte nicht geändert werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {texts.profile}
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Kontoinformationen und Sicherheitseinstellungen
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {texts.profile}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {texts.security}
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              {texts.sessions}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{texts.personalInfo}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={updateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{texts.firstName}</Label>
                      <Input
                        id="firstName"
                        value={profile.first_name}
                        onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{texts.lastName}</Label>
                      <Input
                        id="lastName"
                        value={profile.last_name}
                        onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="apprenticeship">{texts.apprenticeship}</Label>
                    <Input
                      id="apprenticeship"
                      value={profile.apprenticeship}
                      onChange={(e) => setProfile({...profile, apprenticeship: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="company">{texts.company}</Label>
                    <Input
                      id="company"
                      value={profile.company}
                      onChange={(e) => setProfile({...profile, company: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>{texts.email}</Label>
                    <div className="flex items-center gap-2">
                      <Input value={user.email} disabled />
                      <Badge variant="secondary">{texts.role}: {user.role}</Badge>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? 'Aktualisierung...' : texts.updateProfile}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {texts.changePassword}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={changePassword} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">{texts.currentPassword}</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwords.current}
                      onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="newPassword">{texts.newPassword}</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    />
                    {passwords.new && (
                      <PasswordStrengthIndicator password={passwords.new} />
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">{texts.confirmPassword}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? 'Änderung...' : texts.changePassword}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  {texts.changeEmail}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={changeEmail} className="space-y-4">
                  <div>
                    <Label>Aktuelle E-Mail</Label>
                    <Input value={user.email} disabled />
                  </div>
                  
                  <div>
                    <Label htmlFor="newEmail">{texts.newEmail}</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="neue@email.de"
                    />
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Sie erhalten eine Bestätigungs-E-Mail an die neue Adresse.
                    </AlertDescription>
                  </Alert>

                  <Button type="submit" disabled={loading || !newEmail}>
                    {loading ? 'Änderung...' : texts.updateEmail}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{texts.activeSessions}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessions.map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{session.user_agent}</p>
                      <p className="text-sm text-muted-foreground">IP: {session.ip}</p>
                      <p className="text-sm text-muted-foreground">
                        Zuletzt aktiv: {new Date(session.last_seen).toLocaleString('de')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Aktuelle Sitzung
                      </Badge>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <Button variant="destructive" disabled={loading}>
                  {texts.terminateAll}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}