export type LocationType =
  | "zoom"
  | "in_person"
  | "video"
  | "link"
  | "phone"
  | "custom";

export interface LocationObject {
  type: LocationType;
  address?: string;
  link?: string;
  phone?: string;
  text?: string;
  displayLocationPublicly?: boolean;
}
