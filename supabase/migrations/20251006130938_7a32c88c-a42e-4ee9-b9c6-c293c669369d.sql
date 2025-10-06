-- Enable instructors to view all profiles
CREATE POLICY "Instructors can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'AUSBILDER_IN'::app_role));

-- Insert test learning modules for Kfz-Mechatroniker/in
INSERT INTO public.learning_modules (title, description, apprenticeship) VALUES
('Grundlagen der Fahrzeugtechnik', 'Einführung in die Grundlagen der Fahrzeugtechnik und -mechanik', 'Kfz-Mechatroniker/in'),
('Elektrische Systeme im Fahrzeug', 'Verstehen und Arbeiten mit elektrischen Fahrzeugsystemen', 'Kfz-Mechatroniker/in'),
('Diagnose und Fehlersuche', 'Systematische Fehlersuche und Diagnose an Fahrzeugen', 'Kfz-Mechatroniker/in'),
('Wartung und Instandhaltung', 'Regelmäßige Wartungsarbeiten und Instandhaltung', 'Kfz-Mechatroniker/in');

-- Insert example tasks for test azubi user (using the user_id from profiles where email matches)
INSERT INTO public.tasks (user_id, title, description, learning_module_id, status, due_date)
SELECT 
  p.user_id,
  'Bremsanlage prüfen',
  'Überprüfen Sie die Bremsanlage gemäß Herstellervorgaben',
  (SELECT id FROM public.learning_modules WHERE title = 'Wartung und Instandhaltung' LIMIT 1),
  'OPEN',
  now() + interval '7 days'
FROM public.profiles p
WHERE p.role = 'AUSZUBILDENDE_R'
LIMIT 1;

INSERT INTO public.tasks (user_id, title, description, learning_module_id, status, due_date)
SELECT 
  p.user_id,
  'Elektrische Diagnose durchführen',
  'Führen Sie eine Diagnose am elektrischen System durch',
  (SELECT id FROM public.learning_modules WHERE title = 'Elektrische Systeme im Fahrzeug' LIMIT 1),
  'OPEN',
  now() + interval '14 days'
FROM public.profiles p
WHERE p.role = 'AUSZUBILDENDE_R'
LIMIT 1;

INSERT INTO public.tasks (user_id, title, description, learning_module_id, status, due_date)
SELECT 
  p.user_id,
  'Grundlagen-Test absolvieren',
  'Absolvieren Sie den Grundlagen-Test',
  (SELECT id FROM public.learning_modules WHERE title = 'Grundlagen der Fahrzeugtechnik' LIMIT 1),
  'DONE',
  now() - interval '3 days'
FROM public.profiles p
WHERE p.role = 'AUSZUBILDENDE_R'
LIMIT 1;

-- Insert example events
INSERT INTO public.events (user_id, title, description, start_time, end_time)
SELECT 
  p.user_id,
  'Werkstatt-Einführung',
  'Einführung in die Werkstattabläufe',
  now() + interval '2 days',
  now() + interval '2 days' + interval '2 hours'
FROM public.profiles p
WHERE p.role = 'AUSZUBILDENDE_R'
LIMIT 1;

INSERT INTO public.events (user_id, title, description, start_time, end_time)
SELECT 
  p.user_id,
  'Theorieprüfung',
  'Zwischenprüfung Theorie',
  now() + interval '30 days',
  now() + interval '30 days' + interval '3 hours'
FROM public.profiles p
WHERE p.role = 'AUSZUBILDENDE_R'
LIMIT 1;