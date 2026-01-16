// frontend/src/data/SponsorsData.js

const featuredTiers = [
    "Victory Lane Partner",
    "Pole Position Partner",
    "Green Flag Partner",
    "Pre-Race Tech Partner",
];

const featuredSponsors = SponsorsData.filter(s =>
    featuredTiers.includes(s.tier)
);

const seriesSponsors = SponsorsData.filter(
    s => s.tier === "Series Partner"
);

const SponsorsData = [
    // 🏆 Tier Partners
    {
        id: 1,
        name: "Fayetteville Heating and Air",
        tier: "Victory Lane Partner",
        logoUrl: "/sponsors/fayetteville-heating-air.png",
        website: "",
    },
    {
        id: 2,
        name: "Eco Advantage Termite and Pest Solutions",
        tier: "Pole Position Partner",
        logoUrl: "/sponsors/eco-advantage.png",
        website: "",
    },
    {
        id: 3,
        name: "Culbertson Electric",
        tier: "Green Flag Partner",
        logoUrl: "/sponsors/culbertson-electric.png",
        website: "",
    },
    {
        id: 4,
        name: "Simpson Race Products",
        tier: "Pre-Race Tech Partner",
        logoUrl: "/sponsors/simpson-race-products.png",
        website: "https://www.simpsonraceproducts.com",
    },

    // ⭐ Series Partners
    {
        id: 5,
        name: "Gen3 Performance Imaging",
        tier: "Series Partner",
        logoUrl: "/sponsors/gen3-performance-imaging.png",
        website: "",
    },
    {
        id: 6,
        name: "Cashwell Home Services",
        tier: "Series Partner",
        logoUrl: "/sponsors/cashwell-home-services.png",
        website: "",
    },
    {
        id: 7,
        name: "Clear Cut Landscaping",
        tier: "Series Partner",
        logoUrl: "/sponsors/clear-cut-landscaping.png",
        website: "",
    },
    {
        id: 8,
        name: "Red Line Tire and Auto",
        tier: "Series Partner",
        logoUrl: "/sponsors/red-line-tire-auto.png",
        website: "",
    },
    {
        id: 9,
        name: "Brownie's Towing",
        tier: "Series Partner",
        logoUrl: "/sponsors/brownies-towing.png",
        website: "",
    },
    {
        id: 10,
        name: "Fast Lane Towing",
        tier: "Series Partner",
        logoUrl: "/sponsors/fast-lane-towing.png",
        website: "",
    },
    {
        id: 11,
        name: "Quality Towing",
        tier: "Series Partner",
        logoUrl: "/sponsors/quality-towing.png",
        website: "",
    },
    {
        id: 12,
        name: "Old South Apparel",
        tier: "Series Partner",
        logoUrl: "/sponsors/old-south-apparel.png",
        website: "",
    },
    {
        id: 13,
        name: "Wisler Designs",
        tier: "Series Partner",
        logoUrl: "/sponsors/wisler-designs.png",
        website: "",
    },
    {
        id: 14,
        name: "Bubba's 33",
        tier: "Series Partner",
        logoUrl: "/sponsors/bubbas-33.png",
        website: "https://www.bubbas33.com",
    },
    {
        id: 15,
        name: "Five Star Entertainment",
        tier: "Series Partner",
        logoUrl: "/sponsors/five-star-entertainment.png",
        website: "",
    },
    {
        id: 16,
        name: "Paradise Acres",
        tier: "Series Partner",
        logoUrl: "/sponsors/paradise-acres.png",
        website: "",
    },
    {
        id: 17,
        name: "Raging Rooster Catering",
        tier: "Series Partner",
        logoUrl: "/sponsors/raging-rooster-catering.png",
        website: "",
    },
    {
        id: 18,
        name: "Sports Action TV",
        tier: "Series Partner",
        logoUrl: "/sponsors/sports-action-tv.png",
        website: "",
    },
    {
        id: 19,
        name: "Big T’s",
        tier: "Series Partner",
        logoUrl: "/sponsors/big-ts.png",
        website: "",
    },
    {
        id: 20,
        name: "Hollern Haunts Hayride",
        tier: "Series Partner",
        logoUrl: "/sponsors/hollern-haunts.png",
        website: "",
    },
    {
        id: 21,
        name: "VP Racing Fuels",
        tier: "Series Partner",
        logoUrl: "/sponsors/vp-racing-fuels.png",
        website: "https://vpracingfuels.com",
    },
    {
        id: 22,
        name: "Jim Lewis Designs",
        tier: "Series Partner",
        logoUrl: "/sponsors/jim-lewis-designs.png",
        website: "",
    },
    {
        id: 23,
        name: "Idol 34 Motorsports",
        tier: "Series Partner",
        logoUrl: "/sponsors/idol-34-motorsports.png",
        website: "",
    },
    {
        id: 24,
        name: "ABW Property Professionals",
        tier: "Series Partner",
        logoUrl: "/sponsors/abw-property-professionals.png",
        website: "",
    },
    {
        id: 25,
        name: "Leviner’s Landscaping",
        tier: "Series Partner",
        logoUrl: "/sponsors/leviners-landscaping.png",
        website: "",
    },
    {
        id: 26,
        name: "Express Employment Professionals",
        tier: "Series Partner",
        logoUrl: "/sponsors/express-employment.png",
        website: "https://www.expresspros.com",
    },
    {
        id: 27,
        name: "Diamond Constructors",
        tier: "Series Partner",
        logoUrl: "/sponsors/diamond-constructors.png",
        website: "",
    },
    {
        id: 28,
        name: "Cuppa Yo",
        tier: "Series Partner",
        logoUrl: "/sponsors/cuppa-yo.png",
        website: "",
    },
];

export default SponsorsData;