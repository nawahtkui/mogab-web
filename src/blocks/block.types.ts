export type BlockType =
  | "hero"
  | "features"
  | "pricing"
  | "about"
  | "contact"
  | "gallery"
  | "faq"
  | "cta";

export type BlockId = string;

export type FeatureItem = {
  id?: string;
  title: string;
  description?: string;
  icon?: string;
  image?: string;
  link?: string;
};

export type PricingPlan = {
  id?: string;
  name: string;
  price?: string;
  period?: string;
  description?: string;
  features?: string[];
  button?: string;
  buttonLink?: string;
  highlighted?: boolean;
};

export type FaqItem = {
  id?: string;
  question: string;
  answer: string;
};

export type GalleryItem = {
  id?: string;
  image: string;
  alt?: string;
  title?: string;
  description?: string;
  link?: string;
};

export type NavItem = {
  label: string;
  href: string;
};

export type BlockProps = {
  [key: string]: unknown;
};

export type Block = {
  id: BlockId;
  type: BlockType;
  props: BlockProps;
  children?: Block[];
};

export type PageSchema = {
  id: string;
  title: string;
  slug: string;
  blocks: Block[];
};
