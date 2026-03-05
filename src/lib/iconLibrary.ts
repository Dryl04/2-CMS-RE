/**
 * Shared Icon Library
 *
 * Unified icon registry used across all widgets.
 * Supports: Lucide icon keys, image URLs, and emoji.
 */

import React from "react";
import {
  Zap,
  Shield,
  Heart,
  Star,
  Globe,
  Lock,
  Clock,
  Layers,
  Users,
  UserPlus,
  Code,
  Eye,
  Award,
  Target,
  Settings,
  TrendingUp,
  CheckCircle,
  Cpu,
  Database,
  Monitor,
  Umbrella,
  ArrowRight,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  Camera,
  Check,
  ChevronRight,
  Clipboard,
  Cloud,
  Coffee,
  Compass,
  CreditCard,
  Download,
  Edit,
  ExternalLink,
  File,
  Filter,
  Flag,
  Gift,
  Headphones,
  Home,
  Image,
  Inbox,
  Info,
  Key,
  Layout,
  Link,
  Mail,
  Map,
  MapPin,
  MessageCircle,
  Mic,
  Moon,
  Music,
  Navigation,
  Package,
  PenTool,
  Phone,
  Play,
  Plus,
  Printer,
  Radio,
  RefreshCw,
  Rocket,
  Search,
  Send,
  Server,
  Share2,
  ShoppingCart,
  Smartphone,
  Speaker,
  Sun,
  Tag,
  Terminal,
  ThumbsUp,
  Trash,
  Truck,
  Tv,
  Upload,
  Video,
  Wifi,
  Wind,
  X,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  PaintBucket,
  type LucideIcon,
} from "lucide-react";

/** Complete icon map: slug → Lucide component */
export const ICON_MAP: Record<string, LucideIcon> = {
  zap: Zap,
  shield: Shield,
  heart: Heart,
  star: Star,
  globe: Globe,
  lock: Lock,
  clock: Clock,
  layers: Layers,
  users: Users,
  "user-plus": UserPlus,
  code: Code,
  eye: Eye,
  award: Award,
  target: Target,
  settings: Settings,
  "trending-up": TrendingUp,
  "check-circle": CheckCircle,
  cpu: Cpu,
  database: Database,
  monitor: Monitor,
  umbrella: Umbrella,
  // Extended set
  "arrow-right": ArrowRight,
  bell: Bell,
  "book-open": BookOpen,
  briefcase: Briefcase,
  calendar: Calendar,
  camera: Camera,
  check: Check,
  "chevron-right": ChevronRight,
  clipboard: Clipboard,
  cloud: Cloud,
  coffee: Coffee,
  compass: Compass,
  "credit-card": CreditCard,
  download: Download,
  edit: Edit,
  "external-link": ExternalLink,
  file: File,
  filter: Filter,
  flag: Flag,
  gift: Gift,
  headphones: Headphones,
  home: Home,
  image: Image,
  inbox: Inbox,
  info: Info,
  key: Key,
  layout: Layout,
  link: Link,
  mail: Mail,
  map: Map,
  "map-pin": MapPin,
  "message-circle": MessageCircle,
  mic: Mic,
  moon: Moon,
  music: Music,
  navigation: Navigation,
  package: Package,
  "pen-tool": PenTool,
  phone: Phone,
  play: Play,
  plus: Plus,
  printer: Printer,
  radio: Radio,
  "refresh-cw": RefreshCw,
  rocket: Rocket,
  search: Search,
  send: Send,
  server: Server,
  share: Share2,
  "shopping-cart": ShoppingCart,
  smartphone: Smartphone,
  speaker: Speaker,
  sun: Sun,
  tag: Tag,
  terminal: Terminal,
  "thumbs-up": ThumbsUp,
  trash: Trash,
  truck: Truck,
  tv: Tv,
  upload: Upload,
  video: Video,
  wifi: Wifi,
  wind: Wind,
  x: X,
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  github: Github,
  paintbucket: PaintBucket,
  creditcard: CreditCard,
  messagecircle: MessageCircle,
  alarmclock: Clock,
};

/** Flat list for pickers: { id, label } */
export const ICON_LIST: { id: string; label: string }[] = Object.keys(ICON_MAP)
  .sort()
  .map((id) => ({
    id,
    label: id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  }));

const EMOJI_REGEX = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
const URL_REGEX = /^https?:\/\//i;
const SVG_REGEX = /^<svg[\s>]/i;
const DATA_URI_REGEX = /^data:/i;

export function renderIcon(
  icon: string | undefined,
  className?: string,
  size = 24,
): React.ReactNode {
  if (!icon) return null;

  if (SVG_REGEX.test(icon)) {
    return React.createElement("span", {
      className,
      style: { width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" },
      dangerouslySetInnerHTML: { __html: icon.replace(/<svg/, `<svg width="${size}" height="${size}"`) },
    });
  }

  if (URL_REGEX.test(icon) || DATA_URI_REGEX.test(icon)) {
    return React.createElement("img", {
      src: icon,
      alt: "icon",
      className,
      style: { width: size, height: size, objectFit: "contain" },
    });
  }

  if (EMOJI_REGEX.test(icon)) {
    return React.createElement(
      "span",
      {
        className,
        style: { fontSize: size, lineHeight: 1 },
      },
      icon,
    );
  }

  const IconComponent = ICON_MAP[icon];
  if (IconComponent) {
    return React.createElement(IconComponent, {
      className,
      size,
    });
  }

  return React.createElement("span", { className }, icon);
}
