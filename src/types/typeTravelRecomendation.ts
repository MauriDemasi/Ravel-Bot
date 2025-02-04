import { typeLocation } from "./typeLocation";

export type TypeTravelRecomendation = {
    message?: string;
    locations?: typeLocation[];
    activities? : string[];
    suggestions? : string[];
    bestTimeToVisit? : string;
    estimatedBudget? :{
        min : number;
        max : number;
        currency : string;
    };
    culturalNotes?: string[];
}