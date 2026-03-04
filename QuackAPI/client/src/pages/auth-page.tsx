import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowRight, CheckCircle2, ArrowLeft, Menu, X, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot, REGEXP_ONLY_DIGITS } from "@/components/ui/input-otp";
import { insertUserSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/seo";

const navLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "API", href: "/#api" },
  { label: "Features", href: "/#features" },
  { label: "Use Cases", href: "/#use-cases" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetOtpSchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit code"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const masked = local.length <= 2 ? local[0] + "*" : local[0] + "***" + local.slice(-1);
  return `${masked}@${domain}`;
}

function useResendCountdown(initial = 60) {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    setSeconds(initial);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  return { seconds, start };
}

export default function AuthPage() {
  const { user, loginMutation } = useAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  type AuthView = "login" | "forgot" | "verify-email" | "reset-otp";
  const [authView, setAuthView] = useState<AuthView>("login");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [verifyOtp, setVerifyOtp] = useState("");
  const [resetOtpValue, setResetOtpValue] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const verifyCountdown = useResendCountdown(60);
  const resetCountdown = useResendCountdown(60);

  useEffect(() => {
    if (user) setLocation("/");
  }, [user, setLocation]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const forgotForm = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const resetOtpForm = useForm<z.infer<typeof resetOtpSchema>>({
    resolver: zodResolver(resetOtpSchema),
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof registerSchema>) => {
      const { confirmPassword: _, ...payload } = data;
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Registration failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.requiresVerification) {
        setPendingId(data.pendingId);
        setPendingEmail(registerForm.getValues("email"));
        setVerifyOtp("");
        setAuthView("verify-email");
        verifyCountdown.start();
        toast({ title: "Check your email", description: "We sent a 6-digit verification code to your email." });
      } else if (data.token) {
        localStorage.setItem("auth_token", data.token);
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        setLocation("/");
      }
    },
    onError: (err: Error) => {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async ({ pendingId, otp }: { pendingId: string; otp: string }) => {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingId, otp }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Verification failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/");
    },
    onError: (err: Error) => {
      toast({ title: "Verification failed", description: err.message, variant: "destructive" });
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: async (pendingId: string) => {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to resend code");
      }
      return res.json();
    },
    onSuccess: () => {
      verifyCountdown.start();
      toast({ title: "Code resent", description: "A new verification code has been sent." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const forgotMutation = useMutation({
    mutationFn: async (data: z.infer<typeof forgotSchema>) => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: () => {
      setResetEmail(forgotForm.getValues("email"));
      setResetOtpValue("");
      resetOtpForm.reset();
      setAuthView("reset-otp");
      resetCountdown.start();
      toast({ title: "Check your email", description: "We sent a 6-digit reset code to your email." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const resendResetMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: () => {
      resetCountdown.start();
      toast({ title: "Code resent", description: "A new reset code has been sent." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (data: z.infer<typeof resetOtpSchema>) => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp: data.otp, newPassword: data.newPassword }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: () => {
      setAuthView("login");
      setResetEmail("");
      toast({ title: "Password reset", description: "Your password has been reset. Please log in." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Login & Register" description="Sign in or create your QuackAPI account to access the WhatsApp API platform. Manage devices, send messages, and configure webhooks." canonical="/auth" />
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50" data-testid="auth-navbar">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3" data-testid="link-home">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20">
              W
            </div>
            <span className="font-display font-bold text-xl" data-testid="text-brand">QuackAPI</span>
          </a>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid={`nav-${link.href.replace("/#", "")}`}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" onClick={() => setLocation("/auth")} data-testid="button-login">Log In</Button>
            <Button onClick={() => setLocation("/auth")} className="shadow-lg shadow-primary/25" data-testid="button-signup">Get Started</Button>
          </div>

          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} data-testid="button-mobile-menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg" data-testid="mobile-menu">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-left px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" data-testid={`mobile-nav-${link.href.replace("/#", "")}`}>
                  {link.label}
                </a>
              ))}
              <div className="border-t border-border/50 mt-2 pt-3 flex flex-col gap-2">
                <Button variant="ghost" onClick={() => setMobileOpen(false)} className="justify-start" data-testid="mobile-button-login">Log In</Button>
                <Button onClick={() => setMobileOpen(false)} className="shadow-lg shadow-primary/25" data-testid="mobile-button-signup">Get Started</Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="flex-1 grid lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-center p-12 bg-primary/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background z-0" />
          <div className="relative z-10 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-3xl mb-8 shadow-xl shadow-primary/30">
              W
            </div>
            <h1 className="font-display text-5xl font-bold mb-6 text-foreground tracking-tight">
              Connect Your Business with <span className="text-primary">WhatsApp API</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Automate messages, manage multiple devices, and scale your customer communication with our powerful, developer-friendly API platform.
            </p>
            <div className="space-y-4">
              {["Multi-device support", "Real-time message webhooks", "Easy-to-use REST API", "Secure & encrypted connection"].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-lg font-medium text-foreground/80">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 bg-background">

          {authView === "verify-email" ? (
            <Card className="w-full max-w-md border-border/50 shadow-2xl shadow-black/5">
              <CardHeader className="space-y-1 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                <CardDescription>
                  We sent a 6-digit code to <strong>{maskEmail(pendingEmail)}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verifyOtp}
                    onChange={(val) => setVerifyOtp(val.replace(/\D/g, ""))}
                    pattern={REGEXP_ONLY_DIGITS}
                    autoComplete="one-time-code"
                    data-testid="input-verify-otp"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/25"
                  disabled={verifyOtp.length < 6 || verifyEmailMutation.isPending}
                  onClick={() => pendingId && verifyEmailMutation.mutate({ pendingId, otp: verifyOtp })}
                  data-testid="button-verify-email"
                >
                  {verifyEmailMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                  ) : (
                    <><ShieldCheck className="mr-2 h-4 w-4" /> Verify & Continue</>
                  )}
                </Button>

                <div className="text-center">
                  {verifyCountdown.seconds > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Resend code in <span className="font-medium text-foreground">{verifyCountdown.seconds}s</span>
                    </p>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={resendOtpMutation.isPending}
                      onClick={() => pendingId && resendOtpMutation.mutate(pendingId)}
                      data-testid="button-resend-verify-otp"
                    >
                      {resendOtpMutation.isPending ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                      Resend code
                    </Button>
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => { setAuthView("login"); setPendingId(null); setPendingEmail(""); setVerifyOtp(""); }}
                  data-testid="button-back-from-verify"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </CardContent>
            </Card>

          ) : authView === "forgot" ? (
            <Card className="w-full max-w-md border-border/50 shadow-2xl shadow-black/5">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
                <CardDescription className="text-center">
                  Enter your email and we'll send a 6-digit reset code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...forgotForm}>
                  <form onSubmit={forgotForm.handleSubmit((data) => forgotMutation.mutate(data))} className="space-y-4" data-testid="form-forgot-password">
                    <FormField
                      control={forgotForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="m@example.com" {...field} className="h-11" data-testid="input-forgot-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/25"
                      disabled={forgotMutation.isPending}
                      data-testid="button-forgot-submit"
                    >
                      {forgotMutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                      ) : "Send Reset Code"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setAuthView("login")}
                      data-testid="button-back-to-login"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

          ) : authView === "reset-otp" ? (
            <Card className="w-full max-w-md border-border/50 shadow-2xl shadow-black/5">
              <CardHeader className="space-y-1 text-center">
                <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
                <CardDescription>
                  Enter the 6-digit code sent to <strong>{maskEmail(resetEmail)}</strong> and choose a new password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...resetOtpForm}>
                  <form onSubmit={resetOtpForm.handleSubmit((data) => resetMutation.mutate({ ...data, otp: resetOtpValue }))} className="space-y-5" data-testid="form-reset-otp" autoComplete="off">
                    <div className="flex flex-col items-center gap-2">
                      <label className="self-start text-sm font-medium">Reset Code</label>
                      <InputOTP
                        maxLength={6}
                        value={resetOtpValue}
                        onChange={(val) => setResetOtpValue(val.replace(/\D/g, ""))}
                        pattern={REGEXP_ONLY_DIGITS}
                        autoComplete="one-time-code"
                        pushPasswordManagerStrategy="none"
                        name="otp-token"
                        id="otp-token"
                        data-testid="input-reset-otp"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                      {resetOtpValue.length > 0 && resetOtpValue.length < 6 && (
                        <p className="text-sm text-destructive">Enter the 6-digit code</p>
                      )}
                    </div>
                    <FormField
                      control={resetOtpForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} className="h-11" data-testid="input-reset-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={resetOtpForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} className="h-11" data-testid="input-reset-confirm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/25"
                      disabled={resetMutation.isPending}
                      data-testid="button-reset-submit"
                    >
                      {resetMutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...</>
                      ) : "Reset Password"}
                    </Button>

                    <div className="text-center">
                      {resetCountdown.seconds > 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Resend code in <span className="font-medium text-foreground">{resetCountdown.seconds}s</span>
                        </p>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={resendResetMutation.isPending}
                          onClick={() => resendResetMutation.mutate(resetEmail)}
                          data-testid="button-resend-reset-otp"
                        >
                          {resendResetMutation.isPending ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                          Resend code
                        </Button>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setAuthView("forgot")}
                      data-testid="button-back-to-forgot"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

          ) : (
            <Card className="w-full max-w-md border-border/50 shadow-2xl shadow-black/5">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
                <CardDescription className="text-center">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="m@example.com" {...field} className="h-11" data-testid="input-login-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel>Password</FormLabel>
                                <button
                                  type="button"
                                  className="text-xs text-primary hover:underline"
                                  onClick={() => setAuthView("forgot")}
                                  data-testid="link-forgot-password"
                                >
                                  Forgot Password?
                                </button>
                              </div>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} className="h-11" data-testid="input-login-password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/25"
                          disabled={loginMutation.isPending}
                          data-testid="button-login-submit"
                        >
                          {loginMutation.isPending ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</>
                          ) : (
                            <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="register">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} className="h-11" data-testid="input-register-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="m@example.com" {...field} className="h-11" data-testid="input-register-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} className="h-11" data-testid="input-register-password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} className="h-11" data-testid="input-register-confirm" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/25"
                          disabled={registerMutation.isPending}
                          data-testid="button-register-submit"
                        >
                          {registerMutation.isPending ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</>
                          ) : "Create Account"}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="justify-center text-sm text-muted-foreground">
                By continuing, you agree to our{" "}
                <a href="/terms" className="text-primary hover:underline ml-1">Terms of Service</a>.
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      <footer className="w-full border-t bg-card/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
              W
            </div>
            <span>&copy; {new Date().getFullYear()} QuackAPI. All rights reserved.</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground" aria-label="Footer navigation">
            <a href="/terms" className="hover:text-foreground transition-colors" data-testid="auth-footer-terms">Terms of Service</a>
            <a href="/privacy" className="hover:text-foreground transition-colors" data-testid="auth-footer-privacy">Privacy Policy</a>
            <a href="/contact" className="hover:text-foreground transition-colors" data-testid="auth-footer-contact">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
