import { BaseStateProps } from "../types/typesState";
import { TypeTravelRecomendation } from "../types/typeTravelRecomendation";

export interface DestinationAgentState extends BaseStateProps {
  input: {
    preferences: string[];
    budget?: number;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  output?: TypeTravelRecomendation;
}
