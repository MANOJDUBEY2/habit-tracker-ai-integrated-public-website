/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Mail, Lock, User, ArrowRight, CornerDownRight, CheckCircle2, AlertCircle } from "lucide-react";
import { UserProfile } from "../types";
import { dbService, isSupabaseConfigured, supabase } from "../supabaseClient";

interface AuthProps {
  id?: string;
  mode: "login" | "register";
  onLoginSuccess: (user: UserProfile) => void;
  onNavigate: (page: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ id, mode, onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Inline validation checks
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (mode === "register") {
      if (!fullName.trim()) {
        setErrorMsg("Full Name is required.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured() && supabase) {
        // Real Supabase Auth Trigger and handling
        if (mode === "register") {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName }
            }
          });
          if (error) throw error;
          
          setSuccessMsg("Account created! Logging you into AccountaAI...");
          setTimeout(async () => {
            const profile = await dbService.getProfile();
            onLoginSuccess(profile);
          }, 1500);
        } else {
          // Login
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;

          const profile = await dbService.getProfile();
          onLoginSuccess(profile);
        }
      } else {
        // Offline / Sandbox Demo Mode
        setTimeout(async () => {
          if (mode === "register") {
            const newUser = dbService.localSignUp(fullName, email);
            setSuccessMsg("Account created! Let's build your coach brain.");
            setTimeout(() => {
              onLoginSuccess(newUser);
            }, 1000);
          } else {
            const currentProfile = await dbService.getProfile();
            // Mock successful login state and sync
            const updated: UserProfile = {
              ...currentProfile,
              email: email,
              name: currentProfile.name || "Adventurer",
            };
            await dbService.updateProfile(updated);
            onLoginSuccess(updated);
          }
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication process failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleOAuth = () => {
    setErrorMsg("");
    setIsLoading(true);
    
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin
        }
      });
    } else {
      // Offline Demo OAuth
      setTimeout(async () => {
        const oauthUser = dbService.localSignUp("Google User", email || "google@accountaai.com");
        onLoginSuccess(oauthUser);
        setIsLoading(false);
      }, 700);
    }
  };

  const handleForgotPassword = () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!email) {
      setErrorMsg("Please enter your email to request recovery link.");
      return;
    }
    
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/settings`
      }).then(({ error }) => {
        if (error) setErrorMsg(error.message);
        else setSuccessMsg("Password reset email dispatched to your inbox.");
      });
    } else {
      setSuccessMsg("Demo recovery dispatch triggered successfully.");
    }
  };

  return (
    <div id={id} className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-linear-to-b from-gray-50 to-white dark:from-[#0F0F0F] dark:to-[#121212]">
      <div className="w-full max-w-md p-8 bg-white dark:bg-[#1A1A1A] border border-gray-150 dark:border-neutral-800 rounded-2xl shadow-xs space-y-6">
        
        {/* Banner header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-5050 flex items-center justify-center text-white">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white font-sans tracking-tight leading-none pt-1">
            {mode === "register" ? "Create Account" : "Access Coaching Brain"}
          </h2>
          <p className="text-xs text-gray-500 dark:text-neutral-400 font-medium">
            {mode === "register" 
              ? "Start built-in daily accountability loops."
              : "Verify your logins to interact with AccountaAI."}
          </p>
        </div>

        {/* Error / Success feedback blocks */}
        {errorMsg && (
          <div className="p-3 bg-rose-50/70 border border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20 rounded-lg flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 font-mono">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50/70 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 rounded-lg flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          
          {mode === "register" && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold font-mono uppercase text-gray-500 dark:text-neutral-400">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Rahul"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-600 focus:bg-white min-h-[44px]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold font-mono uppercase text-gray-500 dark:text-neutral-400">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="coaching@accountaai.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-600 focus:bg-white min-h-[44px]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold font-mono uppercase text-gray-500 dark:text-neutral-400">
                Password
              </label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[10px] text-gray-450 hover:text-indigo-500 font-mono font-medium underline"
                >
                  Forgot passcode?
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-600 focus:bg-white min-h-[44px]"
              />
            </div>
          </div>

          {mode === "register" && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold font-mono uppercase text-gray-500 dark:text-neutral-400">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="******"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-600 focus:bg-white min-h-[44px]"
                />
              </div>
            </div>
          )}

          {mode === "login" && (
            <div className="flex items-center gap-2 py-1">
              <input
                id="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-sm text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer min-h-[20px] min-w-[20px]"
              />
              <label htmlFor="remember_me" className="text-xs text-gray-500 select-none cursor-pointer">
                Remember my coaching session
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg text-sm transition-colors cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {mode === "register" ? "Sign Up" : "Sign In"} <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-150 dark:border-neutral-800" />
          <span className="flex-shrink mx-4 text-[10px] font-mono text-gray-400 uppercase">Or secure with</span>
          <div className="flex-grow border-t border-gray-150 dark:border-neutral-800" />
        </div>

        {/* Google OAuth trigger */}
        <button
          onClick={handleGoogleOAuth}
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-white dark:bg-[#1A1A1A] hover:bg-gray-50 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 rounded-lg text-xs font-semibold text-gray-700 dark:text-neutral-300 transition-colors cursor-pointer min-h-[44px] flex items-center justify-center gap-2.5"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.488 0-6.315-2.827-6.315-6.315 0-3.488 2.827-6.315 6.315-6.315 1.512 0 2.896.533 3.991 1.414l3.051-3.051C18.835 1.938 15.685 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.807 0 10.748-4.144 10.748-11.24 0-.585-.051-1.144-.144-1.685l-10.604-.27Z"
            />
          </svg>
          Continue with Google Account
        </button>

        <div className="text-center pt-2">
          <button
            onClick={() => onNavigate(mode === "register" ? "login" : "register")}
            className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            {mode === "register" 
              ? "Already have coaching logins? Sign In" 
              : "New to AccountaAI? Create an account here"}
          </button>
        </div>
      </div>
    </div>
  );
};
