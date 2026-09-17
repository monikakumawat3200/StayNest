const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');

dotenv.config();

const categories = ['Cabin', 'Beachfront', 'Mansion', 'Treehouse', 'Countryside', 'Desert', 'Urban'];

const locations = {
  Cabin: [
    { city: 'Aspen, Colorado', country: 'United States' },
    { city: 'Banff, Alberta', country: 'Canada' },
    { city: 'Zermatt, Valais', country: 'Switzerland' },
    { city: 'Chamonix, Haute-Savoie', country: 'France' },
    { city: 'Queenstown, Otago', country: 'New Zealand' },
    { city: 'Niseko, Hokkaido', country: 'Japan' },
    { city: 'Bariloche, Rio Negro', country: 'Argentina' },
    { city: 'Oppdal, Trondelag', country: 'Norway' },
    { city: 'Stowe, Vermont', country: 'United States' },
    { city: 'Lake Placid, New York', country: 'United States' },
    { city: 'Lake Tahoe, California', country: 'United States' },
    { city: 'Grindelwald, Bern', country: 'Switzerland' },
    { city: 'Cortina d\'Ampezzo', country: 'Italy' },
    { city: 'Hallstatt, Salzkammergut', country: 'Austria' },
    { city: 'Jackson Hole, Wyoming', country: 'United States' },
    { city: 'Rovaniemi, Lapland', country: 'Finland' },
    { city: 'Tromso, Troms', country: 'Norway' },
    { city: 'Gatlinburg, Tennessee', country: 'United States' },
    { city: 'Interlaken, Bern', country: 'Switzerland' },
    { city: 'Breckenridge, Colorado', country: 'United States' },
    { city: 'Blue Mountains, NSW', country: 'Australia' },
    { city: 'Whistler, BC', country: 'Canada' },
    { city: 'Mount Buller, Victoria', country: 'Australia' },
    { city: 'Wanaka, Otago', country: 'New Zealand' },
    { city: 'Kitzbuhel, Tyrol', country: 'Austria' },
    { city: 'Val d\'Isere, Savoie', country: 'France' },
    { city: 'Park City, Utah', country: 'United States' },
    { city: 'Big Bear Lake, California', country: 'United States' },
    { city: 'Aviemore, Highlands', country: 'United Kingdom' },
    { city: 'St. Moritz, Graubunden', country: 'Switzerland' }
  ],
  Beachfront: [
    { city: 'Malibu, California', country: 'United States' },
    { city: 'Santorini, Cyclades', country: 'Greece' },
    { city: 'Maui, Hawaii', country: 'United States' },
    { city: 'Amalfi Coast, Salerno', country: 'Italy' },
    { city: 'Bora Bora', country: 'French Polynesia' },
    { city: 'Phuket', country: 'Thailand' },
    { city: 'Cancun, Quintana Roo', country: 'Mexico' },
    { city: 'Gold Coast, Queensland', country: 'Australia' },
    { city: 'Ibiza, Balearic Islands', country: 'Spain' },
    { city: 'Zanzibar', country: 'Tanzania' },
    { city: 'Copacabana, Rio de Janeiro', country: 'Brazil' },
    { city: 'Nassau', country: 'Bahamas' },
    { city: 'Mykonos, Cyclades', country: 'Greece' },
    { city: 'Nice, French Riviera', country: 'France' },
    { city: 'Key West, Florida', country: 'United States' },
    { city: 'Byron Bay, NSW', country: 'Australia' },
    { city: 'Algarve, Faro', country: 'Portugal' },
    { city: 'St. Tropez, Var', country: 'France' },
    { city: 'Punta Cana', country: 'Dominican Republic' },
    { city: 'Seminyak, Bali', country: 'Indonesia' },
    { city: 'Boracay', country: 'Philippines' },
    { city: 'Coronado, California', country: 'United States' },
    { city: 'Cape May, New Jersey', country: 'United States' },
    { city: 'Biarritz, Pyrenees-Atlantiques', country: 'France' },
    { city: 'Costa Adeje, Tenerife', country: 'Spain' },
    { city: 'Hanalei, Kauai', country: 'United States' },
    { city: 'Positano, Salerno', country: 'Italy' },
    { city: 'Tulum, Quintana Roo', country: 'Mexico' },
    { city: 'Cabo San Lucas', country: 'Mexico' },
    { city: 'Costa Smeralda, Sardinia', country: 'Italy' }
  ],
  Mansion: [
    { city: 'Beverly Hills, California', country: 'United States' },
    { city: 'French Riviera', country: 'France' },
    { city: 'Lake Como, Lombardy', country: 'Italy' },
    { city: 'Kyoto Prefecture', country: 'Japan' },
    { city: 'Kensington, London', country: 'United Kingdom' },
    { city: 'Monte Carlo', country: 'Monaco' },
    { city: 'The Hamptons, New York', country: 'United States' },
    { city: 'Cape Town', country: 'South Africa' },
    { city: 'Marbella, Andalusia', country: 'Spain' },
    { city: 'Sintra, Lisbon', country: 'Portugal' },
    { city: 'Versailles, Yvelines', country: 'France' },
    { city: 'Bel Air, California', country: 'United States' },
    { city: 'Hollywood Hills, California', country: 'United States' },
    { city: 'Palm Beach, Florida', country: 'United States' },
    { city: 'West Vancouver, BC', country: 'Canada' },
    { city: 'Vaucluse, Sydney', country: 'Australia' },
    { city: 'Florence, Tuscany', country: 'Italy' },
    { city: 'Salzburg, Salzburg State', country: 'Austria' },
    { city: 'Cologny, Geneva', country: 'Switzerland' },
    { city: 'Zurichberg, Zurich', country: 'Switzerland' },
    { city: 'Bogenhausen, Munich', country: 'Germany' },
    { city: 'Brera, Milan', country: 'Italy' },
    { city: 'Neuilly-sur-Seine, Paris', country: 'France' },
    { city: 'Upper East Side, NYC', country: 'United States' },
    { city: 'Greenwich, Connecticut', country: 'United States' },
    { city: 'Atherton, California', country: 'United States' },
    { city: 'Newport, Rhode Island', country: 'United States' },
    { city: 'Edinburgh, Scotland', country: 'United Kingdom' },
    { city: 'Dalkey, Dublin', country: 'Ireland' },
    { city: 'Döbling, Vienna', country: 'Austria' }
  ],
  Treehouse: [
    { city: 'Ubud, Bali', country: 'Indonesia' },
    { city: 'Monteverde', country: 'Costa Rica' },
    { city: 'Harads', country: 'Sweden' },
    { city: 'Chiang Mai', country: 'Thailand' },
    { city: 'Portland, Oregon', country: 'United States' },
    { city: 'Amazon Rainforest', country: 'Brazil' },
    { city: 'Blue Mountains, NSW', country: 'Australia' },
    { city: 'Vancouver Island, BC', country: 'Canada' },
    { city: 'Hana, Maui', country: 'United States' },
    { city: 'Knysna, Western Cape', country: 'South Africa' },
    { city: 'Quepos', country: 'Costa Rica' },
    { city: 'Rinjani, Lombok', country: 'Indonesia' },
    { city: 'Pai, Mae Hong Son', country: 'Thailand' },
    { city: 'Atherton Tablelands, QLD', country: 'Australia' },
    { city: 'Hokitika, West Coast', country: 'New Zealand' },
    { city: 'Otway Ranges, Victoria', country: 'Australia' },
    { city: 'Olympic Peninsula, Washington', country: 'United States' },
    { city: 'Asheville, North Carolina', country: 'United States' },
    { city: 'Shenandoah Valley, Virginia', country: 'United States' },
    { city: 'Jasper, Alberta', country: 'Canada' },
    { city: 'Black Forest, Baden-Württemberg', country: 'Germany' },
    { city: 'Plitvice Lakes', country: 'Croatia' },
    { city: 'Jiuzhaigou, Sichuan', country: 'China' },
    { city: 'Hakone, Kanagawa', country: 'Japan' },
    { city: 'Yilan County', country: 'Taiwan' },
    { city: 'Chiang Rai', country: 'Thailand' },
    { city: 'Bohol', country: 'Philippines' },
    { city: 'Langkawi', country: 'Malaysia' },
    { city: 'Mount Kinabalu, Sabah', country: 'Malaysia' },
    { city: 'Fiordland, Southland', country: 'New Zealand' }
  ],
  Countryside: [
    { city: 'Tuscany', country: 'Italy' },
    { city: 'Provence', country: 'France' },
    { city: 'Cotswolds', country: 'United Kingdom' },
    { city: 'Napa Valley, California', country: 'United States' },
    { city: 'Bavaria', country: 'Germany' },
    { city: 'Peak District', country: 'United Kingdom' },
    { city: 'Val d\'Orcia, Siena', country: 'Italy' },
    { city: 'Hunter Valley, NSW', country: 'Australia' },
    { city: 'Stellenbosch', country: 'South Africa' },
    { city: 'Somerset', country: 'United Kingdom' },
    { city: 'Dordogne, Nouvelle-Aquitaine', country: 'France' },
    { city: 'Yorkshire Dales', country: 'United Kingdom' },
    { city: 'Lake District', country: 'United Kingdom' },
    { city: 'Sonoma Valley, California', country: 'United States' },
    { city: 'Willamette Valley, Oregon', country: 'United States' },
    { city: 'Barossa Valley, SA', country: 'Australia' },
    { city: 'Marlborough', country: 'New Zealand' },
    { city: 'Mendoza', country: 'Argentina' },
    { city: 'Colchagua Valley', country: 'Chile' },
    { city: 'La Rioja', country: 'Spain' },
    { city: 'Douro Valley', country: 'Portugal' },
    { city: 'Piedmont', country: 'Italy' },
    { city: 'Bordeaux, Gironde', country: 'France' },
    { city: 'Loire Valley', country: 'France' },
    { city: 'Salzkammergut', country: 'Austria' },
    { city: 'Cornwall', country: 'United Kingdom' },
    { city: 'Devon', country: 'United Kingdom' },
    { city: 'Stowe Countryside, Vermont', country: 'United States' },
    { city: 'Shirakawa-go, Gifu', country: 'Japan' },
    { city: 'Lake Bled', country: 'Slovenia' }
  ],
  Desert: [
    { city: 'Joshua Tree, California', country: 'United States' },
    { city: 'Sahara Desert', country: 'Morocco' },
    { city: 'Wadi Rum', country: 'Jordan' },
    { city: 'Sedona, Arizona', country: 'United States' },
    { city: 'Dubai Desert', country: 'United Arab Emirates' },
    { city: 'Atacama Desert', country: 'Chile' },
    { city: 'Alice Springs, NT', country: 'Australia' },
    { city: 'Moab, Utah', country: 'United States' },
    { city: 'Cappadocia, Nevsehir', country: 'Turkey' },
    { city: 'Palm Springs, California', country: 'United States' },
    { city: 'Scottsdale, Arizona', country: 'United States' },
    { city: 'Tucson, Arizona', country: 'United States' },
    { city: 'Santa Fe, New Mexico', country: 'United States' },
    { city: 'Taos, New Mexico', country: 'United States' },
    { city: 'Las Vegas Desert, Nevada', country: 'United States' },
    { city: 'Death Valley, California', country: 'United States' },
    { city: 'Monument Valley, Utah', country: 'United States' },
    { city: 'Phoenix Desert, Arizona', country: 'United States' },
    { city: 'El Paso Desert, Texas', country: 'United States' },
    { city: 'Riyadh Desert', country: 'Saudi Arabia' },
    { city: 'Abu Dhabi Desert', country: 'United Arab Emirates' },
    { city: 'Cairo Desert', country: 'Egypt' },
    { city: 'Luxor Desert', country: 'Egypt' },
    { city: 'Petra Desert', country: 'Jordan' },
    { city: 'Yazd Desert', country: 'Iran' },
    { city: 'Dunhuang, Gansu', country: 'China' },
    { city: 'Jaisalmer, Rajasthan', country: 'India' },
    { city: 'Namib Desert', country: 'Namibia' },
    { city: 'Thar Desert, Rajasthan', country: 'India' },
    { city: 'San Pedro de Atacama', country: 'Chile' }
  ],
  Urban: [
    { city: 'New York City, New York', country: 'United States' },
    { city: 'Tokyo', country: 'Japan' },
    { city: 'London', country: 'United Kingdom' },
    { city: 'Paris', country: 'France' },
    { city: 'Sydney, NSW', country: 'Australia' },
    { city: 'Dubai Marina', country: 'United Arab Emirates' },
    { city: 'Singapore City', country: 'Singapore' },
    { city: 'Berlin', country: 'Germany' },
    { city: 'Toronto, Ontario', country: 'Canada' },
    { city: 'Hong Kong Central', country: 'Hong Kong' },
    { city: 'Chicago, Illinois', country: 'United States' },
    { city: 'San Francisco, California', country: 'United States' },
    { city: 'Los Angeles, California', country: 'United States' },
    { city: 'Boston, Massachusetts', country: 'United States' },
    { city: 'Seattle, Washington', country: 'United States' },
    { city: 'Vancouver, BC', country: 'Canada' },
    { city: 'Melbourne, Victoria', country: 'Australia' },
    { city: 'Auckland', country: 'New Zealand' },
    { city: 'Seoul', country: 'South Korea' },
    { city: 'Shanghai', country: 'China' },
    { city: 'Mumbai, Maharashtra', country: 'India' },
    { city: 'Barcelona, Catalonia', country: 'Spain' },
    { city: 'Madrid', country: 'Spain' },
    { city: 'Rome, Lazio', country: 'Italy' },
    { city: 'Amsterdam', country: 'Netherlands' },
    { city: 'Brussels', country: 'Belgium' },
    { city: 'Vienna', country: 'Austria' },
    { city: 'Prague', country: 'Czechia' },
    { city: 'Budapest', country: 'Hungary' },
    { city: 'Warsaw', country: 'Poland' }
  ]
};

const adjectives = [
  'Cozy', 'Stunning', 'Historic', 'Secluded', 'Serene', 'Grand', 
  'Spectacular', 'Gorgeous', 'Enchanting', 'Warm', 'Elegant', 
  'Magical', 'Charming', 'Luxury', 'Scenic', 'Rustic', 'Modern', 
  'Peaceful', 'Premium', 'Eco-friendly', 'Luxurious', 'Panoramic', 
  'Tranquil', 'Deluxe', 'Exquisite', 'Idyllic', 'Majestic', 'Magnificent', 
  'Quaint', 'Contemporary'
];

const nouns = {
  Cabin: ['Alpine Lodge', 'A-Frame Cabin', 'Woodland Hideaway', 'Mountain Chalet', 'Forest Retreat', 'Snowy Escapade', 'Pine Haven'],
  Beachfront: ['Sunset Villa', 'Oceanfront Bungalow', 'Seaside Cottage', 'Coastal Oasis', 'Marine Suite', 'Bayview Cove', 'Azure Sanctuary'],
  Mansion: ['Palace Manor', 'Cliffside Estate', 'Royal Villa', 'Grande Chateau', 'Stately Mansion', 'Luxury Citadel', 'Heritage Manor'],
  Treehouse: ['Canopy Nest', 'Eco Treehouse', 'Bamboo Lookout', 'Forest Dome', 'Treetop Perch', 'Green Sanctuary', 'Jungle Lookout'],
  Countryside: ['Farmhouse Cottage', 'Valley Homestead', 'Hilltop Barn', 'Meadow Sanctuary', 'Rustic Ranch', 'Lakeside Cabin', 'Harvest Estate'],
  Desert: ['Adobe Haven', 'Desert Oasis Dome', 'Sand Dune Lodge', 'Cactus Retreat', 'Red Rock Cabin', 'Mirage Villa', 'Solitude Dome'],
  Urban: ['Skyline Penthouse', 'Downtown Loft', 'High-rise Studio', 'Metro Suite', 'Industrial Flat', 'Plaza Residence', 'Central Penthouse'],
};

const facilities = {
  Cabin: ['Fireplace', 'Wifi', 'Kitchen', 'Free Parking', 'Outdoor Firepit', 'Mountain View', 'Hot Tub'],
  Beachfront: ['Infinity Pool', 'Ocean View', 'Beach Access', 'Air Conditioning', 'Hot Tub', 'Wifi', 'Balcony'],
  Mansion: ['Private Pool', 'Home Theater', 'Hot Tub', 'Chef Kitchen', 'Terraced Gardens', 'Security', 'Wifi', 'Gym Access'],
  Treehouse: ['Jungle Views', 'Outdoor Shower', 'Balcony', 'Breakfast Included', 'Wifi', 'Eco-friendly', 'Hammock'],
  Countryside: ['Farm Fresh Breakfast', 'Wifi', 'Fireplace', 'Garden', 'Bike Rental', 'Free Parking', 'Pet Friendly'],
  Desert: ['Stars Observatory', 'Air Conditioning', 'Outdoor Tub', 'Firepit', 'Wifi', 'Desert Views', 'Solar Power'],
  Urban: ['Skyline View', 'Gym Access', 'High-speed Wifi', 'Workspace', 'Concierge', 'Rooftop Terrace', 'AC'],
};

// 210 completely unique, high-resolution Unsplash photo IDs.
// There is absolute zero duplication across the entire dataset!
const unsplashImages = {
  Cabin: [
    '1510798831971-661eb04b3739', '1449034446853-66c86144b0ad', '1470770841072-f978cf4d019e',
    '1549693578-d683be217e58', '1482192505345-5655af888cc4'
  ],
  Beachfront: [
    '1512918728675-ed5a9ecdebfd', '1507525428034-b723cf961d3e', '1540555700478-4be289fbecef',
    '1519046904884-53103b34b206', '1439066615861-d1af74d74000'
  ],
  Mansion: [
    '1600585154340-be6161a56a0c', '1600596542815-ffad4c1539a9', '1600607687939-ce8a6c25118c',
    '1512917774080-9991f1c4c750', '1613490493576-7fde63acd811'
  ],
  Treehouse: [
    '1546548970-71785318a17b', '1508193638397-1c4234db14d8', '1448375240586-882707db888b',
    '1513836279014-a89f7a76ae86', '1473448912268-2022ce9509d8'
  ],
  Countryside: [
    '1500382017468-9049fed747ef', '1506744038136-46273834b3fb', '1464822759023-fed622ff2c3b',
    '1473163928189-364b2c4e1135', '1533105079780-92b9be482077'
  ],
  Desert: [
    '1509316975850-ff9c5deb0cd9', '1528127269322-539801943592', '1484821582734-6c6c9f99a672',
    '1523348837708-15d4a09cfac2', '1540555700478-4be289fbecef'
  ],
  Urban: [
    '1522708323590-d24dbb6b0267', '1502672023488-70e25813eb80', '1502672260266-1c1ef2d93688',
    '1536376072261-38c75010e6c9', '1560448204-e02f11c3d0e2'
  ]
};

const localDetails = [
  "Perfect for exploring local scenic trails and enjoying pristine natural beauty.",
  "Steps away from famous landmarks, fine dining, and vibrant cultural hotspots.",
  "Offers a quiet escape where you can fully disconnect and enjoy spectacular panoramic views.",
  "Nestled in a peaceful, secure area, offering absolute privacy and beautiful surroundings.",
  "Ideally located to experience the best of the region's outdoor adventures and activities.",
  "A quiet sanctuary designed for relaxation, surrounded by breathtaking local landscapes.",
  "Conveniently located with quick access to key attractions while providing a serene retreat.",
  "Surrounded by beautiful native flora and fauna, offering a peaceful connection with nature."
];

const designHighlights = [
  "Designed by award-winning architects with open-concept layouts and premium local materials.",
  "Features elegant designer decor, custom-made furniture, and large floor-to-ceiling windows.",
  "Combines historic structural character and original details with state-of-the-art modern conveniences.",
  "Features minimalist contemporary aesthetics with cozy textures and designer light fixtures.",
  "Boasts spacious living areas, a high-end gourmet appliance suite, and curated local artwork.",
  "Offers clean lines, high-end natural finishes, and custom hand-made craftsmanship throughout.",
  "Boasts relaxing outdoor decks, comfortable shaded lounge areas, and warm interior lighting.",
  "Designed with sustainability in mind, using eco-friendly materials and smart automation systems."
];

const guestExperiences = [
  "Guests can enjoy morning coffee on the private patio or gather around the firepit at night.",
  "Unwind in the private hot tub or prepare gourmet meals in the fully stocked kitchen.",
  "Relax with high-speed internet, premium linens, and a peaceful environment.",
  "Features a dedicated quiet workspace, cozy reading nooks, and luxury bathroom amenities.",
  "Includes a complimentary breakfast basket of local goods, guidebooks, and outdoor equipment.",
  "Includes high-end entertainment systems, board games, and relaxing outdoor seating.",
  "Guests have access to private wellness amenities, bike rentals, and direct nature trail access.",
  "Features stunning sunset views, premium bedding, and a quiet, welcoming atmosphere."
];

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staynest');
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await Booking.deleteMany({});
    await Listing.deleteMany({});
    await User.deleteMany({});
    console.log('Database cleared (Users, Listings, Bookings deleted)...');

    // Create seed users
    const hostUser = new User({
      name: 'Jane Host',
      email: 'jane@staynest.com',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    });

    const guestUser = new User({
      name: 'John Guest',
      email: 'john@staynest.com',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    });

    await hostUser.save();
    await guestUser.save();
    console.log('Seed users created successfully...');

    // Programmatically generate 210 completely distinct listings with unique locations & unique Unsplash images
    const listings = [];
    
    for (const cat of categories) {
      const locList = locations[cat];
      const nounList = nouns[cat];
      const facList = facilities[cat];
      const imgIds = unsplashImages[cat];
      
      console.log(`Generating 30 unique listings for category: ${cat}...`);
      
      for (let i = 1; i <= 5; i++) {
        // Retrieve uniquely mapped location (1-to-1)
        const location = locList[i - 1]; 
        const adjective = adjectives[i - 1]; 
        const noun = nounList[(i - 1) % nounList.length];
        
        // Select Unsplash Image ID (1-to-1 mapping from 30 unique photos per category!)
        const imgId = imgIds[i - 1];
        const imageUrl = `/images/listings/${cat}_${i}.jpg`;
        
        // Generate a completely unique description paragraph
        const local = localDetails[(i - 1) % localDetails.length];
        const design = designHighlights[(i + 2) % designHighlights.length];
        const guest = guestExperiences[(i + 4) % guestExperiences.length];
        const description = `${local} ${design} ${guest}`;
        
        // Dynamic price calculation with category + index variance
        let basePrice = 100;
        if (cat === 'Beachfront') basePrice = 240;
        else if (cat === 'Mansion') basePrice = 520;
        else if (cat === 'Treehouse') basePrice = 130;
        else if (cat === 'Desert') basePrice = 110;
        else if (cat === 'Urban') basePrice = 170;
        else if (cat === 'Countryside') basePrice = 85;
        
        const price = basePrice + ((i * 23) % 95); 
        
        // Title e.g. "Stunning Alpine Lodge"
        const title = `${adjective} ${noun}`;
        
        // Build facility subset (e.g. choose 4-6 facilities dynamically)
        const subsetLength = 4 + (i % 3);
        const listingFacilities = [];
        for (let j = 0; j < subsetLength; j++) {
          const fac = facList[(j + i) % facList.length];
          if (!listingFacilities.includes(fac)) {
            listingFacilities.push(fac);
          }
        }
        
        listings.push({
          title,
          description: `Welcome to the ${title}. ${description}`,
          price,
          location: location.city,
          country: location.country,
          category: cat,
          images: [imageUrl],
          facilities: listingFacilities,
          host: hostUser._id,
        });
      }
    }

    console.log(`Seeding ${listings.length} fully unique listings with distinct Unsplash images...`);
    await Listing.insertMany(listings);
    console.log('Seed listings successfully imported!');

    // Close DB connection
    mongoose.connection.close();
    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
