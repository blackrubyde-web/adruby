import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const PasswordChangeSection = ({ onPasswordUpdate }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [changing, setChanging] = useState(false);
  const [errors, setErrors] = useState({});

  const validatePassword = (password) => {
    const minLength = password?.length >= 6;
    const hasUpperCase = /[A-Z]/?.test(password);
    const hasLowerCase = /[a-z]/?.test(password);
    const hasNumbers = /\d/?.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers
    };
  };

  const handleInputChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev?.[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!passwordData?.currentPassword?.trim()) {
      newErrors.currentPassword = 'Aktuelles Passwort ist erforderlich';
    }
    
    if (!passwordData?.newPassword?.trim()) {
      newErrors.newPassword = 'Neues Passwort ist erforderlich';
    } else {
      const passwordValidation = validatePassword(passwordData?.newPassword);
      if (!passwordValidation?.isValid) {
        newErrors.newPassword = 'Passwort erfüllt nicht alle Anforderungen';
      }
    }
    
    if (!passwordData?.confirmPassword?.trim()) {
      newErrors.confirmPassword = 'Passwort bestätigung ist erforderlich';
    } else if (passwordData?.newPassword !== passwordData?.confirmPassword) {
      newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
    }
    
    if (passwordData?.currentPassword === passwordData?.newPassword) {
      newErrors.newPassword = 'Neues Passwort muss sich vom aktuellen unterscheiden';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors)?.length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setChanging(true);
    setErrors({});
    
    try {
      const result = await onPasswordUpdate(
        passwordData?.currentPassword, 
        passwordData?.newPassword
      );
      
      if (result?.success) {
        // Reset form on success
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswords({
          current: false,
          new: false,
          confirm: false
        });
      }
    } catch (error) {
      setErrors({ submit: error?.message });
    } finally {
      setChanging(false);
    }
  };

  const passwordValidation = passwordData?.newPassword ? 
    validatePassword(passwordData?.newPassword) : null;

  return (
    <div className="space-y-6">
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Current Password */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Aktuelles Passwort *
          </label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showPasswords?.current ? 'text' : 'password'}
              value={passwordData?.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e?.target?.value)}
              placeholder="Ihr aktuelles Passwort"
              disabled={changing}
              className={`pl-10 pr-12 py-3 w-full border rounded-lg transition-colors ${
                errors?.currentPassword ? 
                'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500 focus:border-transparent'
              }`}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="Lock" size={18} className="text-gray-400" />
            </div>
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <Icon name={showPasswords?.current ? "EyeOff" : "Eye"} size={18} />
            </button>
          </div>
          {errors?.currentPassword && (
            <p className="mt-1 text-sm text-red-600">{errors?.currentPassword}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Neues Passwort *
          </label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPasswords?.new ? 'text' : 'password'}
              value={passwordData?.newPassword}
              onChange={(e) => handleInputChange('newPassword', e?.target?.value)}
              placeholder="Ihr neues Passwort"
              disabled={changing}
              className={`pl-10 pr-12 py-3 w-full border rounded-lg transition-colors ${
                errors?.newPassword ? 
                'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500 focus:border-transparent'
              }`}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="Key" size={18} className="text-gray-400" />
            </div>
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <Icon name={showPasswords?.new ? "EyeOff" : "Eye"} size={18} />
            </button>
          </div>
          {errors?.newPassword && (
            <p className="mt-1 text-sm text-red-600">{errors?.newPassword}</p>
          )}
          
          {/* Password Strength Indicator */}
          {passwordData?.newPassword && passwordValidation && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm font-medium text-gray-700 mb-2">Passwort-Anforderungen:</p>
              <div className="space-y-1">
                <div className={`flex items-center text-xs ${
                  passwordValidation?.minLength ? 'text-green-600' : 'text-gray-500'
                }`}>
                  <Icon 
                    name={passwordValidation?.minLength ? "CheckCircle" : "Circle"} 
                    size={14} 
                    className="mr-2" 
                  />
                  Mindestens 6 Zeichen
                </div>
                <div className={`flex items-center text-xs ${
                  passwordValidation?.hasUpperCase ? 'text-green-600' : 'text-gray-500'
                }`}>
                  <Icon 
                    name={passwordValidation?.hasUpperCase ? "CheckCircle" : "Circle"} 
                    size={14} 
                    className="mr-2" 
                  />
                  Mindestens einen Großbuchstaben
                </div>
                <div className={`flex items-center text-xs ${
                  passwordValidation?.hasLowerCase ? 'text-green-600' : 'text-gray-500'
                }`}>
                  <Icon 
                    name={passwordValidation?.hasLowerCase ? "CheckCircle" : "Circle"} 
                    size={14} 
                    className="mr-2" 
                  />
                  Mindestens einen Kleinbuchstaben
                </div>
                <div className={`flex items-center text-xs ${
                  passwordValidation?.hasNumbers ? 'text-green-600' : 'text-gray-500'
                }`}>
                  <Icon 
                    name={passwordValidation?.hasNumbers ? "CheckCircle" : "Circle"} 
                    size={14} 
                    className="mr-2" 
                  />
                  Mindestens eine Zahl
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Passwort bestätigen *
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showPasswords?.confirm ? 'text' : 'password'}
              value={passwordData?.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
              placeholder="Passwort erneut eingeben"
              disabled={changing}
              className={`pl-10 pr-12 py-3 w-full border rounded-lg transition-colors ${
                errors?.confirmPassword ? 
                'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500 focus:border-transparent'
              }`}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="Shield" size={18} className="text-gray-400" />
            </div>
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <Icon name={showPasswords?.confirm ? "EyeOff" : "Eye"} size={18} />
            </button>
          </div>
          {errors?.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors?.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={changing || !passwordData?.currentPassword || !passwordData?.newPassword || !passwordData?.confirmPassword}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {changing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Passwort wird geändert...
              </div>
            ) : (
              'Passwort ändern'
            )}
          </Button>
        </div>

      </form>

      {/* Security Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Shield" size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-800">Sicherheits-Tipps</h4>
            <div className="text-sm text-amber-700 mt-1">
              <ul className="space-y-1 list-disc list-inside">
                <li>Verwenden Sie ein starkes, einzigartiges Passwort</li>
                <li>Teilen Sie Ihr Passwort niemals mit anderen</li>
                <li>Ändern Sie Ihr Passwort regelmäßig</li>
                <li>Verwenden Sie einen Passwort-Manager</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PasswordChangeSection;