import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Lock, UserPlus } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  password: z.string().min(1, "Şifre gerekli"),
});

const signupSchema = z.object({
  name: z.string().min(1, "Ad gerekli"),
  password: z.string().min(1, "Şifre gerekli"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isSignup, setIsSignup] = useState(false);
  const [loginData, setLoginData] = useState({ password: "" });
  const [signupData, setSignupData] = useState({ name: "", password: "" });

  const loginMutation = useMutation({
    mutationFn: async (data: { password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user);
      if (data.user.isAdmin) {
        setLocation("/admin");
      } else {
        setLocation("/chat");
      }
      toast({
        title: "Başarılı",
        description: "Giriş yapıldı",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Giriş başarısız",
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: { name: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/signup", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSignup(false);
      toast({
        title: "Başarılı",
        description: "Hesap oluşturuldu. Şimdi giriş yapabilirsiniz.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Hesap oluşturulamadı",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = loginSchema.parse(loginData);
      loginMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Hata",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = signupSchema.parse(signupData);
      signupMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Hata",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    }
  };

  if (isSignup) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="text-white text-2xl" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Yeni Hesap Oluştur</h1>
              <p className="text-slate-600">Adınız ve benzersiz bir şifre belirleyin</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Adınız
                </label>
                <Input
                  id="name"
                  type="text"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  placeholder="Adınızı girin"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Şifre
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  placeholder="Benzersiz şifrenizi belirleyin"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Şifreniz sadece size özel olmalıdır (örn: 1234)</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? "Oluşturuluyor..." : "Hesap Oluştur"}
              </Button>
            </form>

            <Button
              variant="ghost"
              onClick={() => setIsSignup(false)}
              className="w-full mt-4 text-slate-600 hover:text-slate-800"
            >
              ← Giriş sayfasına dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Sohbet Sistemine Giriş</h1>
            <p className="text-slate-600">Şifreinizi girerek sisteme giriş yapın</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Şifrenizi girin (örn: 1234)"
                  required
                />
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600 text-center mb-4">Hesabınız yok mu?</p>
            <Button
              variant="outline"
              onClick={() => setIsSignup(true)}
              className="w-full"
            >
              Yeni Hesap Oluştur
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
