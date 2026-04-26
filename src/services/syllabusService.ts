import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, onSnapshot, setDoc } from 'firebase/firestore';

export interface Chapter {
  name: string;
  isCompleted: boolean;
}

export interface Section {
  section_name: string;
  chapters: string[];
}

export interface SyllabusSubject {
  id: string;
  subject: string;
  sections: Section[];
}

// User progress state
export interface UserSyllabusProgress {
  completedChapters: string[]; // List of chapter names (or unique IDs)
}

export const syllabusService = {
  // Since we can't seed the DB easily right now, we'll use this static data
  // but the code is ready to fetch from Firestore once data is there.
  getGlobalSyllabus: async (): Promise<SyllabusSubject[]> => {
    // Attempt to fetch from DB first
    // For now, returning the provided data as a fallback
    return [
      {
        "id": "reasoning",
        "subject": "General Intelligence and Reasoning",
        "sections": [
          {
            "section_name": "Verbal Reasoning",
            "chapters": [
              "Analogy (Semantic, Symbolic/Number, Word)",
              "Classification / Odd One Out",
              "Series (Number, Alphabet, Mixed)",
              "Coding and Decoding",
              "Blood Relations",
              "Direction and Distance",
              "Alphabet Test and Word Formation",
              "Venn Diagrams",
              "Dictionary Order / Logical Sequence of Words"
            ]
          },
          {
            "section_name": "Logical and Analytical Reasoning",
            "chapters": [
              "Syllogism",
              "Statement and Conclusions",
              "Statement and Assumptions",
              "Seating Arrangement (Linear and Circular)",
              "Order and Ranking",
              "Missing Number / Inserting Missing Characters",
              "Mathematical Operations / Symbol Substitution",
              "Clock and Calendar",
              "Problem Solving and Decision Making"
            ]
          },
          {
            "section_name": "Non-Verbal (Visual) Reasoning",
            "chapters": [
              "Series (Figural)",
              "Analogy (Figural)",
              "Classification (Figural)",
              "Mirror and Water Images",
              "Paper Folding and Cutting (Punched Hole)",
              "Embedded Figures",
              "Completion of Figure Pattern",
              "Counting of Figures (Triangles, Squares, etc.)",
              "Space Visualization and Spatial Orientation",
              "Dice and Cubes"
            ]
          }
        ]
      },
      {
        "id": "quant",
        "subject": "Mathematics (Quantitative Aptitude)",
        "sections": [
          {
            "section_name": "Number System and Simplification",
            "chapters": [
              "Whole Numbers",
              "Number System",
              "Fractions and Decimals",
              "Simplification (BODMAS)",
              "Square Roots and Cube Roots",
              "Elementary Surds and Indices",
              "HCF and LCM"
            ]
          },
          {
            "section_name": "Arithmetic",
            "chapters": [
              "Percentage",
              "Ratio and Proportion",
              "Averages",
              "Simple Interest",
              "Compound Interest",
              "Profit, Loss, and Discount",
              "Partnership Business",
              "Mixture and Alligation",
              "Time and Work",
              "Pipes and Cisterns",
              "Speed, Time, and Distance",
              "Problems on Trains",
              "Boats and Streams",
              "Problems on Ages"
            ]
          },
          {
            "section_name": "Algebra",
            "chapters": [
              "Basic Algebraic Identities of School Algebra",
              "Linear Equations",
              "Graphs of Linear Equations",
              "Quadratic Equations"
            ]
          },
          {
            "section_name": "Geometry",
            "chapters": [
              "Lines and Angles",
              "Triangles",
              "Congruence and Similarity of Triangles",
              "Centres of a Triangle (Incentre, Circumcentre, Orthocentre, Centroid)",
              "Circles (Chords, Tangents, Angles Subtended)",
              "Common Tangents to Two or More Circles",
              "Quadrilaterals",
              "Regular Polygons"
            ]
          },
          {
            "section_name": "Mensuration",
            "chapters": [
              "Area and Perimeter of 2D Figures (Triangles, Circles, Quadrilaterals)",
              "Right Prism",
              "Right Circular Cone",
              "Right Circular Cylinder",
              "Sphere and Hemispheres",
              "Rectangular Parallelepiped",
              "Regular Right Pyramid with Triangular or Square Base"
            ]
          },
          {
            "section_name": "Trigonometry",
            "chapters": [
              "Trigonometric Ratios",
              "Degree and Radian Measures",
              "Standard Trigonometric Identities",
              "Complementary Angles",
              "Heights and Distances"
            ]
          },
          {
            "section_name": "Data Interpretation and Statistics",
            "chapters": [
              "Bar Diagram",
              "Pie Chart",
              "Histogram",
              "Frequency Polygon",
              "Tabular Data Interpretation",
              "Line Chart"
            ]
          }
        ]
      },
      {
        "id": "english",
        "subject": "English Comprehension",
        "sections": [
          {
            "section_name": "Grammar",
            "chapters": [
              "Spotting Errors",
              "Fill in the Blanks",
              "Active and Passive Voice",
              "Direct and Indirect Speech",
              "Sentence Improvement / Correction",
              "Subject-Verb Agreement",
              "Tenses, Nouns, and Pronouns",
              "Articles, Prepositions, and Conjunctions"
            ]
          },
          {
            "section_name": "Vocabulary",
            "chapters": [
              "Synonyms",
              "Antonyms",
              "Idioms and Phrases",
              "One Word Substitution",
              "Spelling / Detecting Mis-spelt Words"
            ]
          },
          {
            "section_name": "Reading Comprehension and Verbal Ability",
            "chapters": [
              "Reading Comprehension (Passages)",
              "Cloze Test",
              "Para Jumbles / Shuffling of Sentence Parts",
              "Sentence Rearrangement"
            ]
          }
        ]
      },
      {
        "id": "science",
        "subject": "General Science",
        "sections": [
          {
            "section_name": "Physics",
            "chapters": [
              "Units, Dimensions, and Measurements",
              "Kinematics and Laws of Motion",
              "Work, Energy, and Power",
              "Gravitation and Planetary Motion",
              "Properties of Matter (Elasticity, Surface Tension, Viscosity)",
              "Heat and Thermodynamics",
              "Oscillations and Waves",
              "Sound",
              "Light and Optics (Mirrors, Lenses, Prisms)",
              "Electricity and Magnetism",
              "Modern Physics (Atomic Models, Radioactivity)",
              "Important Inventions and Discoveries"
            ]
          },
          {
            "section_name": "Chemistry",
            "chapters": [
              "Nature and Composition of Matter",
              "Atomic Structure",
              "Radioactivity and Nuclear Chemistry",
              "Chemical Bonding",
              "Acids, Bases, and Salts",
              "Periodic Classification of Elements",
              "Metals, Non-Metals, and Metallurgy",
              "Chemical Reactions and Equations",
              "Carbon and Its Compounds (Organic Chemistry Basics)",
              "Solutions and Colloids",
              "Environmental Chemistry",
              "Chemistry in Everyday Life (Drugs, Polymers, Fertilizers)"
            ]
          },
          {
            "section_name": "Biology",
            "chapters": [
              "Cell Biology (Structure and Functions)",
              "Tissues (Plant and Animal)",
              "Classification of Organisms (Five Kingdom Classification)",
              "Human Anatomy and Physiology (Digestive, Respiratory, Circulatory Systems)",
              "Human Anatomy and Physiology (Nervous, Endocrine, Excretory, Reproductive Systems)",
              "Nutrition, Vitamins, and Minerals",
              "Human Diseases, Pathogens, and Cures",
              "Plant Morphology and Physiology (Photosynthesis, Respiration)",
              "Genetics and Evolution",
              "Ecology and Environment",
              "Economic Zoology and Botany"
            ]
          }
        ]
      }
    ];
  },

  subscribeToProgress: (userId: string, callback: (progress: UserSyllabusProgress) => void) => {
    const progressRef = doc(db, 'users', userId, 'config', 'syllabus_progress');
    return onSnapshot(progressRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as UserSyllabusProgress);
      } else {
        callback({ completedChapters: [] });
      }
    });
  },

  toggleChapter: async (userId: string, chapterName: string, currentProgress: string[]) => {
    const progressRef = doc(db, 'users', userId, 'config', 'syllabus_progress');
    const isCompleted = currentProgress.includes(chapterName);
    const newProgress = isCompleted 
      ? currentProgress.filter(c => c !== chapterName)
      : [...currentProgress, chapterName];
    
    await setDoc(progressRef, { completedChapters: newProgress }, { merge: true });
  }
};
