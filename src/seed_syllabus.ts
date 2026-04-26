import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || '(default)');

const SYLLABUS_DATA = [
  {
    "id": "reasoning",
    "exam": "SSC CPO",
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
    "exam": "SSC CPO",
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
  }
];

async function seed() {
  console.log('Seeding syllabus data...');
  for (const subject of SYLLABUS_DATA) {
    await setDoc(doc(db, 'syllabus', subject.id), subject);
    console.log(`Seeded ${subject.subject}`);
  }
  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
