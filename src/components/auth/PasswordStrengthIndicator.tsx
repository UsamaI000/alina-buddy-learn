import { Progress } from "@/components/ui/progress";
import { validatePassword, getPasswordStrengthInfo } from "@/utils/passwordValidation";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({ password, className = "" }: PasswordStrengthIndicatorProps) {
  const validation = validatePassword(password);
  const strengthInfo = getPasswordStrengthInfo(validation.score);

  if (!password) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Passwort-Stärke:</span>
        <span className={`text-sm font-medium ${strengthInfo.color}`}>
          {strengthInfo.text}
        </span>
      </div>
      
      <Progress 
        value={(validation.score / 4) * 100} 
        className="h-2"
      />
      
      {validation.feedback.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-1">
          {validation.feedback.map((item, index) => (
            <li key={index} className="flex items-center">
              <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}