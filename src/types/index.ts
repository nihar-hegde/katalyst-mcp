export interface ComposioAccount {
  authConfig?: {
    id: string;
  };
  id: string;
  name: string;
}

export interface Attendee {
  email: string;
  responseStatus: string;
  organizer?: boolean;
  self?: boolean;
}
