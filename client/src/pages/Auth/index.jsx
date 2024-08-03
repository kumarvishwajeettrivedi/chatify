import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import excitedBunny from "../../assets/excitedBunny.png";
import coolBear from "../../assets/coolBear.png";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { SIGNUP_ROUTE, LOGIN_ROUTE } from '@/utils/constants.js';
import { useNavigate } from 'react-router-dom';
import {useAppStore} from"@/store";

const Auth = () => {
  const navigate=useNavigate();
  const {setUserInfo } =useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    setActiveTab("login");
  }, []);

  const validateLogin = () => {
    if (!email.length) {
      toast.error("Email is required.");
      return false;
    }
    if (!password.length) {
      toast.error("Password is required.");
      return false;
    }
    return true;
  }

  const validateSignup = () => {
    if (!email.length) {
      toast.error("Email is required.");
      return false;
    }
    if (!password.length) {
      toast.error("Password is required.");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    return true;
  }

  const handleSignin = async () => {
    if (validateLogin()) {
      try {
        const response = await apiClient.post(LOGIN_ROUTE, { email, password }, { withCredentials: true });
        console.log(response);
        toast.success("Login successful!");
        if(response.data.user.id){
          setUserInfo(response.data.user)
          if(response.data.user.profileSetup) navigate("/chat");
          else navigate("/profile");
        }
      } catch (error) {
        toast.error("Invalid username or password.");
        console.error(error);
      }
    }
  };

  const handleSignup = async () => {
    if (validateSignup()) {
      try {
        const response = await apiClient.post(SIGNUP_ROUTE, { email, password }, { withCredentials: true });
        console.log(response);
        toast.success("Signup successful!");
        if(response.status===201){
          setUserInfo(response.data.user)
          navigate("/profile");
        }
      } catch (error) {
        if (error.response && error.response.status === 409) {
          toast.error("Email already exists.");
        } else {
          toast.error("Signup failed.");
        }
        console.error(error);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
      <div className={`h-[80vh] bg-white border-2 border-white text-opacity-90 shadow-2xl w-full max-w-5xl rounded-3xl grid xl:grid-cols-2 overflow-hidden transition-all duration-300 ${activeTab === 'signup' ? 'min-h-[90vh]' : 'min-h-[80vh]'}`}>
        <div className="flex flex-col gap-10 items-center justify-center p-8">
          <div className="flex items-center justify-center flex-col gap-4">
            <div className="flex items-center justify-center gap-4">
              <h1 className="text-5xl font-bold md:text-6xl">{activeTab === 'signup' ? 'Hii' : 'Welcome Back'}</h1>
            </div>
            <p className="font-medium text-center">
              Fill in the details to get started with the best chat app!
            </p>
          </div>
          <div className="flex align-center justify-center w-full">
            <Tabs className="w-full" value={activeTab} onValueChange={(value) => setActiveTab(value)}>
              <TabsList className="bg-transparent rounded-none w-full flex justify-around">
                <TabsTrigger
                  value="login"
                  className={`text-black text-opacity-90 border-b-2 rounded-none w-full p-3 transition-all duration-300 ${activeTab === 'login' ? 'font-semibold border-b-purple-500' : 'border-b-transparent'}`}
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className={`text-black text-opacity-90 border-b-2 rounded-none w-full p-3 transition-all duration-300 ${activeTab === 'signup' ? 'font-semibold border-b-purple-500' : 'border-b-transparent'}`}
                >
                  Signup
                </TabsTrigger>
              </TabsList>
              <TabsContent className="flex flex-col gap-4 items-center w-full p-4" value="login">
                <Input
                  placeholder="Email"
                  type="email"
                  className="rounded-full p-6 w-full max-w-[400px]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  className="rounded-full p-6 w-full max-w-[400px]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button className="rounded-full p-6 w-full max-w-[400px]" onClick={handleSignin}>Sign In</Button>
              </TabsContent>
              <TabsContent className="flex flex-col gap-4 items-center w-full p-4" value="signup">
                <Input
                  placeholder="Email"
                  type="email"
                  className="rounded-full p-6 w-full max-w-[400px]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  className="rounded-full p-6 w-full max-w-[400px]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  placeholder="Confirm Password"
                  type="password"
                  className="rounded-full p-6 w-full max-w-[400px]"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button className="rounded-full p-6 w-full max-w-[400px]" onClick={handleSignup}>Sign Up</Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="hidden xl:flex justify-center items-center overflow-hidden">
          <img src={activeTab === "login" ? excitedBunny : coolBear} alt="Auth Background" className="h-[300px] object-contain" />
        </div>
      </div>
    </div>
  );
};

export default Auth;
