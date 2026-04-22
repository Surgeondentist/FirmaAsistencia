export type Attendee = {
  id: string;
  name: string;
  documentId: string;
  submittedAt: string;
  signatureDataUrl: string;
};

export type EventRecord = {
  id: string;
  name: string;
  createdAt: string;
  status: "open" | "closed";
  adminEmail: string;
  attendees: Attendee[];
};
