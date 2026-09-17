const mongoose = require('mongoose');
const dotenv = require('dotenv');
const https = require('https');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');

dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const inputData = {
  "properties": [
    {
      "id": "prop_001",
      "title": "Cozy Alpine Lodge",
      "category": "Cabin",
      "location": {
        "city": "Aspen",
        "state": "Colorado",
        "country": "United States",
        "lat": 39.1911,
        "lng": -106.8175
      },
      "pricePerNight": 245,
      "currency": "USD",
      "rating": 4.5,
      "reviewCount": 128,
      "maxGuests": 6,
      "bedrooms": 3,
      "bathrooms": 2,
      "description": "A warm timber lodge tucked beside a frozen alpine lake, surrounded by snow-dusted pines. Wake up to mountain views, relax by the wood-burning fireplace, and soak in the outdoor hot tub after a day on the slopes.",
      "amenities": ["WiFi", "Fireplace", "Hot Tub", "Free Parking", "Kitchen", "Heating", "Mountain View", "Ski-in/Ski-out"],
      "images": [
        "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8",
        "https://images.unsplash.com/photo-1518602164578-cd0074062767"
      ],
      "host": {
        "name": "Sarah Mitchell",
        "isSuperhost": true,
        "joined": "2019"
      },
      "isFeatured": true
    },
    {
      "id": "prop_002",
      "title": "Stunning A-Frame Cabin",
      "category": "Cabin",
      "location": {
        "city": "Banff",
        "state": "Alberta",
        "country": "Canada",
        "lat": 51.1784,
        "lng": -115.5708
      },
      "pricePerNight": 198,
      "currency": "USD",
      "rating": 4.6,
      "reviewCount": 94,
      "maxGuests": 4,
      "bedrooms": 2,
      "bathrooms": 1,
      "description": "A striking A-frame retreat overlooking a golden-lit bay, with floor-to-ceiling windows framing the Golden Gate skyline. Minimalist interiors meet dramatic natural light in this architect-designed escape.",
      "amenities": ["WiFi", "Kitchen", "Free Parking", "Workspace", "Balcony", "Heating", "Bay View"],
      "images": [
        "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
        "https://images.unsplash.com/photo-1502005229766-05e4a99e9330"
      ],
      "host": {
        "name": "Daniel Reyes",
        "isSuperhost": false,
        "joined": "2021"
      },
      "isFeatured": true
    },
    {
      "id": "prop_003",
      "title": "Historic Woodland Hideaway",
      "category": "Cabin",
      "location": {
        "city": "Zermatt",
        "state": "Valais",
        "country": "Switzerland",
        "lat": 46.0207,
        "lng": 7.7491
      },
      "pricePerNight": 312,
      "currency": "USD",
      "rating": 4.7,
      "reviewCount": 203,
      "maxGuests": 5,
      "bedrooms": 3,
      "bathrooms": 2,
      "description": "A centuries-old stone-and-timber cottage on the edge of an emerald lake, with jagged Alpine peaks rising behind. Restored with care, it blends rustic charm with modern comfort.",
      "amenities": ["WiFi", "Kitchen", "Fireplace", "Lake Access", "Free Parking", "Heating", "Mountain View"],
      "images": [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1"
      ],
      "host": {
        "name": "Klara Ambauer",
        "isSuperhost": true,
        "joined": "2017"
      },
      "isFeatured": true
    },
    {
      "id": "prop_004",
      "title": "Secluded Mountain Chalet",
      "category": "Cabin",
      "location": {
        "city": "Chamonix",
        "state": "Haute-Savoie",
        "country": "France",
        "lat": 45.9237,
        "lng": 6.8694
      },
      "pricePerNight": 289,
      "currency": "USD",
      "rating": 4.8,
      "reviewCount": 156,
      "maxGuests": 8,
      "bedrooms": 4,
      "bathrooms": 3,
      "description": "Perched above the valley near Mont Blanc, this chalet offers panoramic views, a private sauna, and ski storage right at the door. Ideal for large groups seeking an alpine escape.",
      "amenities": ["WiFi", "Sauna", "Kitchen", "Free Parking", "Heating", "Mountain View", "Fireplace"],
      "images": [
        "https://images.unsplash.com/photo-1519821172141-b5d8342664dd"
      ],
      "host": {
        "name": "Marc Dubois",
        "isSuperhost": true,
        "joined": "2018"
      },
      "isFeatured": false
    },
    {
      "id": "prop_005",
      "title": "Oceanfront Glass Villa",
      "category": "Beachfront",
      "location": {
        "city": "Uluwatu",
        "state": "Bali",
        "country": "Indonesia",
        "lat": -8.8291,
        "lng": 115.0849
      },
      "pricePerNight": 420,
      "currency": "USD",
      "rating": 4.9,
      "reviewCount": 87,
      "maxGuests": 10,
      "bedrooms": 5,
      "bathrooms": 5,
      "description": "A cliffside villa with an infinity pool that appears to spill into the Indian Ocean. Open-air living spaces, private beach access, and a dedicated villa manager make this a true tropical sanctuary.",
      "amenities": ["Infinity Pool", "Private Beach", "WiFi", "Air Conditioning", "Chef Service", "Kitchen", "Ocean View"],
      "images": [
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750"
      ],
      "host": {
        "name": "Made Wirawan",
        "isSuperhost": true,
        "joined": "2016"
      },
      "isFeatured": true
    },
    {
      "id": "prop_006",
      "title": "Whitewashed Cycladic Retreat",
      "category": "Beachfront",
      "location": {
        "city": "Oia",
        "state": "Santorini",
        "country": "Greece",
        "lat": 36.4618,
        "lng": 25.3753
      },
      "pricePerNight": 365,
      "currency": "USD",
      "rating": 4.8,
      "reviewCount": 211,
      "maxGuests": 4,
      "bedrooms": 2,
      "bathrooms": 2,
      "description": "Carved into the caldera cliffs, this whitewashed hideaway offers a private plunge pool and unbeatable sunset views over the Aegean Sea.",
      "amenities": ["Private Pool", "WiFi", "Sea View", "Air Conditioning", "Kitchen", "Terrace"],
      "images": [
        "https://images.unsplash.com/photo-1533105079780-92b9be482077"
      ],
      "host": {
        "name": "Eleni Papadopoulos",
        "isSuperhost": true,
        "joined": "2015"
      },
      "isFeatured": true
    },
    {
      "id": "prop_007",
      "title": "Grand Coastal Mansion",
      "category": "Mansion",
      "location": {
        "city": "Malibu",
        "state": "California",
        "country": "United States",
        "lat": 34.0259,
        "lng": -118.7798
      },
      "pricePerNight": 1250,
      "currency": "USD",
      "rating": 4.9,
      "reviewCount": 62,
      "maxGuests": 14,
      "bedrooms": 7,
      "bathrooms": 8,
      "description": "A sprawling clifftop estate with a private screening room, wine cellar, and infinity pool overlooking the Pacific. Designed for luxury retreats and exclusive events.",
      "amenities": ["Infinity Pool", "Home Theater", "Wine Cellar", "Gym", "WiFi", "Chef's Kitchen", "Ocean View", "Free Parking"],
      "images": [
        "https://images.unsplash.com/photo-1613977257363-707ba9348227",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"
      ],
      "host": {
        "name": "Jonathan Blake",
        "isSuperhost": false,
        "joined": "2020"
      },
      "isFeatured": true
    },
    {
      "id": "prop_008",
      "title": "Provencal Countryside Estate",
      "category": "Mansion",
      "location": {
        "city": "Gordes",
        "state": "Provence",
        "country": "France",
        "lat": 43.9111,
        "lng": 5.2000
      },
      "pricePerNight": 890,
      "currency": "USD",
      "rating": 4.7,
      "reviewCount": 45,
      "maxGuests": 12,
      "bedrooms": 6,
      "bathrooms": 6,
      "description": "A restored 18th-century estate surrounded by lavender fields and olive groves, complete with a stone courtyard and outdoor dining terrace.",
      "amenities": ["Private Pool", "Vineyard View", "WiFi", "Kitchen", "Free Parking", "Garden", "Fireplace"],
      "images": [
        "https://images.unsplash.com/photo-1523217582562-09d0def993a6"
      ],
      "host": {
        "name": "Isabelle Laurent",
        "isSuperhost": true,
        "joined": "2014"
      },
      "isFeatured": false
    },
    {
      "id": "prop_009",
      "title": "Canopy Treehouse Retreat",
      "category": "Treehouse",
      "location": {
        "city": "Ubud",
        "state": "Bali",
        "country": "Indonesia",
        "lat": -8.5069,
        "lng": 115.2625
      },
      "pricePerNight": 175,
      "currency": "USD",
      "rating": 4.8,
      "reviewCount": 176,
      "maxGuests": 2,
      "bedrooms": 1,
      "bathrooms": 1,
      "description": "Suspended above a rushing jungle river, this bamboo treehouse offers an open-air bathtub, hammock deck, and the constant hum of rainforest life.",
      "amenities": ["WiFi", "Jungle View", "Outdoor Bathtub", "Breakfast Included", "Fan Cooling"],
      "images": [
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"
      ],
      "host": {
        "name": "Wayan Sudiarta",
        "isSuperhost": true,
        "joined": "2019"
      },
      "isFeatured": true
    },
    {
      "id": "prop_010",
      "title": "Redwood Forest Treehouse",
      "category": "Treehouse",
      "location": {
        "city": "Mendocino",
        "state": "California",
        "country": "United States",
        "lat": 39.3076,
        "lng": -123.7995
      },
      "pricePerNight": 210,
      "currency": "USD",
      "rating": 4.6,
      "reviewCount": 98,
      "maxGuests": 3,
      "bedrooms": 1,
      "bathrooms": 1,
      "description": "Nestled among towering redwoods, this cozy treehouse has a wraparound deck, wood stove, and skylight for stargazing.",
      "amenities": ["WiFi", "Wood Stove", "Forest View", "Kitchenette", "Free Parking"],
      "images": [
        "https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9"
      ],
      "host": {
        "name": "Grace Feldman",
        "isSuperhost": false,
        "joined": "2020"
      },
      "isFeatured": false
    },
    {
      "id": "prop_011",
      "title": "Tuscan Farmhouse Villa",
      "category": "Countryside",
      "location": {
        "city": "Val d'Orcia",
        "state": "Tuscany",
        "country": "Italy",
        "lat": 43.0667,
        "lng": 11.6167
      },
      "pricePerNight": 340,
      "currency": "USD",
      "rating": 4.8,
      "reviewCount": 134,
      "maxGuests": 8,
      "bedrooms": 4,
      "bathrooms": 3,
      "description": "A restored stone farmhouse surrounded by rolling vineyards and cypress-lined roads, with a private pool and outdoor kitchen for long Tuscan evenings.",
      "amenities": ["Private Pool", "Vineyard View", "WiFi", "Kitchen", "Free Parking", "Garden"],
      "images": [
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233"
      ],
      "host": {
        "name": "Lorenzo Conti",
        "isSuperhost": true,
        "joined": "2016"
      },
      "isFeatured": true
    },
    {
      "id": "prop_012",
      "title": "English Countryside Cottage",
      "category": "Countryside",
      "location": {
        "city": "Cotswolds",
        "state": "Gloucestershire",
        "country": "United Kingdom",
        "lat": 51.8330,
        "lng": -1.8433
      },
      "pricePerNight": 165,
      "currency": "USD",
      "rating": 4.5,
      "reviewCount": 112,
      "maxGuests": 5,
      "bedrooms": 3,
      "bathrooms": 2,
      "description": "A charming thatched-roof cottage with a private garden, wood-burning stove, and rolling green hills right outside the door.",
      "amenities": ["WiFi", "Fireplace", "Garden", "Kitchen", "Free Parking", "Countryside View"],
      "images": [
        "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b"
      ],
      "host": {
        "name": "Emily Whitmore",
        "isSuperhost": true,
        "joined": "2018"
      },
      "isFeatured": false
    },
    {
      "id": "prop_013",
      "title": "Desert Dome Retreat",
      "category": "Desert",
      "location": {
        "city": "Joshua Tree",
        "state": "California",
        "country": "United States",
        "lat": 34.1347,
        "lng": -116.3131
      },
      "pricePerNight": 230,
      "currency": "USD",
      "rating": 4.7,
      "reviewCount": 145,
      "maxGuests": 4,
      "bedrooms": 2,
      "bathrooms": 1,
      "description": "A geodesic dome home under some of the darkest skies in California, with a private hot tub and unobstructed views of Joshua Tree's iconic rock formations.",
      "amenities": ["Hot Tub", "WiFi", "Desert View", "Stargazing Deck", "Kitchen", "Free Parking"],
      "images": [
        "https://images.unsplash.com/photo-1509316785289-025f5b846b35"
      ],
      "host": {
        "name": "Tyler Brooks",
        "isSuperhost": true,
        "joined": "2019"
      },
      "isFeatured": true
    },
    {
      "id": "prop_014",
      "title": "Sahara Luxury Camp",
      "category": "Desert",
      "location": {
        "city": "Merzouga",
        "state": "Errachidia",
        "country": "Morocco",
        "lat": 31.0801,
        "lng": -4.0133
      },
      "pricePerNight": 280,
      "currency": "USD",
      "rating": 4.9,
      "reviewCount": 71,
      "maxGuests": 2,
      "bedrooms": 1,
      "bathrooms": 1,
      "description": "A private luxury tent among the dunes of the Sahara, with traditional Berber decor, a rooftop terrace, and camel trekking arranged on request.",
      "amenities": ["Breakfast Included", "Desert View", "Private Terrace", "Guided Tours", "Fan Cooling"],
      "images": [
        "https://images.unsplash.com/photo-1547234935-80c7145ec969"
      ],
      "host": {
        "name": "Youssef El Amrani",
        "isSuperhost": true,
        "joined": "2017"
      },
      "isFeatured": false
    },
    {
      "id": "prop_015",
      "title": "Modern Shinjuku Loft",
      "category": "Trending Cities",
      "location": {
        "city": "Tokyo",
        "state": "Tokyo",
        "country": "Japan",
        "lat": 35.6938,
        "lng": 139.7034
      },
      "pricePerNight": 195,
      "currency": "USD",
      "rating": 4.6,
      "reviewCount": 189,
      "maxGuests": 4,
      "bedrooms": 2,
      "bathrooms": 1,
      "description": "A sleek loft in the heart of Tokyo's neon skyline, steps from transit, dining, and nightlife, with floor-to-ceiling city views.",
      "amenities": ["WiFi", "City View", "Kitchen", "Air Conditioning", "Washer"],
      "images": [
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf"
      ],
      "host": {
        "name": "Kenji Sato",
        "isSuperhost": true,
        "joined": "2018"
      },
      "isFeatured": true
    },
    {
      "id": "prop_016",
      "title": "Historic Brownstone Flat",
      "category": "Trending Cities",
      "location": {
        "city": "New York",
        "state": "New York",
        "country": "United States",
        "lat": 40.7831,
        "lng": -73.9712
      },
      "pricePerNight": 275,
      "currency": "USD",
      "rating": 4.5,
      "reviewCount": 224,
      "maxGuests": 3,
      "bedrooms": 1,
      "bathrooms": 1,
      "description": "A classic Upper West Side brownstone apartment with original hardwood floors, exposed brick, and easy access to Central Park.",
      "amenities": ["WiFi", "Kitchen", "Washer", "Heating", "City View"],
      "images": [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
      ],
      "host": {
        "name": "Rachel Kim",
        "isSuperhost": false,
        "joined": "2021"
      },
      "isFeatured": false
    },
    {
      "id": "prop_017",
      "title": "Fjordside Timber Cabin",
      "category": "Cabin",
      "location": {
        "city": "Flam",
        "state": "Vestland",
        "country": "Norway",
        "lat": 60.8636,
        "lng": 7.1136
      },
      "pricePerNight": 260,
      "currency": "USD",
      "rating": 4.7,
      "reviewCount": 68,
      "maxGuests": 5,
      "bedrooms": 2,
      "bathrooms": 2,
      "description": "A dark-timber cabin perched above a still fjord, with a wood-fired sauna, private dock, and views of waterfalls cascading down granite cliffs.",
      "amenities": ["Sauna", "WiFi", "Fjord View", "Private Dock", "Kitchen", "Free Parking", "Fireplace"],
      "images": [
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1"
      ],
      "host": {
        "name": "Ingrid Haugen",
        "isSuperhost": true,
        "joined": "2017"
      },
      "isFeatured": true
    },
    {
      "id": "prop_018",
      "title": "Patagonian Wilderness Cabin",
      "category": "Cabin",
      "location": {
        "city": "El Chalten",
        "state": "Santa Cruz",
        "country": "Argentina",
        "lat": -49.3315,
        "lng": -72.8879
      },
      "pricePerNight": 155,
      "currency": "USD",
      "rating": 4.6,
      "reviewCount": 52,
      "maxGuests": 4,
      "bedrooms": 2,
      "bathrooms": 1,
      "description": "A remote cabin at the base of Mount Fitz Roy, built for trekkers, with a wood stove, drying room for gear, and unobstructed granite-peak views.",
      "amenities": ["Wood Stove", "Mountain View", "Kitchen", "Gear Storage", "WiFi"],
      "images": [
        "https://images.unsplash.com/photo-1518602164578-cd0074062767"
      ],
      "host": {
        "name": "Mateo Fernandez",
        "isSuperhost": false,
        "joined": "2020"
      },
      "isFeatured": false
    },
    {
      "id": "prop_019",
      "title": "Overwater Bungalow",
      "category": "Beachfront",
      "location": {
        "city": "Bora Bora",
        "state": "Society Islands",
        "country": "French Polynesia",
        "lat": -16.5004,
        "lng": -151.7415
      },
      "pricePerNight": 610,
      "currency": "USD",
      "rating": 4.9,
      "reviewCount": 39,
      "maxGuests": 2,
      "bedrooms": 1,
      "bathrooms": 1,
      "description": "A thatched-roof bungalow built directly over turquoise lagoon waters, with a glass floor panel, private ladder into the sea, and uninterrupted sunset views.",
      "amenities": ["Private Deck", "Glass Floor Panel", "WiFi", "Snorkel Gear", "Breakfast Included", "Lagoon View"],
      "images": [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5"
      ],
      "host": {
        "name": "Teiva Tetuanui",
        "isSuperhost": true,
        "joined": "2015"
      },
      "isFeatured": true
    },
    {
      "id": "prop_020",
      "title": "Amalfi Cliffside Villa",
      "category": "Beachfront",
      "location": {
        "city": "Positano",
        "state": "Campania",
        "country": "Italy",
        "lat": 40.6280,
        "lng": 14.4849
      },
      "pricePerNight": 480,
      "currency": "USD",
      "rating": 4.8,
      "reviewCount": 103,
      "maxGuests": 6,
      "bedrooms": 3,
      "bathrooms": 3,
      "description": "Terraced gardens lead down to a private beach cove beneath this pastel villa, with lemon trees, a sun terrace, and sweeping coastal views.",
      "amenities": ["Private Beach Access", "WiFi", "Sea View", "Garden", "Kitchen", "Air Conditioning"],
      "images": [
        "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca"
      ],
      "host": {
        "name": "Giulia Romano",
        "isSuperhost": true,
        "joined": "2016"
      },
      "isFeatured": true
    },
    {
      "id": "prop_021",
      "title": "Modernist Desert Mansion",
      "category": "Mansion",
      "location": {
        "city": "Palm Springs",
        "state": "California",
        "country": "United States",
        "lat": 33.8303,
        "lng": -116.5453
      },
      "pricePerNight": 975,
      "currency": "USD",
      "rating": 4.8,
      "reviewCount": 58,
      "maxGuests": 10,
      "bedrooms": 5,
      "bathrooms": 5,
      "description": "A mid-century modernist estate with walls of glass, a saltwater pool, and views of the surrounding mountains lit up at golden hour.",
      "amenities": ["Saltwater Pool", "Home Theater", "WiFi", "Gym", "Kitchen", "Mountain View", "Free Parking"],
      "images": [
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d"
      ],
      "host": {
        "name": "Adam Cohen",
        "isSuperhost": false,
        "joined": "2019"
      },
      "isFeatured": true
    },
    {
      "id": "prop_022",
      "title": "Lakefront Manor",
      "category": "Mansion",
      "location": {
        "city": "Lake Como",
        "state": "Lombardy",
        "country": "Italy",
        "lat": 45.9860,
        "lng": 9.2572
      },
      "pricePerNight": 1100,
      "currency": "USD",
      "rating": 4.9,
      "reviewCount": 33,
      "maxGuests": 12,
      "bedrooms": 6,
      "bathrooms": 6,
      "description": "A grand lakeside manor with formal gardens, a private boat dock, and frescoed interiors overlooking the still waters of Lake Como.",
      "amenities": ["Private Dock", "Garden", "WiFi", "Chef's Kitchen", "Lake View", "Free Parking"],
      "images": [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
      ],
      "host": {
        "name": "Alessandro Ferrari",
        "isSuperhost": true,
        "joined": "2014"
      },
      "isFeatured": false
    },
    {
      "id": "prop_023",
      "title": "Amazon Canopy Treehouse",
      "category": "Treehouse",
      "location": {
        "city": "Iquitos",
        "state": "Loreto",
        "country": "Peru",
        "lat": -3.7437,
        "lng": -73.2516
      },
      "pricePerNight": 140,
      "currency": "USD",
      "rating": 4.7,
      "reviewCount": 41,
      "maxGuests": 2,
      "bedrooms": 1,
      "bathrooms": 1,
      "description": "Built on stilts within the rainforest canopy, this treehouse offers howler-monkey wake-up calls, a mosquito-netted deck, and guided jungle walks.",
      "amenities": ["Guided Tours", "Jungle View", "Mosquito Netting", "Breakfast Included", "Fan Cooling"],
      "images": [
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e"
      ],
      "host": {
        "name": "Rosa Vasquez",
        "isSuperhost": true,
        "joined": "2018"
      },
      "isFeatured": false
    },
    {
      "id": "prop_024",
      "title": "Pacific Northwest Treehouse",
      "category": "Treehouse",
      "location": {
        "city": "Portland",
        "state": "Oregon",
        "country": "United States",
        "lat": 45.5152,
        "lng": -122.6784
      },
      "pricePerNight": 190,
      "currency": "USD",
      "rating": 4.6,
      "reviewCount": 87,
      "maxGuests": 2,
      "bedrooms": 1,
      "bathrooms": 1,
      "description": "A cedar-shingled treehouse among Douglas firs, with a wood stove, rope bridge entrance, and a soaking tub on the deck.",
      "amenities": ["Wood Stove", "Outdoor Bathtub", "WiFi", "Forest View", "Free Parking"],
      "images": [
        "https://images.unsplash.com/photo-1517824806704-9040b037703b"
      ],
      "host": {
        "name": "Noah Bennett",
        "isSuperhost": false,
        "joined": "2021"
      },
      "isFeatured": false
    },
    {
      "id": "prop_025",
      "title": "Andalusian Olive Farmhouse",
      "category": "Countryside",
      "location": {
        "city": "Ronda",
        "state": "Andalusia",
        "country": "Spain",
        "lat": 36.7461,
        "lng": -5.1671
      },
      "pricePerNight": 220,
      "currency": "USD",
      "rating": 4.7,
      "reviewCount": 76,
      "maxGuests": 7,
      "bedrooms": 4,
      "bathrooms": 3,
      "description": "A whitewashed finca surrounded by centuries-old olive groves, with a private pool, sun-baked terracotta terrace, and views toward the mountains.",
      "amenities": ["Private Pool", "WiFi", "Kitchen", "Free Parking", "Garden", "Countryside View"],
      "images": [
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994"
      ],
      "host": {
        "name": "Carmen Ruiz",
        "isSuperhost": true,
        "joined": "2017"
      },
      "isFeatured": false
    },
    {
      "id": "prop_026",
      "title": "New Zealand Sheep Station Cottage",
      "category": "Countryside",
      "location": {
        "city": "Queenstown",
        "state": "Otago",
        "country": "New Zealand",
        "lat": -45.0312,
        "lng": 168.6626
      },
      "pricePerNight": 175,
      "currency": "USD",
      "rating": 4.8,
      "reviewCount": 64,
      "maxGuests": 4,
      "bedrooms": 2,
      "bathrooms": 1,
      "description": "A working sheep station cottage set among rolling green hills, with a wraparound porch, wood stove, and dramatic Southern Alps backdrop.",
      "amenities": ["WiFi", "Wood Stove", "Mountain View", "Kitchen", "Free Parking", "Farm Tours"],
      "images": [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef"
      ],
      "host": {
        "name": "Liam Anderson",
        "isSuperhost": true,
        "joined": "2016"
      },
      "isFeatured": true
    },
    {
      "id": "prop_027",
      "title": "Atacama Stargazer Lodge",
      "category": "Desert",
      "location": {
        "city": "San Pedro de Atacama",
        "state": "Antofagasta",
        "country": "Chile",
        "lat": -22.9087,
        "lng": -68.1997
      },
      "pricePerNight": 245,
      "currency": "USD",
      "rating": 4.9,
      "reviewCount": 55,
      "maxGuests": 2,
      "bedrooms": 1,
      "bathrooms": 1,
      "description": "An adobe-style lodge in the driest desert on Earth, with a rooftop telescope deck, salt-flat views, and some of the clearest night skies anywhere.",
      "amenities": ["Telescope Deck", "Desert View", "Breakfast Included", "WiFi", "Guided Tours"],
      "images": [
        "https://images.unsplash.com/photo-1509316785289-025f5b846b35"
      ],
      "host": {
        "name": "Camila Soto",
        "isSuperhost": true,
        "joined": "2019"
      },
      "isFeatured": false
    },
    {
      "id": "prop_028",
      "title": "Wadi Rum Bubble Tent",
      "category": "Desert",
      "location": {
        "city": "Wadi Rum",
        "state": "Aqaba Governorate",
        "country": "Jordan",
        "lat": 29.5324,
        "lng": 35.4206
      },
      "pricePerNight": 195,
      "currency": "USD",
      "rating": 4.8,
      "reviewCount": 82,
      "maxGuests": 2,
      "bedrooms": 1,
      "bathrooms": 1,
      "description": "A transparent-domed tent set among towering red-rock formations, letting you fall asleep watching the stars over the desert valley.",
      "amenities": ["Transparent Dome", "Desert View", "Breakfast Included", "Heating", "Guided Tours"],
      "images": [
        "https://images.unsplash.com/photo-1548013146-72479768bada"
      ],
      "host": {
        "name": "Omar Hassan",
        "isSuperhost": true,
        "joined": "2018"
      },
      "isFeatured": true
    },
    {
      "id": "prop_029",
      "title": "Riverside Loft in Shibuya",
      "category": "Trending Cities",
      "location": {
        "city": "Tokyo",
        "state": "Tokyo",
        "country": "Japan",
        "lat": 35.6595,
        "lng": 139.7005
      },
      "pricePerNight": 165,
      "currency": "USD",
      "rating": 4.5,
      "reviewCount": 132,
      "maxGuests": 3,
      "bedrooms": 1,
      "bathrooms": 1,
      "description": "A compact, design-forward loft steps from Shibuya Crossing, with tatami sleeping nook, smart-home features, and easy access to the city's best ramen.",
      "amenities": ["WiFi", "City View", "Kitchenette", "Air Conditioning", "Smart TV"],
      "images": [
        "https://images.unsplash.com/photo-1503899036084-c55cdd92da26"
      ],
      "host": {
        "name": "Yuki Tanaka",
        "isSuperhost": false,
        "joined": "2022"
      },
      "isFeatured": false
    },
    {
      "id": "prop_030",
      "title": "Canal House in Jordaan",
      "category": "Trending Cities",
      "location": {
        "city": "Amsterdam",
        "state": "North Holland",
        "country": "Netherlands",
        "lat": 52.3738,
        "lng": 4.8823
      },
      "pricePerNight": 235,
      "currency": "USD",
      "rating": 4.7,
      "reviewCount": 158,
      "maxGuests": 4,
      "bedrooms": 2,
      "bathrooms": 1,
      "description": "A narrow 17th-century canal house with steep stairs, exposed beams, and a front window overlooking one of Amsterdam's prettiest waterways.",
      "amenities": ["WiFi", "Canal View", "Kitchen", "Bicycles Provided", "Heating"],
      "images": [
        "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4"
      ],
      "host": {
        "name": "Sanne de Vries",
        "isSuperhost": true,
        "joined": "2017"
      },
    }
  ]
};

const outputDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'images', 'listings');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function downloadImage(url, dest) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        resolve(false);
      }
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function seedData() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/staynest';
    console.log(`Connecting to MongoDB: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected!');

    // Clear existing data
    console.log('Clearing existing database collections (Users, Listings, Bookings)...');
    await User.deleteMany({});
    await Listing.deleteMany({});
    await Booking.deleteMany({});
    console.log('Database cleared!');

    // Default avatars pool
    const hostAvatars = [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150'
    ];

    const hostMap = {};

    console.log('Downloading property images and creating listings...');
    const createdListings = [];

    for (const prop of inputData.properties) {
      console.log(`Processing property: ${prop.title} (${prop.id})`);

      // 1. Manage Host User
      let hostId;
      const hostName = prop.host.name;
      if (hostMap[hostName]) {
        hostId = hostMap[hostName];
      } else {
        const slug = hostName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const email = `${slug}@staynest.com`;
        const avatarIdx = Object.keys(hostMap).length % hostAvatars.length;
        
        const hostUser = new User({
          name: hostName,
          email,
          password: 'password123',
          avatar: hostAvatars[avatarIdx],
          role: 'Owner'
        });
        
        await hostUser.save();
        hostId = hostUser._id;
        hostMap[hostName] = hostId;
      }

      // 2. Manage Listing Images
      const localImagePaths = [];
      for (let i = 0; i < prop.images.length; i++) {
        const remoteUrl = prop.images[i];
        const filename = `${prop.id}_${i + 1}.jpg`;
        const destPath = path.join(outputDir, filename);
        
        console.log(`  Downloading image ${i + 1}/${prop.images.length} from Unsplash...`);
        const success = await downloadImage(remoteUrl, destPath);
        
        if (success) {
          localImagePaths.push(`/images/listings/${filename}`);
        } else {
          console.warn(`  Failed to download ${remoteUrl}. Using fallback category image.`);
          // Fallback based on category
          const fallbacks = {
            Cabin: '/images/listings/Cabin_1.jpg',
            Beachfront: '/images/listings/Beachfront_1.jpg',
            Mansion: '/images/listings/Mansion_1.jpg',
            Treehouse: '/images/listings/Treehouse_1.jpg',
            Countryside: '/images/listings/Countryside_1.jpg',
            Desert: '/images/listings/Desert_1.jpg',
            Urban: '/images/listings/Urban_1.jpg'
          };
          const catName = prop.category === 'Trending Cities' ? 'Urban' : prop.category;
          localImagePaths.push(fallbacks[catName] || '/images/listings/Cabin_1.jpg');
        }
      }

      // 3. Build Listing Schema Document
      // Map Trending Cities -> Urban for DB enum matching
      const dbCategory = prop.category === 'Trending Cities' ? 'Urban' : prop.category;
      
      // Handle Location String format "City, State"
      let locationString = prop.location.city;
      if (prop.location.state) {
        locationString += `, ${prop.location.state}`;
      }

      const newListing = new Listing({
        title: prop.title,
        description: prop.description,
        images: localImagePaths,
        price: prop.pricePerNight,
        location: locationString,
        country: prop.location.country,
        category: dbCategory,
        facilities: prop.amenities,
        host: hostId,
        lat: prop.location.lat || 0,
        lng: prop.location.lng || 0,
        averageRating: prop.rating || 0,
        reviewCount: prop.reviewCount || 0
      });

      await newListing.save();
      createdListings.push(newListing);
    }

    console.log(`Successfully seeded ${createdListings.length} properties!`);
    mongoose.connection.close();
    console.log('Seeding script finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`Error during properties seeding: ${error.message}`);
    process.exit(1);
  }
}

seedData();
