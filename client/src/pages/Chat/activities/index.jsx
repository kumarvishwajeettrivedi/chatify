import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppStore } from "@/store"; // Adjust the import path as needed
import ContactContainer from "./components/contacts-container";
import EmptyChatContainer from "./components/empty-chat-container";
import ChatContainer from "./components/chat-container";
import { FaYoutube, FaAmazon, FaNetflix, FaPencilAlt, FaGoogle } from "react-icons/fa";

const generateGoogleMeetLink = async () => {
  // Placeholder function to generate Google Meet link
  // Replace this with your actual API call or logic to generate a Google Meet link
  return "https://meet.google.com/new";
};

const Activities = () => {
  const [googleMeetLink, setGoogleMeetLink] = useState("");

  const handleGenerateGoogleMeetLink = async () => {
    const link = await generateGoogleMeetLink();
    setGoogleMeetLink(link);
  };

  return (
    <div className="flex flex-col items-center gap-4 bg-[#1c1d25] p-4 w-[250px] text-white">
      <h2 className="text-lg font-semibold">Activities</h2>
      <div className="flex flex-col items-center gap-3">
        <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
          <FaYoutube className="text-3xl text-red-600 hover:text-red-400 transition-all duration-300" />
        </a>
        <a href="https://www.amazon.com/Prime-Video/b?node=2676882011" target="_blank" rel="noopener noreferrer">
          <FaAmazon className="text-3xl text-yellow-600 hover:text-yellow-400 transition-all duration-300" />
        </a>
        <a href="https://www.netflix.com" target="_blank" rel="noopener noreferrer">
          <FaNetflix className="text-3xl text-red-600 hover:text-red-400 transition-all duration-300" />
        </a>
        <a href="https://www.google.com/maps/d/u/0/viewer?mid=1-7Y5BN78N2fWAnPPLNxAe3wA4Wc&hl=en&usp=sharing" target="_blank" rel="noopener noreferrer">
          <FaPencilAlt className="text-3xl text-blue-600 hover:text-blue-400 transition-all duration-300" />
        </a>
        <button
          className="flex items-center gap-2 text-3xl text-green-600 hover:text-green-400 transition-all duration-300"
          onClick={handleGenerateGoogleMeetLink}
        >
          <FaGoogle />
        </button>
        {googleMeetLink && (
          <a href={googleMeetLink} target="_blank" rel="noopener noreferrer" className="text-sm text-green-400 hover:text-green-300 transition-all duration-300 mt-2">
            Join Google Meet
          </a>
        )}
      </div>
    </div>
  );
};

const Chati = () => {
  const { userInfo, selectedChatType } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo.profileSetup) {
      toast("Please setup profile to continue.");
      navigate("/profile");
    }
  }, [userInfo, navigate]);

  return (
    <div className="flex h-[93vh] text-white overflow-hidden">
      <ContactContainer />
      <div className="flex-auto flex">
        {selectedChatType === undefined ? (
          <EmptyChatContainer />
        ) : (
          <ChatContainer />
        )}
        <Activities />
      </div>
    </div>
  );
};

export default Chati;
