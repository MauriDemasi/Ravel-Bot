export type Message = {
    role: "system" | "user";
    type: "destination_recommendation" | "weather_packing_recommendation";
    content: any; 
  }


export type ConversationContext = {
    actualTheme:string,
    messages:Message[],
}