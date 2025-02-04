import { typeLocation } from "../types/typeLocation";
import { TypePackingRecommendation } from "../types/typePackingRecommendation";
import { BaseStateProps } from "../types/typesState";
import { typeWheatherInfo } from "../types/typeWheatherInfo";

export interface LuggageWeatherState extends BaseStateProps {
  input: {
    location: typeLocation;
    dateRange: {
      start: Date;
      end: Date;
    };
    activities: string[];
  };
  output?: {
    weather: typeWheatherInfo;
    packing: TypePackingRecommendation;
  };
}