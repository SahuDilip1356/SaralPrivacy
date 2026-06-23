// Notice Pack Builder — shared types
export interface NPState {
  org: string;
  website: string;
  sector: string;
  data: string[];
  contexts: string[];
  purpose: Record<string, string>;
  consentVia: string;
  withdrawMethod: string;
  withdrawContact: string;
  vendors: string[];
  noVendors: boolean;
  children: "" | "Yes" | "No" | "Not sure";
  childWhy: string[];
  retention: string;
  cName: string;
  cEmail: string;
  cPhone: string;
  regAddress: string;
  slug: string;
  lang: "en" | "hi";
}

export interface NPContext {
  key: string;
  label: string;
  mini: (b: string) => string;
}

export interface NPSector {
  key: string;
  label: string;
  data: string[];
  purposes: string[];
  vendors: string[];
  contexts: string[];
  children: boolean;
  vclause: string;
}

export interface NPBand {
  min: number;
  label: string;
  color: string;
  bg: string;
  msg: string;
}
