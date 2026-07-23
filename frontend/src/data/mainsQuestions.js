// UPSC CSE Mains descriptive questions database
// Categorized by paper type: Essay, GS I, GS II, GS III, GS IV, English

const ESSAY_TOPICS = [
  {
    q: "Write an essay on: 'The path to happiness lies in the simplification of desires, not their expansion.' (Answer in 1000-1200 words, 125 marks)",
    explanation: "Model Essay Outline:\n- Introduction: Define happiness and desires. Quote thinkers (e.g., Buddha, Socrates).\n- Thesis: Expansion of desires leads to consumerism, stress, and ecological crisis. Simplification brings contentment.\n- Context: Indian traditions of Santoshi (contentment) and simple living.\n- Modern Dilemma: Advertising, social media, and comparison culture fostering artificial desires.\n- Sustainability: Need for sustainable lifestyle (e.g., LiFE movement).\n- Counter-argument: Aspiration and desire drive progress, innovation, and economic growth.\n- Synthesis: A balance between material aspirations and spiritual/mental simplification (Nishkama Karma).\n- Conclusion: Inner peace is the ultimate metric of human development."
  },
  {
    q: "Write an essay on: 'Digital economy as a catalyst for inclusive growth and gender parity in rural India.' (Answer in 1000-1200 words, 125 marks)",
    explanation: "Model Essay Outline:\n- Introduction: Introduce digital revolution in India (UPI, Jan Dhan-Aadhaar-Mobile trinity).\n- Core Body:\n  - Financial inclusion of rural women via digital banking.\n  - E-commerce and Self-Help Groups (SHGs) reaching global markets.\n  - Access to online education (SWAYAM) and telemedicine (eSanjeevani) in remote areas.\n- Challenges: Digital divide (internet access gaps), digital illiteracy, and cyber fraud risks.\n- Policy Solutions: Digital Saksharta Abhiyan (PMGDISHA) and village fiber connectivity (BharatNet).\n- Conclusion: Digital economy is not just a technological tool but a democratic leveling agent."
  },
  {
    q: "Write an essay on: 'Science is a beautiful gift to humanity, we should not distort it.' (Answer in 1000-1200 words, 125 marks)",
    explanation: "Model Essay Outline:\n- Introduction: Quote APJ Abdul Kalam. Define science as a search for truth and utility.\n- The Gift: Advancements in medicine, energy, space exploration, and agricultural yields (Green Revolution).\n- The Distortion: Nuclear warfare, biological weapons, invasive surveillance, and climate degradation.\n- Ethical Dimension: The necessity of combining scientific progress with moral philosophy (Ethics in AI, genetic editing).\n- Conclusion: Science must serve humanity with compassion and environmental responsibility."
  },
  {
    q: "Write an essay on: 'Forests are the best case studies for economic excellence.' (Answer in 1000-1200 words, 125 marks)",
    explanation: "Model Essay Outline:\n- Introduction: Define forest ecosystems as models of sustainability, recycling, and resource management.\n- Ecosystem Economy: Zero waste, perfect circular economy, and mutual symbiosis (mycorrhizal networks).\n- Lessons for Businesses: Resilience, diversity over monoculture, and long-term value creation over short-term exploitation.\n- Circular Economy: Shifting industrial systems from linear (make-use-dispose) to circular (biodegradable, recycled).\n- Conclusion: Economic growth must emulate ecological principles to survive."
  },
  {
    q: "Write an essay on: 'History is a series of victories won by the scientific man over the romantic man.' (Answer in 1000-1200 words, 125 marks)",
    explanation: "Model Essay Outline:\n- Introduction: Contrast the scientific man (empirical, logical, factual) with the romantic man (emotional, traditional, idealistic).\n- Historical Battles: Galileo vs. Inquisition, Industrial Revolution vs. Luddites, modern medicine vs. superstitions.\n- The Value of Romance: Art, culture, nationalism, and human rights are driven by romanticism, which gives purpose to scientific power.\n- Synthesis: Scientific methodology must drive progress, but romantic ideals must guide its ethical direction.\n- Conclusion: A civilization needs the scientific man to build the means, and the romantic man to appreciate the ends."
  }
];

const GS1_QUESTIONS = [
  {
    q: "Evaluate the role of the Bhakti movement in fostering social integration and linguistic growth in medieval India. (Answer in 150 words, 10 marks)",
    explanation: "Key Points:\n- Social Integration: Opposed caste discrimination and rigid rituals. Emphasized devotion (Bhakti) open to all, including women and lower castes (e.g., Kabir, Ravidas).\n- Linguistic Growth: Promoted regional languages (Vernaculars) instead of Sanskrit. Tulsidas wrote in Awadhi, Meerabai in Rajasthani, and Jnaneshwar in Marathi, enriching vernacular literature.\n- Conclusion: Bhakti movement democratized spirituality and laid the foundation for modern regional identities."
  },
  {
    q: "Assess the vulnerability of major Indian coastal cities to climate-induced sea-level rise and suggest mitigation strategies. (Answer in 250 words, 15 marks)",
    explanation: "Key Points:\n- Vulnerability: India has a 7,500+ km coastline. Cities like Mumbai, Chennai, and Kolkata face rising sea levels, frequent cyclones, and storm surges. Flooding causes infrastructure damage, saline intrusion in aquifers, and displaces fishing communities.\n- Mitigation Strategies:\n  - Coastal Regulation Zone (CRZ) enforcement.\n  - Mangrove restoration (bioshields).\n  - Sponge city concepts (permeable pavements, urban wetlands).\n  - Integrated Coastal Zone Management (ICZM) plans.\n- Conclusion: Adaptation must be integrated into city masterplans to protect economic hubs."
  },
  {
    q: "How has the rise of nuclear families in urban India impacted the social security and care of the elderly? (Answer in 150 words, 10 marks)",
    explanation: "Key Points:\n- Impact: Transition from joint to nuclear families due to migration, career demands, and individualism.\n- Positive: Financial independence for some elderly, peace in reduced household conflicts.\n- Negative: Lack of physical care, social isolation, depression, vulnerability to abuse, and high medical expenses without family support.\n- Government Initiatives: Maintenance and Welfare of Parents and Senior Citizens Act, Atal Vayo Abhyuday Yojana.\n- Conclusion: Need for community-led day-care centers and elder-friendly infrastructure."
  },
  {
    q: "Explain the features of the Gandhara school of art and how it differed from the Mathura school. (Answer in 250 words, 15 marks)",
    explanation: "Key Points:\n- Gandhara School: Indo-Greek influence (Greco-Buddhist). Used bluish-grey schist stone. Buddha depicted with Greek features (curly hair, muscular body, drapery reminiscent of Roman togas). High attention to anatomical accuracy.\n- Mathura School: Indigenous development. Used red sandstone. Buddha depicted as smiling, fleshy, with shaven head (Ushnisha) and transparent dhoti. Included Brahmanical and Jain deities as well.\n- Key differences: Material (Schist vs. Red Sandstone), Origin (Foreign influence vs. Indigenous), Theme (Almost purely Buddhist vs. Secular/Multi-religious)."
  },
  {
    q: "Discuss the reasons for the uneven distribution of rainfall in India and its impact on agriculture. (Answer in 250 words, 15 marks)",
    explanation: "Key Points:\n- Reasons:\n  - Orographic barriers: Western Ghats block moisture, causing heavy rain on west coast and rain shadow on Deccan.\n  - Distance from sea: Continentality reduces rainfall in NW India (Thar Desert).\n  - Path of monsoon winds: Bay of Bengal branch loses moisture as it travels up the Gangetic plain.\n- Impact on Agriculture:\n  - Over-dependence on monsoons (50%+ rainfed agriculture).\n  - Cropping patterns: Paddy/Sugarcane in high rain areas vs. Millets/Pulses in dry areas.\n  - Crop failures, droughts in rain-shadow areas, and floods in eastern regions.\n- Solutions: Micro-irrigation, crop diversification, and watershed management."
  }
];

const GS2_QUESTIONS = [
  {
    q: "The office of the Governor has often become a battleground between the Centre and the States. Analyze in the context of Indian federalism. (Answer in 250 words, 15 marks)",
    explanation: "Key Points:\n- Role: Governor is the constitutional head of State and vital link between Centre and State. Represent federal balance.\n- Areas of Conflict:\n  - Discretionary powers in inviting parties to form government.\n  - Delay in giving assent to bills passed by state legislatures.\n  - Recommending President's Rule (Article 356).\n- Recommendations: Sarkaria Commission (Governor should be detached figure from outside state) and Punchhi Commission (fixed timeline for bill assent, guidelines for Article 356).\n- Conclusion: The Governor must act as a federal bridge rather than a political agent."
  },
  {
    q: "How can e-governance bring transparency, efficiency, and accountability to public service delivery in rural India? (Answer in 150 words, 10 marks)",
    explanation: "Key Points:\n- Transparency: Direct Benefit Transfer (DBT) eliminates middlemen and leakages. Portals like land records (Bhoomi) prevent land grabbing.\n- Efficiency: Digital certificates, CSCs (Common Service Centres) provide multiple services under one roof, reducing travel and processing time.\n- Accountability: Online grievance redressal portals (e-PGRAMS) track complaints with SLA (Service Level Agreements).\n- Challenges: Digital illiteracy, power outages, and poor rural internet connectivity.\n- Conclusion: E-governance is key to achieving 'Minimum Government, Maximum Governance' at the grassroots level."
  },
  {
    q: "Critically examine India's strategic interests in the Indian Ocean Region (IOR) and the role of the Quad in securing them. (Answer in 250 words, 15 marks)",
    explanation: "Key Points:\n- Strategic Interests: 90% of India's trade by volume passes through IOR. Maritime security, countering Chinese footprint ('String of Pearls'), and protecting Sea Lines of Communication (SLOCs).\n- Role of Quad (India, US, Japan, Australia):\n  - Fosters a free and open Indo-Pacific.\n  - Joint military exercises (Malabar) improve interoperability.\n  - Cooperation on maritime domain awareness, disaster relief (HADR), and climate monitoring.\n- Challenges: Quad is not a formal military alliance; differing priorities on China; avoiding antagonizing ASEAN.\n- Conclusion: Quad complements India's SAGAR vision (Security and Growth for All in the Region)."
  },
  {
    q: "The Right to Education (RTE) Act has increased school enrollment but failed to improve learning outcomes. Discuss. (Answer in 150 words, 10 marks)",
    explanation: "Key Points:\n- RTE Impact: Universalized elementary education. Enrollment rates in primary schools are now 98%+.\n- Learning Outcome Issues (as highlighted by ASER reports):\n  - Lack of trained teachers and high teacher absenteeism.\n  - Focus on rote learning instead of conceptual clarity.\n  - Poor infrastructure (science labs, functional toilets).\n  - 'No Detention Policy' (repealed recently) led to lack of learning assessments.\n- Solutions: Focus on foundational literacy and numeracy (NIPUN Bharat), teacher training, and outcome-based funding."
  },
  {
    q: "Analyze the significance of the 73rd and 74th Constitutional Amendment Acts in empowering local self-governments. (Answer in 250 words, 15 marks)",
    explanation: "Key Points:\n- Significance: Constitutional status to Panchayats (Part IX) and Municipalities (Part IXA). Mandated regular elections every 5 years.\n- Empowerment:\n  - Reservation of 1/3rd seats for women, SCs, and STs.\n  - Creation of State Finance Commissions for resource allocation.\n  - Devolution of 29 subjects (Panchayats) and 18 subjects (Municipalities).\n- Challenges: The 3Fs - lack of Funds (poor tax base), Functions (states refuse to delegate), and Functionaries (staff shortage).\n- Conclusion: True grassroots democracy requires structural devolution of fiscal and administrative power."
  }
];

const GS3_QUESTIONS = [
  {
    q: "Discuss the potential of Artificial Intelligence in revolutionizing public healthcare delivery in India. (Answer in 150 words, 10 marks)",
    explanation: "Key Points:\n- Potential:\n  - Diagnostics: AI tools can detect cancers, diabetic retinopathy, and tuberculosis from scans in remote areas lacking specialists.\n  - Telemedicine: AI chatbots for initial symptom sorting and routing.\n  - Resource allocation: Predict epidemics, coordinate vaccine drives, and manage hospital bed databases.\n- Challenges: High cost of implementation, lack of standardized health data, privacy issues, and digital divide.\n- Conclusion: AI can act as a force multiplier for public health, aligning with Ayushman Bharat Digital Mission."
  },
  {
    q: "Analyze the challenges of achieving a $5 trillion economy while fulfilling climate action commitments under Paris Agreement. (Answer in 250 words, 15 marks)",
    explanation: "Key Points:\n- The Dilemma: Rapid economic growth requires energy (currently 70% coal-dependent), infrastructure, and manufacturing, which increases emissions.\n- Key Challenges:\n  - High capital cost of transitioning to renewable energy.\n  - Job losses in traditional coal belt regions.\n  - Lack of technology transfer for green hydrogen and battery storage.\n  - Balancing agricultural emissions (methane) with food security.\n- Strategic Path: Green manufacturing, electric mobility, energy efficiency (PAT scheme), and investing in solar/wind. India's goal of Net Zero by 2070.\n- Conclusion: Economic growth must be decoupled from environmental degradation through green technology."
  },
  {
    q: "Explain the threat of cyberwarfare to India's critical national infrastructure and outline the institutional safeguards. (Answer in 250 words, 15 marks)",
    explanation: "Key Points:\n- Threat: Attackers target power grids, nuclear plants, banking networks, and defence systems (e.g., Kudankulam malware incident). State-sponsored hackers pose national security risks.\n- Safeguards:\n  - CERT-In (Computer Emergency Response Team) for incident handling.\n  - NCIIPC (National Critical Information Infrastructure Protection Centre) to secure critical sectors.\n  - National Cyber Security Policy.\n  - Defence Cyber Agency for military response.\n- Gaps: Lack of skilled cybersecurity professionals, dependency on imported hardware (supply chain backdoors).\n- Conclusion: India needs self-reliance (Atmanirbharta) in hardware and robust cyber audit drills."
  },
  {
    q: "What is land degradation neutrality (LDN) and what measures has India taken to reclaim degraded lands? (Answer in 150 words, 10 marks)",
    explanation: "Key Points:\n- LDN Definition: A state where the amount and quality of land resources necessary to support ecosystem functions remains stable or increases.\n- Indian Measures:\n  - Commited to restoring 26 million hectares of degraded land by 2030.\n  - Desertification Cell creation under MoEFCC.\n  - PM Krishi Sinchayee Yojana (Watershed development).\n  - Soil Health Card Scheme to prevent chemical degradation.\n  - Compensatory Afforestation Fund (CAMPA).\n- Conclusion: Preventing land degradation is critical for combating desertification and ensuring food security."
  },
  {
    q: "Evaluate the role of MSP (Minimum Support Price) in securing farmer incomes and its distortionary effects on crop patterns. (Answer in 250 words, 15 marks)",
    explanation: "Key Points:\n- Role: Price support mechanism ensuring farmers get a guaranteed price for their produce, shielding them from market volatility.\n- Distortionary Effects:\n  - Wheat-Rice Bias: MSP is announced for 23 crops but effective procurement is only for wheat and paddy in select states (Punjab, Haryana).\n  - Water Crisis: Encourages water-guzzling paddy cultivation in water-deficient regions.\n  - Soil Degradation: Excessive fertilizer use due to monoculture.\n- Reforms: Shift MSP focus to millets, pulses, and oilseeds; direct cash transfers; and contract farming safeguards."
  }
];

const GS4_QUESTIONS = [
  {
    q: "What do you understand by 'Ethics' in public service? Distinguish between laws and rules as sources of ethical guidance. (Answer in 150 words, 10 marks)",
    explanation: "Key Points:\n- Ethics in Public Service: Moral principles that guide civil servants to act with integrity, impartiality, and empathy, placing public interest above self-interest.\n- Laws vs. Rules:\n  - Laws: Enacted by legislatures, broad in scope, carry penal consequences for violation. Source of external control (e.g., Prevention of Corruption Act).\n  - Rules: Executive guidelines to implement laws, specific and procedural (e.g., Civil Services Conduct Rules).\n- Ethical Guidance: Laws set the minimum standards of conduct, but rules provide detailed processes. True ethical guidance, however, comes from conscience and inner values when laws are silent."
  },
  {
    q: "Case Study: You are the Municipal Commissioner of a metropolitan city. A massive fire in a commercial complex has killed 15 people. Investigations reveal that the building lacked fire safety clearance, and local municipal officers accepted bribes to overlook the violations. Media is demanding immediate action, and victims' families are protesting outside your office. Outline your course of action. (Answer in 250 words, 20 marks)",
    explanation: "Key Points:\n- Ethical Dilemmas: Public safety vs. administrative laxity, justice for victims vs. institutional accountability, handling public anger.\n- Course of Action:\n  - Immediate: Provide medical aid, declare compensation, and clear the protest area by engaging with family representatives to assure swift justice.\n  - Administrative: Suspend the errant municipal officers and initiate a departmental inquiry. Seal non-compliant buildings in the vicinity.\n  - Legal: File FIRs against the building owner and corrupt officers for criminal negligence.\n  - Preventive: Implement an online, transparent fire audit system and hold public safety drills.\n- Conclusion: Uphold the principle of zero tolerance for corruption and enforce strict administrative transparency."
  },
  {
    q: "Explain how emotional intelligence can help a civil servant handle communal tension and crisis situations. (Answer in 150 words, 10 marks)",
    explanation: "Key Points:\n- Emotional Intelligence (EI): Ability to recognize, understand, and manage one's own emotions and those of others.\n- Benefits in Crisis:\n  - Self-regulation: Keeps the administrator calm and rational under extreme pressure, preventing panic.\n  - Empathy: Helps understand the fears and grievances of rival communities, building trust.\n  - Relationship Management: Facilitates dialogue, defuses hostility, and allows negotiation with community leaders.\n- Conclusion: EI is as critical as intellectual capacity for maintaining law and order during conflicts."
  },
  {
    q: "Case Study: A pharmaceutical company is dumping chemical waste into a river flowing through a village, causing skin diseases and water pollution. The company is the major employer in the region, supporting 80% of local households. Closing the factory will cause mass unemployment, but continuing operations threatens public health. As the District Collector, how will you resolve this issue? (Answer in 250 words, 20 marks)",
    explanation: "Key Points:\n- Ethical Dilemmas: Economic livelihood vs. Right to Health, Corporate profits vs. Environmental sustainability.\n- Resolution Strategy:\n  - Enforce Environmental Laws: Issue a notice to the factory to halt waste dumping immediately. Impose a fine for cleanup operations.\n  - Mandate ETP (Effluent Treatment Plant): Require the factory to install or upgrade treatment facilities within a strict timeframe (e.g., 30 days) to operate.\n  - Alternative arrangements: Provide tanker water to the village using CSR funds of the company. Set up medical camps.\n  - Conclusion: Economic growth cannot be bought at the cost of human lives. Sustainable development must guide policy."
  },
  {
    q: "Discuss the importance of empathy and compassion towards the weaker sections as foundational values of civil services. (Answer in 150 words, 10 marks)",
    explanation: "Key Points:\n- Empathy: Understanding the pain and challenges of the marginalized (poor, women, disabled) from their perspective.\n- Compassion: Taking active steps to alleviate that pain.\n- Importance: Civil servants wield power; without empathy, administration becomes cold and rule-bound, ignoring human suffering. Empathy ensures that policies (like food security, pensions) are implemented in spirit, not just on paper, ensuring social justice."
  }
];

const ENGLISH_QUESTIONS = [
  {
    q: "Write a précis of the following passage in about one-third of its length. Do not suggest a title. Write the précis in your own words.\n\n'Education is not just about memorizing facts or obtaining degrees; it is a holistic development of character and intellect. A well-educated individual possesses the critical thinking skills to analyze complex societal issues and the empathy to contribute constructively. In contrast, an educational system focused solely on exams creates rote-learners who lack innovation and ethical grounding. Modern times require a shift towards creative, value-based learning.' (Answer in 25 words, 30 marks)",
    explanation: "Model Précis:\nTrue education fosters character, intellect, critical thinking, and empathy. Exam-centric systems produce rote-learners. Therefore, we must transition towards creative, value-based learning systems."
  },
  {
    q: "Read the passage and answer the questions:\n'India's rich biodiversity is a source of ecological stability and livelihood for millions. However, rapid urbanization and forest fragmentation threaten this heritage. Protecting ecosystems requires community participation alongside legislative backing.'\n1. What is the dual benefit of India's biodiversity? (5 marks)\n2. What are the threats to it? (5 marks)\n3. How can it be protected? (5 marks)",
    explanation: "Model Answers:\n1. The dual benefit is providing ecological stability and supporting the livelihoods of millions of people.\n2. The main threats are rapid urbanization and the fragmentation of forest habitats.\n3. It can be protected through community participation combined with strong legislative support."
  },
  {
    q: "Correct the following sentences without altering their basic meaning:\n1. He is senior than me in service. (5 marks)\n2. Each of the boys have completed their homework. (5 marks)\n3. Although it was raining, but the match continued. (5 marks)",
    explanation: "Model Corrections:\n1. He is senior to me in service. (Senior takes 'to' instead of 'than')\n2. Each of the boys has completed his homework. ('Each' takes singular verb and pronoun)\n3. Although it was raining, the match continued. ('Although' should not be followed by 'but')"
  },
  {
    q: "Rewrite the sentences as directed:\n1. He said, 'I am writing an essay now.' (Change to Indirect Speech) (5 marks)\n2. The storm destroyed the crops. (Change to Passive Voice) (5 marks)\n3. As soon as the bell rang, the students ran out. (Rewrite using 'No sooner... than') (5 marks)",
    explanation: "Model Rewrite:\n1. He said that he was writing an essay then.\n2. The crops were destroyed by the storm.\n3. No sooner did the bell ring than the students ran out."
  },
  {
    q: "Write short notes/definitions for the following idioms and use them in sentences:\n1. Burn the midnight oil (5 marks)\n2. A blessing in disguise (5 marks)\n3. Spill the beans (5 marks)",
    explanation: "Model Idiom Usage:\n1. Burn the midnight oil: To work or study late into the night. *Sentence*: Akhil had to burn the midnight oil to prepare for his UPSC Mains exams.\n2. A blessing in disguise: A misfortune that eventually results in a good outcome. *Sentence*: Losing his job was a blessing in disguise as it forced him to start his own successful business.\n3. Spill the beans: To reveal a secret prematurely. *Sentence*: Don't spill the beans about the surprise party we are planning for her birthday."
  }
];

// Generates 30 Mains Mock Tests
// Slices/rotates through the descriptive questions to create 30 unique, comprehensive test papers
export function generateMainsMocksForCourseOffline(courseId, courseTitle = "UPSC CSE") {
  const mocks = [];
  const paperTypes = ["Essay", "GS Paper I", "GS Paper II", "GS Paper III", "GS Paper IV", "Compulsory English"];
  
  for (let i = 1; i <= 30; i++) {
    const paperTypeIndex = (i - 1) % paperTypes.length;
    const paperType = paperTypes[paperTypeIndex];
    
    let paperQuestions = [];
    let weightage = 250; // standard marks
    let durationText = "180 Mins";
    
    // Rotate and build questions based on paper type
    if (paperType === "Essay") {
      const qIdx1 = (Math.floor((i - 1) / 6)) % ESSAY_TOPICS.length;
      const qIdx2 = (qIdx1 + 1) % ESSAY_TOPICS.length;
      
      paperQuestions = [
        {
          q: `Section A: ${ESSAY_TOPICS[qIdx1].q.replace("Write an essay on: ", "")}`,
          explanation: ESSAY_TOPICS[qIdx1].explanation
        },
        {
          q: `Section B: ${ESSAY_TOPICS[qIdx2].q.replace("Write an essay on: ", "")}`,
          explanation: ESSAY_TOPICS[qIdx2].explanation
        }
      ];
      weightage = 250;
    } else if (paperType === "GS Paper I") {
      // Pick questions from GS1 array
      const offset = Math.floor((i - 1) / 6);
      for (let q = 0; q < 4; q++) {
        const idx = (offset + q) % GS1_QUESTIONS.length;
        paperQuestions.push(GS1_QUESTIONS[idx]);
      }
      weightage = 250;
    } else if (paperType === "GS Paper II") {
      const offset = Math.floor((i - 1) / 6);
      for (let q = 0; q < 4; q++) {
        const idx = (offset + q) % GS2_QUESTIONS.length;
        paperQuestions.push(GS2_QUESTIONS[idx]);
      }
      weightage = 250;
    } else if (paperType === "GS Paper III") {
      const offset = Math.floor((i - 1) / 6);
      for (let q = 0; q < 4; q++) {
        const idx = (offset + q) % GS3_QUESTIONS.length;
        paperQuestions.push(GS3_QUESTIONS[idx]);
      }
      weightage = 250;
    } else if (paperType === "GS Paper IV") {
      const offset = Math.floor((i - 1) / 6);
      for (let q = 0; q < 4; q++) {
        const idx = (offset + q) % GS4_QUESTIONS.length;
        paperQuestions.push(GS4_QUESTIONS[idx]);
      }
      weightage = 250;
    } else { // Compulsory English
      const offset = Math.floor((i - 1) / 6);
      for (let q = 0; q < 4; q++) {
        const idx = (offset + q) % ENGLISH_QUESTIONS.length;
        paperQuestions.push(ENGLISH_QUESTIONS[idx]);
      }
      weightage = 300;
    }

    mocks.push({
      id: `${courseId}_mains_mock_${i}`,
      title: `${courseTitle.replace(" Prelims", "").replace(" Mains", "")} Mains Mock ${i} - ${paperType}`,
      duration: durationText,
      weightage: weightage,
      isMains: true,
      questions: paperQuestions
    });
  }
  
  return mocks;
}
