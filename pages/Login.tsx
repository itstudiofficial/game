
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!username || !password || (isRegistering && !email)) {
      alert('Please fill in all required fields.');
      return;
    }

    if (isRegistering && !validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API delay for both Login and Signup
    setTimeout(() => {
      onLogin(username);
      setIsSubmitting(false);
    }, 1500); 
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setEmailError('');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-500">
          {/* Header Section */}
          <div className="bg-indigo-600 p-8 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-in fade-in zoom-in duration-500">
                <i className={`fa-solid ${isRegistering ? 'fa-user-plus' : 'fa-lock'} text-3xl transition-transform duration-300`} aria-hidden="true"></i>
              </div>
              <h1 className="text-2xl font-bold transition-all duration-300">
                {isRegistering ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="text-indigo-50 text-sm mt-2 font-medium">
                {isRegistering 
                  ? 'Join thousands of earners today' 
                  : 'Enter your credentials to access your account'}
              </p>
            </div>
            {/* Background Decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-slate-800 mb-2">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <i className="fa-solid fa-user" aria-hidden="true"></i>
                </span>
                <input 
                  id="username"
                  type="text" 
                  autoComplete="username"
                  disabled={isSubmitting}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="john_doe" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all disabled:opacity-50 placeholder-slate-400 text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Email Field (Only for Signup) */}
            {isRegistering && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                <label htmlFor="email" className="block text-sm font-bold text-slate-800 mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                    <i className="fa-solid fa-envelope" aria-hidden="true"></i>
                  </span>
                  <input 
                    id="email"
                    type="email" 
                    autoComplete="email"
                    disabled={isSubmitting}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "email-error" : undefined}
                    placeholder="john@example.com" 
                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${emailError ? 'border-red-600 ring-1 ring-red-100' : 'border-slate-300'} rounded-xl focus:ring-2 ${emailError ? 'focus:ring-red-600' : 'focus:ring-indigo-600'} focus:border-transparent outline-none transition-all disabled:opacity-50 placeholder-slate-400 text-slate-900`}
                    required={isRegistering}
                  />
                </div>
                {emailError && (
                  <p id="email-error" className="text-red-700 text-xs mt-1.5 font-bold flex items-center">
                    <i className="fa-solid fa-circle-exclamation mr-1" aria-hidden="true"></i>
                    {emailError}
                  </p>
                )}
              </div>
            )}

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-800 mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <i className="fa-solid fa-key" aria-hidden="true"></i>
                </span>
                <input 
                  id="password"
                  type="password" 
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all disabled:opacity-50 placeholder-slate-400 text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Options Row for Login */}
            {!isRegistering && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-slate-700 cursor-pointer font-medium">
                  <input 
                    type="checkbox" 
                    disabled={isSubmitting} 
                    className="w-4 h-4 rounded text-indigo-600 mr-2 border-slate-300 focus:ring-indigo-600 disabled:opacity-50" 
                  />
                  Remember me
                </label>
                <a href="#" className="text-indigo-700 font-bold hover:underline hover:text-indigo-800 transition-colors">Forgot Password?</a>
              </div>
            )}

            {/* Terms for Signup */}
            {isRegistering && (
              <p className="text-xs text-slate-600 font-medium animate-in fade-in duration-500 leading-relaxed">
                By signing up, you agree to our <a href="#" className="text-indigo-700 underline font-bold hover:text-indigo-900">Terms of Service</a> and <a href="#" className="text-indigo-700 underline font-bold hover:text-indigo-900">Privacy Policy</a>.
              </p>
            )}

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center overflow-hidden ${isSubmitting ? 'bg-indigo-500 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-center transition-all duration-300 relative z-10">
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin mr-3 text-xl" aria-hidden="true"></i>
                    <span>{isRegistering ? 'Creating Account...' : 'Verifying...'}</span>
                  </>
                ) : (
                  <span>{isRegistering ? 'Create Account' : 'Login to Account'}</span>
                )}
              </div>
              
              {!isSubmitting && (
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 group-hover:animate-shine" aria-hidden="true" />
              )}
            </button>
          </form>

          {/* Toggle Footer */}
          <div className="px-8 pb-8 text-center border-t border-slate-100 pt-6">
            <p className="text-slate-700 text-sm font-medium">
              {isRegistering ? 'Already have an account?' : "Don't have an account?"} 
              <button 
                type="button"
                onClick={() => !isSubmitting && toggleMode()}
                className={`text-indigo-700 font-bold hover:underline ml-1 focus:outline-none focus:text-indigo-900 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRegistering ? 'Login here' : 'Sign up for free'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
