import { typeLocation } from "./typeLocation";

export type Message = {
    role: "system" | "user";
    type: "destination_recommendation" | "weather_packing_recommendation";
    content: any; 
  }


  export type ConversationContext = {
    actualTheme: string;
    messages: Array<{
      role: "system" | "user";
      type: "destination_recommendation" | "weather_packing_recommendation";
      content: any;
    }>;
    preferences?: string[];
    location?: string; 
    activities?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
  };