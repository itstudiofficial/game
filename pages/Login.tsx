
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
                <i className={`fa-solid ${isRegistering ? 'fa-user-plus' : 'fa-lock'} text-3xl transition-transform duration-300`}></i>
              </div>
              <h2 className="text-2xl font-bold transition-all duration-300">
                {isRegistering ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-indigo-100 text-sm mt-2">
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
              <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <i className="fa-solid fa-user"></i>
                </span>
                <input 
                  type="text" 
                  disabled={isSubmitting}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="john_doe" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Email Field (Only for Signup) */}
            {isRegistering && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <i className="fa-solid fa-envelope"></i>
                  </span>
                  <input 
                    type="email" 
                    disabled={isSubmitting}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="john@example.com" 
                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${emailError ? 'border-red-500 ring-1 ring-red-100' : 'border-slate-200'} rounded-xl focus:ring-2 ${emailError ? 'focus:ring-red-500' : 'focus:ring-indigo-500'} focus:border-transparent outline-none transition-all disabled:opacity-50`}
                    required={isRegistering}
                  />
                </div>
                {emailError && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center">
                    <i className="fa-solid fa-circle-exclamation mr-1"></i>
                    {emailError}
                  </p>
                )}
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <i className="fa-solid fa-key"></i>
                </span>
                <input 
                  type="password" 
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Options Row for Login */}
            {!isRegistering && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-slate-500 cursor-pointer">
                  <input type="checkbox" disabled={isSubmitting} className="rounded text-indigo-600 mr-2 focus:ring-indigo-500 disabled:opacity-50" />
                  Remember me
                </label>
                <a href="#" className="text-indigo-600 font-bold hover:underline">Forgot Password?</a>
              </div>
            )}

            {/* Terms for Signup */}
            {isRegistering && (
              <p className="text-xs text-slate-400 animate-in fade-in duration-500">
                By signing up, you agree to our <a href="#" className="text-indigo-600 underline hover:text-indigo-700">Terms of Service</a> and <a href="#" className="text-indigo-600 underline hover:text-indigo-700">Privacy Policy</a>.
              </p>
            )}

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center overflow-hidden ${isSubmitting ? 'bg-indigo-500 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-center transition-all duration-300">
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin mr-3 text-xl"></i>
                    <span>{isRegistering ? 'Creating Account...' : 'Verifying...'}</span>
                  </>
                ) : (
                  <span>{isRegistering ? 'Create Account' : 'Login to Account'}</span>
                )}
              </div>
              
              {!isSubmitting && (
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 group-hover:animate-shine" />
              )}
            </button>
          </form>

          {/* Toggle Footer */}
          <div className="px-8 pb-8 text-center border-t border-slate-50 pt-6">
            <p className="text-slate-500 text-sm">
              {isRegistering ? 'Already have an account?' : "Don't have an account?"} 
              <button 
                type="button"
                onClick={() => !isSubmitting && toggleMode()}
                className={`text-indigo-600 font-bold hover:underline ml-1 focus:outline-none ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
