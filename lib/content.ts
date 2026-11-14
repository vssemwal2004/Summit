/**
 * Single source of editable content.
 * Anything wrapped in [square brackets] is a placeholder that MUST be replaced
 * with verified information before going live.
 */

export const brand = {
  name: "The Summit",
  by: "By Vinayak Realty",
  city: "Prayagraj",
  website: "thesummitbyvinaayak.com",
};

export const nav = [
  { label: "Residences", href: "#residences" },
  { label: "Commercial", href: "#commercial" },
  { label: "Architecture", href: "#architecture" },
  { label: "Amenities", href: "#amenities" },
  { label: "Gallery", href: "#gallery" },
];

export const contact = {
  office: "Vinayak Group, Prayagraj",
  phone: "[Verified phone number]",
  email: "[Verified email address]",
  address: "[Verified office address]",
};

export const legal = {
  rera: "[RERA registration number — to be added once issued]",
  disclaimer:
    "The 3D model and illustrations of the building are conceptual and do not depict the approved design. Photographs show the city of Prayagraj or material moods for atmosphere only and are not of the project, its site or its specifications. They do not represent the final project. Specifications, amenities and layouts are proposed and subject to approvals and design development. This website does not constitute an offer or contract.",
};

export const location = {
  /** Opens a search for the city only — replace with the exact site pin once verified. */
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Prayagraj",
  highlights: [
    "[Verified nearby landmark]",
    "[Verified connectivity — road / rail]",
    "[Verified connectivity — airport]",
    "[Verified social infrastructure]",
  ],
};

/**
 * Imagery policy — only REAL photographs, used honestly:
 *  - City photos show Prayagraj itself (not the project site, not The Summit).
 *  - "Material mood" photos show finishes for atmosphere only — NOT specifications.
 *  - The building itself appears only as the labelled 3D concept model.
 * All photos are from Wikimedia Commons under the licence shown; credits render on screen and in the footer.
 * Replace with the client's own photography / official renders when available (keep `credit` accurate or remove it).
 */
export type Credit = { author: string; licence: string; url: string };
export type Photo = { src?: string; alt: string; label?: string; credit?: Credit };

const P = "/images/photos/";
const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${file}`;

export const credits = {
  yamunaBridge: { author: "Iamaamirkhan786", licence: "CC BY-SA 4.0", url: commons("New_Yamuna_Bridge_at_Dawn.jpg") },
  sangamGolden: { author: "Clickmaster21", licence: "CC BY 4.0", url: commons("The_Golden_Hour_at_Sangam_Ghat_Prayagraj.jpg") },
  university: { author: "Rangan Datta Wiki", licence: "CC BY-SA 4.0", url: commons("Allahabad_University_1.jpg") },
  yamunaBirds: { author: "lensnmatter", licence: "CC BY 2.0", url: commons("...yamuna_ji!_(32382324577).jpg") },
  sangamBoats: { author: "Vishalbhatia93", licence: "CC BY-SA 4.0", url: commons("Sunset_at_Sangam.jpg") },
  cathedral: { author: "ptwo", licence: "CC BY 2.0", url: commons("All_Saints_Cathedral,_Allahabad_in_the_night.jpg") },
  sangamGulls: { author: "Sanskritidubey", licence: "CC BY 4.0", url: commons("Migratory_gulls_feeding_at_Triveni_Sangam,_Prayagraj,_India,_at_sunset.jpg") },
  flutedGlass: { author: "Neoclassicism Enthusiast", licence: "CC BY-SA 4.0", url: commons("Fluted_shower_glass_wall_in_20_Strada_Icoanei,_Bucharest_(05).jpg") },
  marble: { author: "Thomas Quine", licence: "CC BY 2.0", url: commons("Texture_of_black_and_white_rippled_marble_6_(41512824290).jpg") },
  stone: { author: "Peter Dowley", licence: "CC BY 2.0", url: commons("Marble_grain_(7272808124).jpg") },
  walnut: { author: "Martin Lorenz", licence: "CC BY-SA 3.0", url: commons("Oberfl%C3%A4che_Wohnzimmertisch.JPG") },
  brass: { author: "NASA / Smithsonian Institution", licence: "CC0", url: commons("Brushed_brass_paint_(Apollo_11)_interior.png") },
} satisfies Record<string, Credit>;

const MOOD = "Material mood · not a specification";

export const images: Record<string, Photo> = {
  hero: { alt: "Conceptual 3D model of The Summit at night" },
  intro: { src: `${P}yamuna-bridge-dawn.jpg`, alt: "Long-exposure photograph of the New Yamuna Bridge, Prayagraj, at dawn", label: "New Yamuna Bridge, Prayagraj", credit: credits.yamunaBridge },
  section: { alt: "Conceptual section showing commercial base and residential floors" },
  retail: { src: `${P}mood-fluted-glass.jpg`, alt: "Close-up of fluted glass in a slim metal frame", label: MOOD, credit: credits.flutedGlass },
  dining: { src: `${P}mood-marble.jpg`, alt: "Close-up of dark marble with pale veining", label: MOOD, credit: credits.marble },
  office: { src: `${P}mood-stone.jpg`, alt: "Speckled stone cladding panels in raking light", label: MOOD, credit: credits.stone },
  interior: { src: `${P}mood-walnut.jpg`, alt: "Close-up of a polished walnut surface", label: MOOD, credit: credits.walnut },
  skyline: { src: `${P}sangam-golden-hour.jpg`, alt: "Sunset over the water at Sangam Ghat, Prayagraj", label: "Sangam Ghat at golden hour, Prayagraj", credit: credits.sangamGolden },
  lobby: { src: `${P}mood-brass.jpg`, alt: "Brushed brass surface", label: MOOD, credit: credits.brass },
  night: { src: `${P}university-blue-hour.jpg`, alt: "University of Allahabad main building lit at blue hour", label: "University of Allahabad, Prayagraj", credit: credits.university },
};

export const commercialHighlights = [
  "Luxury Retail Spaces",
  "Fine Dining Possibilities",
  "Premium Business Environments",
  "Contemporary Commercial Design",
];

export const residenceHighlights = [
  "Refined Living Spaces",
  "Privacy & Exclusivity",
  "Contemporary Comfort",
  "Elevated City Perspectives",
];

export const amenities = [
  { title: "Grand Arrival Experience", note: "A considered sense of arrival from street to lobby." },
  { title: "Elegant Lobby Spaces", note: "Double-height volumes with refined finishes." },
  { title: "High-Speed Vertical Connectivity", note: "Planned lift cores for residents and visitors." },
  { title: "Thoughtfully Planned Security", note: "Layered access envisioned for privacy." },
  { title: "Convenient Parking", note: "Dedicated parking provisions under planning." },
  { title: "Landscaped Environments", note: "Green pockets softening the architecture." },
  { title: "Wellness & Leisure Spaces", note: "Spaces envisioned for fitness and calm." },
  { title: "Exclusive Lifestyle Amenities", note: "Curated resident experiences under study." },
];

/**
 * Developer track record — taken from the project listing on vinayakgroup.org.in (Nov 2026).
 * These are OTHER Vinayak developments, never shown as The Summit.
 * `image` is set only where the site's photo is an actual building photo (flyers/floor plans omitted).
 * Verify names and categories with the client before launch (e.g. "Le Garnde" spelling is as listed on their site).
 */
export type LegacyProject = { name: string; category: "Residential" | "Commercial"; image?: string };

const L = "/images/legacy/";
export const legacy: LegacyProject[] = [
  { name: "Vinayak Aashirwad", category: "Commercial", image: `${L}vinayak-aashirwad.jpg` },
  { name: "Shree Krishna Nilayam", category: "Residential", image: `${L}shree-krishna-nilayam.jpg` },
  { name: "Vinayak S.S Sai Darshan Apartment", category: "Residential", image: `${L}vinayak-s-s-sai-darshan-apartment.jpg` },
  { name: "Vinayak Mayank Mangus", category: "Commercial", image: `${L}vinayak-mayank-mangus.jpg` },
  { name: "Vinayak Lata Kunj", category: "Residential", image: `${L}vinayak-lata-kunj.jpg` },
  { name: "Vinayak Vrindavan Tower", category: "Commercial", image: `${L}vinayak-vrindavan-tower.jpg` },
  { name: "Park View — The Park @33", category: "Residential", image: `${L}park-view-the-park-33.jpg` },
  { name: "Vinayak Triveni Tower", category: "Commercial", image: `${L}vinayak-triveni-tower.jpg` },
  { name: "Vinayak Central Park @ Sherwani Legacy", category: "Residential", image: `${L}vinayak-central-park-sherwani-legacy.jpg` },
  { name: "Vinayak City Square", category: "Commercial", image: `${L}vinayak-city-square.jpg` },
  { name: "Vinayak Mayo Residency", category: "Residential", image: `${L}vinayak-mayo-residency.jpg` },
  { name: "Vinayak Solitair", category: "Commercial", image: `${L}vinayak-solitair.jpg` },
  { name: "Lotus Apartment", category: "Residential", image: `${L}lotus-apartment.jpg` },
  { name: "Vinayak City Centre", category: "Commercial", image: `${L}vinayak-city-centre.jpg` },
  { name: "Vinayak Tower", category: "Commercial", image: `${L}vinayak-tower.jpg` },
  { name: "Vinayak Complex", category: "Commercial", image: `${L}vinayak-complex.jpg` },
  { name: "Vinayak Enclave", category: "Residential" },
  { name: "Vinayak Vrindavan Vihar", category: "Commercial" },
  { name: "Gitanjali Shri Niketan", category: "Residential" },
  { name: "Sidheshwari Apartment", category: "Residential" },
  { name: "Vinayak Le Garnde", category: "Residential" },
  { name: "Ganpati Tower", category: "Commercial" },
];

/** Gallery: real photographs of Prayagraj (the city — not the project). Swap for official renders/site photos later. */
export const galleryCopy = { eyebrow: "The city we build in", title: "Prayagraj,", em: "in its own light." };

export type GalleryItem = {
  title: string;
  caption: string;
  image?: string;
  video?: string;
  alt: string;
  credit?: Credit;
};

export const gallery: GalleryItem[] = [
  { title: "The Yamuna at dusk", caption: "Evening flight over the river.", image: `${P}yamuna-birds-dusk.jpg`, alt: "Flocks of birds over the Yamuna at dusk", credit: credits.yamunaBirds },
  { title: "All Saints Cathedral", caption: "Gothic revival, lit after dark.", image: `${P}cathedral-night.jpg`, alt: "All Saints Cathedral, Prayagraj, illuminated at night", credit: credits.cathedral },
  { title: "Winter at the Sangam", caption: "Migratory gulls at the Triveni Sangam.", image: `${P}sangam-gulls-sunset.jpg`, alt: "Gulls feeding over the water at Triveni Sangam at sunset", credit: credits.sangamGulls },
  { title: "Boats at the confluence", caption: "Sunset over the Sangam.", image: `${P}sangam-sunset-boats.jpg`, alt: "Moored boats at the Sangam at sunset", credit: credits.sangamBoats },
  { title: "New Yamuna Bridge", caption: "The city's modern landmark at dawn.", image: `${P}yamuna-bridge-dawn.jpg`, alt: images.intro.alt, credit: credits.yamunaBridge },
];
