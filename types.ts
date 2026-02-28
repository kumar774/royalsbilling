export type CategoryType = 'string';

export interface Variant {
  size: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: CategoryType;
  customCategory?: string; // New field for custom categories like 'Pizza', 'Sandwich'
  categoryGroup?: string; // General category like 'Pizza', 'Burger'
  categorySpecific?: string; // Specific menu header like 'The Best Pizza's', 'Single Topping'
  variants?: Variant[]; // Optional field for items with multiple sizes/prices
  isBestseller?: boolean;
  rating?: number;
  votes?: number;
  available?: boolean;
}

export interface Feature {
  title: string;
  description: string;
  icon?: string;
}


export interface ThemeSettings {
  headerColor?: string;
  footerColor?: string;
  headerText?: string;
  footerText?: string;
  logoUrl?: string;
  // CMS Fields for Landing Page
  heroImage?: string; 
  aboutTitle?: string;
  aboutText?: string; 
  primaryColor?: string;
  primaryTextColor?: string;
  heroBgColor?: string;
  landingHeroTitle?: string;
  landingHeroSub?: string;
  features?: Feature[];
  socialMedia?: SocialLinks;
}
export interface RestaurantSettings {
  openingHours?: string;
  deliveryTime?: string;
  defaultDeliveryCharge?: number;
  whatsappNumber?: string;
  upiId?: string;
  paymentQrLink?: string;
  orderIdPrefix?: string;
  nextOrderNumber?: number;
  receiptFooter?: string;
  selectedPrinterSize?: string;
  printerSizes?: string[];
  theme?: ThemeSettings;
  taxSettings?: TaxSettings;
  socialMedia?: SocialLinks;
  homeViewMode?: 'Landing Page' | 'Default List';
}

export interface TaxSettings {
  gstPercentage: number;
  serviceChargePercentage: number;
  applyTax: boolean;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
}
export interface NotificationSettings {
  pushEnabled: boolean;
  telegramEnabled: boolean;
  telegramToken: string;
  telegramChatId: string;
  alertSoundUrl: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  cuisine: string[];
  rating: number;
  deliveryTime: string;
  bannerImage: string;
  logo: string;
  location: string;
  contact?: string;
  openingHours?: string;
  menu: MenuItem[];
  theme?: ThemeSettings;
  taxSettings?: TaxSettings;
  socialMedia?: SocialLinks;
  whatsappNumber?: string;
  receiptFooter?: string;
  upiId?: string; // New field for Payments
  orderIdPrefix?: string; // New field for Custom Order IDs
  nextOrderNumber?: number; // New field for Custom Order IDs
  defaultDeliveryCharge?: number; // New field for Delivery
  isActive?: boolean; // For restaurant status toggle
  paymentQrLink?: string; // New field for custom payment QR link
  selectedPrinterSize?: string;
  printerSizes?: string[];
  homeViewMode?: 'Landing Page' | 'Default List';
  categoryOrder?: string[];
  notificationSettings?: NotificationSettings;
  fcmTokens?: string[];
}

export interface CartItem extends MenuItem {
  quantity: number;
  selectedVariant?: Variant;
}

export interface CartState {
  items: CartItem[];
  total: number;
}

export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
export type OrderType = 'Dine-in' | 'Takeaway' | 'Delivery' | 'Online' | 'POS';
export type PaymentStatus = 'Pending' | 'Paid';
export type PaymentMethod = 'Cash' | 'Online' | 'Card';

export interface Order {
  id: string;
  formattedId?: string;
  restaurantId: string;
  items: CartItem[];
  total: number;
  subtotal?: number;
  discount?: number;
  deliveryCharge?: number;
  status: OrderStatus;
  orderType: OrderType;
  source?: 'Reception' | 'Online';
  orderSource?: string;
  customerName?: string;
  customerPhone?: string;
  tableNo?: string;
  createdAt: string; 
  // Payment Tracking
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  taxDetails?: { [key: string]: number };
}

export interface LastOrderDetails {
  id: string;
  formattedId?: string;
  total: number;
  subtotal: number;
  items: CartItem[];
  date: string;
  orderType: string;
  deliveryFee: number;
  taxDetails: {
      gstAmount: number;
      serviceAmount: number;
      gstRate: number;
      serviceRate: number;
  };
  upiUrl?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: string;
  customerName?: string;
  customerPhone?: string;
  discount?: number;
  deliveryCharge?: number;
  restaurantIds?: string[];
  paymentQrLink?: string; // New field for the payment QR link
  restaurantId?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
}
