export interface MerchantSuggestion {
  id: string
  name: string
  keyword: string
  category: string
  logo?: string // Name of the react-icons icon, e.g., 'SiNetflix'
  brandColor?: string // Hex color for the brand logo
  icon: string // Fallback lucide icon name if logo is missing or loading
}

export const POPULAR_MERCHANTS: MerchantSuggestion[] = [
  // Global & Digital Subscriptions
  { id: 'netflix', name: 'Netflix', keyword: 'netflix', category: 'Entertainment', logo: 'SiNetflix', brandColor: '#E50914', icon: 'Film' },
  { id: 'spotify', name: 'Spotify', keyword: 'spotify', category: 'Entertainment', logo: 'SiSpotify', brandColor: '#1DB954', icon: 'Music' },
  { id: 'youtube', name: 'YouTube', keyword: 'youtube', category: 'Entertainment', logo: 'SiYoutube', brandColor: '#FF0000', icon: 'Film' },
  { id: 'twitch', name: 'Twitch', keyword: 'twitch', category: 'Entertainment', logo: 'SiTwitch', brandColor: '#9146FF', icon: 'Tv' },
  { id: 'steam', name: 'Steam', keyword: 'steam', category: 'Entertainment', logo: 'SiSteam', icon: 'Gamepad2' },
  { id: 'playstation', name: 'PlayStation', keyword: 'playstation', category: 'Entertainment', logo: 'SiPlaystation', brandColor: '#003791', icon: 'Gamepad2' },
  { id: 'airbnb', name: 'Airbnb', keyword: 'airbnb', category: 'Entertainment', logo: 'SiAirbnb', brandColor: '#FF5A5F', icon: 'MapPin' },
  { id: 'booking', name: 'Booking.com', keyword: 'booking', category: 'Entertainment', logo: 'SiBookingdotcom', brandColor: '#003580', icon: 'MapPin' },

  // Online Shopping & Retail
  { id: 'amazon', name: 'Amazon', keyword: 'amazon', category: 'Shopping', logo: 'FaAmazon', brandColor: '#FF9900', icon: 'Package' },
  { id: 'ebay', name: 'eBay', keyword: 'ebay', category: 'Shopping', logo: 'SiEbay', brandColor: '#E53238', icon: 'ShoppingBag' },
  { id: 'apple', name: 'Apple', keyword: 'apple', category: 'Shopping', logo: 'SiApple', icon: 'Smartphone' },
  { id: 'nike', name: 'Nike', keyword: 'nike', category: 'Shopping', logo: 'SiNike', icon: 'Shirt' },
  { id: 'zara', name: 'Zara', keyword: 'zara', category: 'Shopping', logo: 'SiZara', brandColor: '#000000', icon: 'Shirt' },
  { id: 'ikea', name: 'IKEA', keyword: 'ikea', category: 'Shopping', logo: 'SiIkea', brandColor: '#0051BA', icon: 'Building2' },
  { id: 'target', name: 'Target', keyword: 'target', category: 'Shopping', logo: 'SiTarget', brandColor: '#CC0000', icon: 'ShoppingBag' },

  // Banking & Fintech
  { id: 'paypal', name: 'PayPal', keyword: 'paypal', category: 'Transfers', logo: 'SiPaypal', brandColor: '#00457C', icon: 'CreditCard' },
  { id: 'revolut', name: 'Revolut', keyword: 'revolut', category: 'Transfers', logo: 'SiRevolut', brandColor: '#0075EB', icon: 'CreditCard' },
  { id: 'wise', name: 'Wise', keyword: 'wise', category: 'Transfers', logo: 'SiWise', brandColor: '#9FE870', icon: 'CreditCard' },
  { id: 'klarna', name: 'Klarna', keyword: 'klarna', category: 'Transfers', logo: 'SiKlarna', brandColor: '#FFB3C7', icon: 'CreditCard' },
  { id: 'n26', name: 'N26', keyword: 'n26', category: 'Transfers', logo: 'SiN26', brandColor: '#36A18B', icon: 'CreditCard' },
  { id: 'mastercard', name: 'Mastercard', keyword: 'mastercard', category: 'Transfers', logo: 'SiMastercard', brandColor: '#EB001B', icon: 'CreditCard' },
  { id: 'visa', name: 'Visa', keyword: 'visa', category: 'Transfers', logo: 'SiVisa', brandColor: '#1A1F71', icon: 'CreditCard' },

  // Dining & Food Delivery
  { id: 'starbucks', name: 'Starbucks', keyword: 'starbucks', category: 'Dining Out', logo: 'SiStarbucks', brandColor: '#00704A', icon: 'Coffee' },
  { id: 'mcdonalds', name: 'McDonald\'s', keyword: 'mcdonald', category: 'Dining Out', logo: 'SiMcdonalds', brandColor: '#FFC72C', icon: 'Pizza' },
  { id: 'burgerking', name: 'Burger King', keyword: 'burger king', category: 'Dining Out', logo: 'SiBurgerking', brandColor: '#D62300', icon: 'Pizza' },
  { id: 'kfc', name: 'KFC', keyword: 'kfc', category: 'Dining Out', logo: 'SiKfc', brandColor: '#A3080C', icon: 'Utensils' },
  { id: 'ubereats', name: 'Uber Eats', keyword: 'uber eats', category: 'Dining Out', logo: 'SiUbereats', brandColor: '#06C167', icon: 'Utensils' },
  { id: 'deliveroo', name: 'Deliveroo', keyword: 'deliveroo', category: 'Dining Out', logo: 'SiDeliveroo', brandColor: '#00CDBC', icon: 'Utensils' },
  { id: 'justeat', name: 'Just Eat', keyword: 'just eat', category: 'Dining Out', logo: 'SiJusteat', brandColor: '#FF8000', icon: 'Utensils' },
  { id: 'doordash', name: 'DoorDash', keyword: 'doordash', category: 'Dining Out', logo: 'SiDoordash', brandColor: '#FF3008', icon: 'Utensils' },

  // Mobility & Ride Hailing
  { id: 'uber', name: 'Uber', keyword: 'uber', category: 'Transport', logo: 'SiUber', icon: 'Car' },
  { id: 'lyft', name: 'Lyft', keyword: 'lyft', category: 'Transport', logo: 'SiLyft', brandColor: '#FF00BF', icon: 'Car' },

  // Bosnia & Herzegovina (bs)
  { id: 'bingo', name: 'Bingo', keyword: 'bingo', category: 'Groceries', brandColor: '#E30613', icon: 'ShoppingCart' },
  { id: 'konzum-ba', name: 'Konzum', keyword: 'konzum', category: 'Groceries', brandColor: '#E2001A', icon: 'ShoppingCart' },
  { id: 'kort', name: 'Kort Marketi', keyword: 'kort', category: 'Groceries', brandColor: '#E30613', icon: 'ShoppingCart' },
  { id: 'robot', name: 'Robot', keyword: 'robot', category: 'Groceries', brandColor: '#EE1C25', icon: 'ShoppingCart' },
  { id: 'amko', name: 'Amko Komerc', keyword: 'amko', category: 'Groceries', brandColor: '#005596', icon: 'ShoppingCart' },
  { id: 'tropic', name: 'Tropic', keyword: 'tropic', category: 'Groceries', brandColor: '#2B8C3E', icon: 'ShoppingCart' },
  { id: 'cm-cosmetic', name: 'CM Cosmetic Market', keyword: 'cm-cosmetic', category: 'Shopping', brandColor: '#E6007E', icon: 'ShoppingBag' },
  { id: 'bhtelecom', name: 'BH Telecom', keyword: 'bh telecom', category: 'Utilities', brandColor: '#F37021', icon: 'Wifi' },
  { id: 'mtel', name: 'm:tel', keyword: 'mtel', category: 'Utilities', brandColor: '#E30613', icon: 'Wifi' },
  { id: 'eronet', name: 'HT Eronet', keyword: 'eronet', category: 'Utilities', brandColor: '#E4002B', icon: 'Wifi' },
  { id: 'telemach', name: 'Telemach', keyword: 'telemach', category: 'Utilities', brandColor: '#0083CA', icon: 'Wifi' },
  { id: 'epbih', name: 'Elektroprivreda BiH', keyword: 'elektroprivreda', category: 'Utilities', brandColor: '#005CA9', icon: 'Zap' },
  { id: 'ina-ba', name: 'INA / HoldINA', keyword: 'ina', category: 'Transport', brandColor: '#003399', icon: 'Fuel' },
  { id: 'energopetrol', name: 'Energopetrol', keyword: 'energopetrol', category: 'Transport', brandColor: '#004B87', icon: 'Fuel' },
  { id: 'hifa', name: 'Hifa Oil / Petrol', keyword: 'hifa', category: 'Transport', brandColor: '#E30613', icon: 'Fuel' },
  { id: 'nestro', name: 'Nestro Petrol', keyword: 'nestro', category: 'Transport', brandColor: '#003399', icon: 'Fuel' },

  // Serbia (sr)
  { id: 'maxi', name: 'Maxi', keyword: 'maxi', category: 'Groceries', brandColor: '#E2001A', icon: 'ShoppingCart' },
  { id: 'idea', name: 'Idea', keyword: 'idea', category: 'Groceries', brandColor: '#E2001A', icon: 'ShoppingCart' },
  { id: 'roda', name: 'Roda', keyword: 'roda', category: 'Groceries', brandColor: '#008037', icon: 'ShoppingCart' },
  { id: 'dis', name: 'DIS', keyword: 'dis market', category: 'Groceries', brandColor: '#004B87', icon: 'ShoppingCart' },
  { id: 'univerexport', name: 'Univerexport', keyword: 'univerexport', category: 'Groceries', brandColor: '#E30613', icon: 'ShoppingCart' },
  { id: 'gomex', name: 'Gomex', keyword: 'gomex', category: 'Groceries', brandColor: '#FFCC00', icon: 'ShoppingCart' },
  { id: 'lilly', name: 'Lilly Drogerie', keyword: 'lilly', category: 'Shopping', brandColor: '#E30613', icon: 'ShoppingBag' },
  { id: 'nis-petrol', name: 'NIS Petrol / Gazprom', keyword: 'nis petrol', category: 'Transport', brandColor: '#005BAA', icon: 'Fuel' },
  { id: 'mts', name: 'MTS Telekom Srbija', keyword: 'mts', category: 'Utilities', brandColor: '#E30613', icon: 'Wifi' },
  { id: 'yettel', name: 'Yettel', keyword: 'yettel', category: 'Utilities', brandColor: '#00FF66', icon: 'Wifi' },
  { id: 'a1-rs', name: 'A1 Srbija', keyword: 'a1', category: 'Utilities', brandColor: '#EB1800', icon: 'Wifi' },
  { id: 'eps', name: 'EPS Elektroprivreda', keyword: 'eps', category: 'Utilities', brandColor: '#003399', icon: 'Zap' },

  // Poland (pl)
  { id: 'biedronka', name: 'Biedronka', keyword: 'biedronka', category: 'Groceries', brandColor: '#E30613', icon: 'ShoppingCart' },
  { id: 'dino', name: 'Dino', keyword: 'dino', category: 'Groceries', brandColor: '#007A3D', icon: 'ShoppingCart' },
  { id: 'zabka', name: 'Żabka', keyword: 'zabka', category: 'Groceries', logo: 'SiZabka', brandColor: '#005934', icon: 'ShoppingCart' },
  { id: 'auchan', name: 'Auchan', keyword: 'auchan', category: 'Groceries', logo: 'SiAuchan', brandColor: '#E3001B', icon: 'ShoppingCart' },
  { id: 'carrefour', name: 'Carrefour', keyword: 'carrefour', category: 'Groceries', logo: 'SiCarrefour', brandColor: '#004E9A', icon: 'ShoppingCart' },
  { id: 'stokrotka', name: 'Stokrotka', keyword: 'stokrotka', category: 'Groceries', brandColor: '#E30613', icon: 'ShoppingCart' },
  { id: 'lewiatan', name: 'Lewiatan', keyword: 'lewiatan', category: 'Groceries', brandColor: '#0055A5', icon: 'ShoppingCart' },
  { id: 'allegro', name: 'Allegro', keyword: 'allegro', category: 'Shopping', logo: 'SiAllegro', brandColor: '#FF5A00', icon: 'Package' },
  { id: 'empik', name: 'Empik', keyword: 'empik', category: 'Shopping', brandColor: '#000000', icon: 'BookOpen' },
  { id: 'rossmann', name: 'Rossmann', keyword: 'rossmann', category: 'Shopping', brandColor: '#E30613', icon: 'ShoppingBag' },
  { id: 'orlen', name: 'Orlen', keyword: 'orlen', category: 'Transport', brandColor: '#D8232A', icon: 'Fuel' },
  { id: 'lotos', name: 'Lotos', keyword: 'lotos', category: 'Transport', brandColor: '#E30613', icon: 'Fuel' },
  { id: 'orange-pl', name: 'Orange Polska', keyword: 'orange', category: 'Utilities', logo: 'SiOrange', brandColor: '#FF6600', icon: 'Wifi' },
  { id: 'play-pl', name: 'Play', keyword: 'play', category: 'Utilities', brandColor: '#582C83', icon: 'Wifi' },
  { id: 'plus-pl', name: 'Plus', keyword: 'plus', category: 'Utilities', brandColor: '#008542', icon: 'Wifi' },
  { id: 'pyszne', name: 'Pyszne.pl', keyword: 'pyszne', category: 'Dining Out', logo: 'SiJusteat', brandColor: '#FF8000', icon: 'Utensils' },

  // Indonesia (id)
  { id: 'indomaret', name: 'Indomaret', keyword: 'indomaret', category: 'Groceries', brandColor: '#00539B', icon: 'ShoppingCart' },
  { id: 'alfamart', name: 'Alfamart', keyword: 'alfamart', category: 'Groceries', brandColor: '#ED1C24', icon: 'ShoppingCart' },
  { id: 'superindo', name: 'Super Indo', keyword: 'super indo', category: 'Groceries', brandColor: '#E30613', icon: 'ShoppingCart' },
  { id: 'hypermart', name: 'Hypermart', keyword: 'hypermart', category: 'Groceries', brandColor: '#0083CA', icon: 'ShoppingCart' },
  { id: 'gojek', name: 'Gojek', keyword: 'gojek', category: 'Transport', logo: 'SiGojek', brandColor: '#00AA13', icon: 'Car' },
  { id: 'grab', name: 'Grab', keyword: 'grab', category: 'Transport', logo: 'SiGrab', brandColor: '#00B14F', icon: 'Car' },
  { id: 'tokopedia', name: 'Tokopedia', keyword: 'tokopedia', category: 'Shopping', brandColor: '#03AC0E', icon: 'ShoppingBag' },
  { id: 'shopee', name: 'Shopee', keyword: 'shopee', category: 'Shopping', logo: 'SiShopee', brandColor: '#EE4D2D', icon: 'ShoppingBag' },
  { id: 'bukalapak', name: 'Bukalapak', keyword: 'bukalapak', category: 'Shopping', brandColor: '#E31E52', icon: 'ShoppingBag' },
  { id: 'telkomsel', name: 'Telkomsel', keyword: 'telkomsel', category: 'Utilities', brandColor: '#ED022A', icon: 'Wifi' },
  { id: 'indosat', name: 'Indosat Ooredoo', keyword: 'indosat', category: 'Utilities', brandColor: '#FFC72C', icon: 'Wifi' },
  { id: 'xl-axiata', name: 'XL Axiata', keyword: 'xl axiata', category: 'Utilities', brandColor: '#002DBB', icon: 'Wifi' },
  { id: 'pertamina', name: 'Pertamina', keyword: 'pertamina', category: 'Transport', brandColor: '#005BAA', icon: 'Fuel' },
  { id: 'pln', name: 'PLN (Listrik)', keyword: 'pln', category: 'Utilities', brandColor: '#FFD700', icon: 'Zap' },

  // Germany / Austria / Switzerland (de)
  { id: 'rewe', name: 'REWE', keyword: 'rewe', category: 'Groceries', logo: 'SiRewe', brandColor: '#CC071E', icon: 'ShoppingCart' },
  { id: 'edeka', name: 'EDEKA', keyword: 'edeka', category: 'Groceries', logo: 'SiEdeka', brandColor: '#005CA9', icon: 'ShoppingCart' },
  { id: 'aldi', name: 'ALDI', keyword: 'aldi', category: 'Groceries', logo: 'SiAldisud', brandColor: '#003A6A', icon: 'ShoppingCart' },
  { id: 'lidl', name: 'Lidl', keyword: 'lidl', category: 'Groceries', logo: 'SiLidl', brandColor: '#0050AA', icon: 'ShoppingCart' },
  { id: 'kaufland', name: 'Kaufland', keyword: 'kaufland', category: 'Groceries', logo: 'SiKaufland', brandColor: '#E3000F', icon: 'ShoppingCart' },
  { id: 'coop', name: 'Coop', keyword: 'coop', category: 'Groceries', logo: 'SiCoop', brandColor: '#E35205', icon: 'ShoppingCart' },
  { id: 'penny', name: 'Penny', keyword: 'penny', category: 'Groceries', brandColor: '#CC071E', icon: 'ShoppingCart' },
  { id: 'netto', name: 'Netto Marken-Discount', keyword: 'netto', category: 'Groceries', brandColor: '#FFD500', icon: 'ShoppingCart' },
  { id: 'dm', name: 'dm-drogerie markt', keyword: 'dm-drogerie', category: 'Shopping', logo: 'SiDm', brandColor: '#002D72', icon: 'ShoppingBag' },
  { id: 'zalando', name: 'Zalando', keyword: 'zalando', category: 'Shopping', logo: 'SiZalando', brandColor: '#FF6900', icon: 'ShoppingBag' },
  { id: 'lieferando', name: 'Lieferando', keyword: 'lieferando', category: 'Dining Out', logo: 'SiJusteat', brandColor: '#FF8000', icon: 'Utensils' },
  { id: 'sparkasse', name: 'Sparkasse', keyword: 'sparkasse', category: 'Transfers', logo: 'SiSparkasse', brandColor: '#E30613', icon: 'Landmark' },
  { id: 'shell', name: 'Shell', keyword: 'shell', category: 'Transport', logo: 'SiShell', brandColor: '#FFD500', icon: 'Fuel' },
  { id: 'aral', name: 'Aral', keyword: 'aral', category: 'Transport', logo: 'SiAral', brandColor: '#003399', icon: 'Fuel' },
  { id: 'omv', name: 'OMV', keyword: 'omv', category: 'Transport', brandColor: '#006633', icon: 'Fuel' },
  { id: 'totalenergies', name: 'TotalEnergies', keyword: 'total', category: 'Transport', brandColor: '#ED1B2D', icon: 'Fuel' },
  { id: 'db', name: 'Deutsche Bahn', keyword: 'bahn', category: 'Transport', logo: 'SiDeutschebahn', brandColor: '#FF0000', icon: 'Train' },
  { id: 'telekom', name: 'Telekom', keyword: 'telekom', category: 'Utilities', logo: 'SiDeutschetelekom', brandColor: '#E20074', icon: 'Wifi' },
  { id: 'vodafone', name: 'Vodafone', keyword: 'vodafone', category: 'Utilities', logo: 'SiVodafone', brandColor: '#E60000', icon: 'Wifi' },
  { id: 'o2', name: 'O2', keyword: 'o2', category: 'Utilities', logo: 'SiO2', brandColor: '#0019A5', icon: 'Wifi' },
  { id: 'gym', name: 'McFIT / FitX', keyword: 'fit', category: 'Healthcare', icon: 'Dumbbell' },

  // UK & International (en)
  { id: 'tesco', name: 'Tesco', keyword: 'tesco', category: 'Groceries', logo: 'SiTesco', brandColor: '#EE1C2E', icon: 'ShoppingCart' },
  { id: 'asda', name: 'ASDA', keyword: 'asda', category: 'Groceries', logo: 'SiAsda', brandColor: '#78BE20', icon: 'ShoppingCart' },
  { id: 'morrisons', name: 'Morrisons', keyword: 'morrisons', category: 'Groceries', logo: 'SiMorrisons', brandColor: '#004F34', icon: 'ShoppingCart' },
  { id: 'sainsbury', name: 'Sainsbury\'s', keyword: 'sainsbury', category: 'Groceries', brandColor: '#F06C00', icon: 'ShoppingCart' },
  { id: 'bp', name: 'BP', keyword: 'bp', category: 'Transport', brandColor: '#007A3D', icon: 'Fuel' }
]
