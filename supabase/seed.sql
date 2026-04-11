-- ============================================================
-- Skilled Visits Academy — Seed Data
-- ============================================================

-- Vitamins / IV Additives
insert into vitamins (name, category, description, therapeutic_uses, dosing_range, contraindications, interactions) values
(
  'Vitamin C (Ascorbic Acid)',
  'Vitamins',
  'A powerful water-soluble antioxidant essential for immune function, collagen synthesis, and iron absorption. High-dose IV Vitamin C has been studied for immune enhancement and adjunct cancer support.',
  ARRAY['Immune support', 'Antioxidant therapy', 'Collagen synthesis', 'Fatigue recovery', 'Adjunct oncology support'],
  '1,000mg – 25,000mg IV depending on indication',
  ARRAY['G6PD deficiency', 'Oxalate nephropathy history', 'Iron overload disorders'],
  ARRAY['Deferoxamine', 'Warfarin (high doses)', 'Chemotherapy agents (timing-dependent)']
),
(
  'Magnesium Chloride',
  'Minerals',
  'Essential mineral involved in over 300 enzymatic reactions. IV magnesium is used for muscle relaxation, migraine relief, cardiac arrhythmias, and bronchospasm.',
  ARRAY['Muscle cramps and spasms', 'Migraine relief', 'Anxiety and stress', 'Cardiac arrhythmia support', 'Asthma/bronchospasm'],
  '1g – 4g IV over 15–60 minutes depending on indication',
  ARRAY['Myasthenia gravis', 'Severe renal impairment', 'Heart block'],
  ARRAY['Calcium channel blockers (additive hypotension)', 'Neuromuscular blocking agents']
),
(
  'B-Complex (B1/B2/B3/B5/B6)',
  'B Vitamins',
  'A combination of essential B vitamins that support energy metabolism, neurological function, and red blood cell production. Commonly used in Myers Cocktail formulations.',
  ARRAY['Energy production', 'Neurological support', 'Stress reduction', 'Metabolism optimization', 'Alcohol detox support'],
  '1mL – 2mL of B-complex concentrate per IV bag',
  ARRAY['Known allergy to B vitamins (rare)'],
  ARRAY['Levodopa (B6 interference at high doses)']
),
(
  'Vitamin B12 (Methylcobalamin)',
  'B Vitamins',
  'Critical for neurological function, DNA synthesis, and red blood cell formation. Methylcobalamin is the most bioavailable form. IV delivery bypasses absorption issues.',
  ARRAY['B12 deficiency', 'Fatigue and low energy', 'Neurological support', 'Mood enhancement', 'Vegetarian/vegan supplementation'],
  '1,000mcg – 5,000mcg IV or IM',
  ARRAY['Leber disease (optic nerve atrophy)', 'Polycythemia vera'],
  ARRAY['Chloramphenicol (reduced B12 response)']
),
(
  'Glutathione',
  'Antioxidants',
  'The body''s master antioxidant. IV glutathione supports detoxification, liver function, skin brightening, and immune system modulation.',
  ARRAY['Liver detoxification', 'Skin brightening', 'Heavy metal chelation support', 'Immune modulation', 'Chronic illness recovery'],
  '600mg – 2,400mg IV push (slow) or in bag',
  ARRAY['Asthma (may trigger bronchospasm in some patients)', 'Active chemotherapy'],
  ARRAY['Do not mix directly with Vitamin C in same syringe (use separate lines or flush between)']
),
(
  'Zinc Chloride',
  'Minerals',
  'Essential trace mineral critical for immune function, wound healing, and antiviral defense. Frequently included in immune-boosting IV formulations.',
  ARRAY['Immune support', 'Wound healing', 'Antiviral defense', 'Skin health', 'Testosterone support'],
  '1mg – 5mg IV (trace amounts — always diluted)',
  ARRAY['Copper deficiency (high-dose zinc depletes copper)', 'Renal impairment'],
  ARRAY['Tetracycline antibiotics', 'Fluoroquinolones', 'Penicillamine']
),
(
  'Calcium Gluconate',
  'Minerals',
  'Calcium supplement used for hypocalcemia correction, cardiac protection during hyperkalemia, and magnesium toxicity reversal.',
  ARRAY['Hypocalcemia treatment', 'Cardiac protection', 'Magnesium toxicity antidote', 'Muscle cramps'],
  '1g – 2g IV (as 10% calcium gluconate solution)',
  ARRAY['Hypercalcemia', 'Digitalis toxicity', 'Ventricular fibrillation'],
  ARRAY['Digoxin (potentiates toxicity)', 'Ceftriaxone (precipitate formation — never mix)']
),
(
  'Alpha Lipoic Acid',
  'Antioxidants',
  'Universal antioxidant soluble in both fat and water. Used for neuropathy support, blood sugar regulation, and heavy metal chelation.',
  ARRAY['Diabetic neuropathy', 'Heavy metal detox', 'Antioxidant therapy', 'Metabolic support', 'Liver support'],
  '300mg – 600mg IV over 30–60 minutes',
  ARRAY['Thiamine deficiency (must supplement B1 concurrently)', 'Insulin use (may lower glucose further)'],
  ARRAY['Insulin/antidiabetics (enhanced glucose lowering)', 'Thyroid medications']
),
(
  'NAD+ (Nicotinamide Adenine Dinucleotide)',
  'Specialty',
  'Coenzyme present in all living cells essential for energy metabolism and DNA repair. High-dose IV NAD+ is used for addiction recovery, cognitive enhancement, and anti-aging protocols.',
  ARRAY['Addiction recovery (opioid, alcohol)', 'Cognitive enhancement', 'Anti-aging', 'Energy and metabolism', 'Neurological repair'],
  '250mg – 1,000mg IV over 2–8 hours (run slowly)',
  ARRAY['Active cancer (consult oncologist)', 'Pregnancy'],
  ARRAY['Must be run slowly — rapid infusion causes chest tightness, nausea. No known drug interactions but use caution with other NAD precursors']
),
(
  'Taurine',
  'Amino Acids',
  'Conditionally essential amino acid with antioxidant and osmoregulatory properties. Supports cardiovascular function, nerve conduction, and electrolyte balance.',
  ARRAY['Cardiovascular support', 'Athletic performance', 'Electrolyte regulation', 'Retinal health', 'Anxiety reduction'],
  '500mg – 2,000mg IV',
  ARRAY['Bipolar disorder (may affect mood cycling)'],
  ARRAY['Lithium (potential interaction with renal clearance)']
);

-- Dosage Rules
insert into dosage_rules (additive_name, per_kg_dose, min_dose, max_dose, unit, notes) values
('Vitamin C (Ascorbic Acid)', null, 1000, 25000, 'mg', 'Start at 1,000mg for maintenance; up to 25,000mg for high-dose immune protocols. Check G6PD status above 10g.'),
('Magnesium Chloride', null, 1000, 4000, 'mg', '1-2g for general wellness; 2-4g for acute migraine or bronchospasm. Infuse over 15-60 min.'),
('B-Complex', null, 1, 2, 'mL', 'Standard 1mL per bag. Max 2mL per infusion to avoid nausea.'),
('Vitamin B12 (Methylcobalamin)', null, 1000, 5000, 'mcg', '1,000mcg standard. Up to 5,000mcg for deficiency correction.'),
('Glutathione', null, 600, 2400, 'mg', 'Push slowly over 10-15 min. Start at 600mg for new patients.'),
('Zinc Chloride', null, 1, 5, 'mg', 'Always dilute. Trace dose only. Do not exceed 5mg per infusion.'),
('Calcium Gluconate', null, 1000, 2000, 'mg', 'As 10% solution. 1g for supplementation; 2g for acute hypocalcemia.'),
('Alpha Lipoic Acid', null, 300, 600, 'mg', 'Always pre-load with B1 (100mg thiamine IV) before ALA infusion.'),
('NAD+', null, 250, 1000, 'mg', 'MUST run slowly — 250mg over 2hr minimum. 500mg-1000mg over 4-8hr. Flush line before/after.'),
('Taurine', null, 500, 2000, 'mg', '500-1000mg standard. Up to 2000mg for athletes.');

-- SVA Approved Protocols
insert into protocols (name, symptoms, ingredients, rationale, is_sva_approved) values
(
  'Myers Cocktail',
  ARRAY['fatigue', 'fibromyalgia', 'depression', 'muscle weakness', 'seasonal allergies', 'general wellness'],
  '[
    {"vitamin_name": "Vitamin C (Ascorbic Acid)", "dose": "1000", "unit": "mg"},
    {"vitamin_name": "Magnesium Chloride", "dose": "500", "unit": "mg"},
    {"vitamin_name": "B-Complex", "dose": "1", "unit": "mL"},
    {"vitamin_name": "Vitamin B12 (Methylcobalamin)", "dose": "1000", "unit": "mcg"},
    {"vitamin_name": "Calcium Gluconate", "dose": "500", "unit": "mg"}
  ]',
  'The gold standard IV wellness protocol. Developed by Dr. John Myers, this formulation addresses micronutrient deficiencies that underlie many chronic conditions. Particularly effective for fatigue, fibromyalgia, and seasonal allergies.',
  true
),
(
  'Immune Boost Protocol',
  ARRAY['illness prevention', 'active illness', 'immune support', 'frequent infections', 'post-illness recovery'],
  '[
    {"vitamin_name": "Vitamin C (Ascorbic Acid)", "dose": "5000", "unit": "mg"},
    {"vitamin_name": "Zinc Chloride", "dose": "2", "unit": "mg"},
    {"vitamin_name": "Glutathione", "dose": "600", "unit": "mg"},
    {"vitamin_name": "B-Complex", "dose": "1", "unit": "mL"}
  ]',
  'High-dose Vitamin C combined with Zinc and Glutathione creates a powerful antiviral and immunomodulatory effect. Glutathione supports cellular immune function and reduces oxidative stress during illness.',
  true
),
(
  'Energy & Performance',
  ARRAY['chronic fatigue', 'athletic recovery', 'low energy', 'poor performance', 'workout recovery'],
  '[
    {"vitamin_name": "B-Complex", "dose": "2", "unit": "mL"},
    {"vitamin_name": "Vitamin B12 (Methylcobalamin)", "dose": "2000", "unit": "mcg"},
    {"vitamin_name": "Magnesium Chloride", "dose": "1000", "unit": "mg"},
    {"vitamin_name": "Taurine", "dose": "1000", "unit": "mg"},
    {"vitamin_name": "Vitamin C (Ascorbic Acid)", "dose": "2000", "unit": "mg"}
  ]',
  'Targets mitochondrial energy production through B vitamins and cofactors. Magnesium supports over 300 enzymatic reactions involved in ATP synthesis. Taurine reduces exercise-induced oxidative damage and supports cardiovascular output.',
  true
),
(
  'Detox & Liver Support',
  ARRAY['liver support', 'detoxification', 'heavy metal exposure', 'alcohol recovery', 'environmental toxin exposure'],
  '[
    {"vitamin_name": "Glutathione", "dose": "1200", "unit": "mg"},
    {"vitamin_name": "Alpha Lipoic Acid", "dose": "600", "unit": "mg"},
    {"vitamin_name": "Vitamin C (Ascorbic Acid)", "dose": "3000", "unit": "mg"},
    {"vitamin_name": "B-Complex", "dose": "1", "unit": "mL"}
  ]',
  'Triple antioxidant protocol. Glutathione is the liver''s primary detoxification molecule. Alpha Lipoic Acid regenerates glutathione and chelates heavy metals. Always pre-administer Thiamine (B1) 100mg before ALA infusion to prevent Wernicke encephalopathy risk.',
  true
),
(
  'NAD+ Renewal',
  ARRAY['addiction recovery', 'cognitive decline', 'brain fog', 'aging', 'neurological support', 'depression'],
  '[
    {"vitamin_name": "NAD+", "dose": "500", "unit": "mg"},
    {"vitamin_name": "B-Complex", "dose": "1", "unit": "mL"},
    {"vitamin_name": "Vitamin C (Ascorbic Acid)", "dose": "1000", "unit": "mg"}
  ]',
  'NAD+ is critical for neuronal repair, DNA maintenance, and addiction pathway modulation. Must be infused slowly (minimum 4 hours for 500mg). Pre-hydrate patient. Common during infusion: chest tightness, tingling, nausea — reduce rate, do not stop.',
  true
),
(
  'Hydration & Recovery',
  ARRAY['dehydration', 'hangover', 'nausea', 'vomiting', 'heat exhaustion', 'post-procedure recovery'],
  '[
    {"vitamin_name": "B-Complex", "dose": "1", "unit": "mL"},
    {"vitamin_name": "Vitamin B12 (Methylcobalamin)", "dose": "1000", "unit": "mcg"},
    {"vitamin_name": "Magnesium Chloride", "dose": "500", "unit": "mg"},
    {"vitamin_name": "Vitamin C (Ascorbic Acid)", "dose": "1000", "unit": "mg"}
  ]',
  'Foundational hydration protocol with electrolyte replenishment and anti-nausea B vitamin support. Excellent as a base for most acute recovery scenarios. Can add Zofran (ondansetron) 4mg IV for active nausea if prescribed.',
  true
);

-- Mixing Compatibility Data
insert into mixing_compatibility (additive_a, additive_b, status, notes) values
('Vitamin C (Ascorbic Acid)', 'B-Complex', 'compatible', 'Stable combination at standard IV concentrations. Standard in Myers Cocktail.'),
('Vitamin C (Ascorbic Acid)', 'Magnesium Chloride', 'compatible', 'Stable. Used together routinely in IV wellness protocols.'),
('Vitamin C (Ascorbic Acid)', 'Glutathione', 'caution', 'Do NOT mix in same syringe or push together. Run Vitamin C infusion first, flush line, then push Glutathione separately. They oxidize each other when directly combined.'),
('Vitamin C (Ascorbic Acid)', 'Vitamin B12 (Methylcobalamin)', 'compatible', 'Stable in IV bag. Standard combination.'),
('Vitamin C (Ascorbic Acid)', 'Calcium Gluconate', 'compatible', 'Stable at standard concentrations. Used in Myers Cocktail.'),
('Vitamin C (Ascorbic Acid)', 'Zinc Chloride', 'compatible', 'Stable. Both support immune function synergistically.'),
('Vitamin C (Ascorbic Acid)', 'Alpha Lipoic Acid', 'compatible', 'Can be in same bag. ALA requires pre-B1 load — this is separate from compatibility.'),
('Magnesium Chloride', 'Calcium Gluconate', 'caution', 'Avoid mixing in high concentrations — precipitation risk. Use separate bags or ensure appropriate dilution in large volume (500mL+).'),
('Magnesium Chloride', 'B-Complex', 'compatible', 'Stable. Commonly combined in Myers Cocktail.'),
('Calcium Gluconate', 'Ceftriaxone', 'incompatible', 'NEVER mix — forms fatal calcium-ceftriaxone precipitate. Has caused patient deaths. Absolute contraindication.'),
('Calcium Gluconate', 'Phosphate solutions', 'incompatible', 'Calcium phosphate precipitates readily. Never mix in same line.'),
('Glutathione', 'NAD+', 'compatible', 'Can be used in same session but run separately — NAD+ requires dedicated slow infusion.'),
('NAD+', 'B-Complex', 'compatible', 'Safe to combine in same bag. B vitamins support NAD+ metabolism.'),
('Alpha Lipoic Acid', 'Vitamin B12 (Methylcobalamin)', 'caution', 'ALA may degrade B12 in solution over time. Add B12 to bag close to time of infusion if combining.'),
('Zinc Chloride', 'Vitamin B12 (Methylcobalamin)', 'compatible', 'Stable at trace zinc concentrations used in IV therapy.'),
('Taurine', 'B-Complex', 'compatible', 'Stable. Both support energy metabolism and are often combined in performance protocols.'),
('Taurine', 'Magnesium Chloride', 'compatible', 'Stable. Synergistic cardiovascular and muscle support.'),
('B-Complex', 'Vitamin B12 (Methylcobalamin)', 'compatible', 'Standard combination. B12 can be added to any B-complex containing bag safely.');
