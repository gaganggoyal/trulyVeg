/* ============================================================
   TrulyVeg — Label Scanner
   Reads an ingredient label with on-device OCR (Tesseract.js) and
   flags hidden non-vegetarian, synthetic and illegal-adulterant
   ingredients. Everything runs in the browser — the photo never
   leaves the device.

   Depends on: js/vendor/tesseract.min.js  (global `Tesseract`)
   ============================================================ */
(function () {
  "use strict";

  /* ----------------------------------------------------------
     Ingredient knowledge base — mirrors hidden-nonveg.html.
     cat:  "nonveg"  → always animal-derived (red)
           "dairy"   → milk/egg: vegetarian but not vegan
           "check"   → ambiguous source, resolve via label / green dot
           "synth"   → synthetic / petroleum colour ("was this ever food?")
           "illegal" → non-permitted adulterant, unsafe
     patterns are matched against OCR text that has been lower-cased
     and had spaces/dots stripped from E-codes (so "E 120" → "e120").
     ---------------------------------------------------------- */
  var DB = [
    // ---- Always animal-derived -------------------------------------
    { name: "Carmine / Cochineal (E120)", cat: "nonveg",
      patterns: ["e120", "carmine", "cochineal", "carmines", "carminicacid", "naturalred4", "ci75470"],
      what: "Red dye from crushed cochineal insects.",
      swap: "Beetroot (E162), anthocyanins (E163), annatto (E160b)." },
    { name: "Gelatin (E441)", cat: "nonveg",
      patterns: ["e441", "gelatin", "gelatine", "gelatin(bovine)", "gelatin(porcine)"],
      what: "Boiled animal skin, bone and connective tissue.",
      swap: "Agar-agar (E406), pectin (E440), carrageenan (E407)." },
    { name: "Shellac (E904)", cat: "nonveg",
      patterns: ["e904", "shellac", "lacresin", "confectionersglaze"],
      what: "Resin secreted by lac insects.",
      swap: "Carnauba wax (E903 — palm leaf)." },
    { name: "L-Cysteine (E920)", cat: "nonveg",
      patterns: ["e920", "lcysteine", "l-cysteine", "cysteine"],
      what: "Dough improver often from poultry feathers or hair.",
      swap: "Breads without improvers; synthetic-fermentation E920." },
    { name: "Bone Phosphate (E542)", cat: "nonveg",
      patterns: ["e542", "bonephosphate", "ediblebonephosphate"],
      what: "Ground animal bones, used as anti-caking agent.",
      swap: "Plant/mineral anti-caking agents." },
    { name: "Lanolin (E913)", cat: "nonveg",
      patterns: ["e913", "lanolin", "woolgrease", "woolfat"],
      what: "Sheep wool grease; the base of most vitamin D3.",
      swap: "Lichen-derived D3." },
    { name: "Animal rennet / “Enzymes”", cat: "nonveg",
      patterns: ["rennet", "animalrennet", "calfrennet", "rennin"],
      what: "Enzyme from calf stomach lining (when unspecified).",
      swap: "“Microbial rennet” cheese; Indian paneer." },
    { name: "Isinglass", cat: "nonveg",
      patterns: ["isinglass", "finings", "fishbladder"],
      what: "Dried fish swim bladders, used to clarify drinks.",
      swap: "Unfined / vegan-certified beverages." },
    { name: "Lysozyme (E1105)", cat: "nonveg",
      patterns: ["e1105", "lysozyme"],
      what: "Enzyme extracted from hen egg white.",
      swap: "Cheeses without lysozyme; egg-free certified; paneer." },
    { name: "Pepsin / Animal lipase", cat: "nonveg",
      patterns: ["pepsin", "animallipase", "pregastriclipase"],
      what: "Pepsin is from pig stomach; lipase from calf/kid/lamb.",
      swap: "“Microbial lipase / microbial rennet” cheese." },
    { name: "Tallow / Suet / Lard", cat: "nonveg",
      patterns: ["tallow", "suet", "lard", "beeffat", "porkfat", "muttonfat", "animalfat", "animalshortening", "dripping"],
      what: "Rendered beef, mutton or pork fat.",
      swap: "Products fried in “vegetable oil”; ghee at home." },
    { name: "Castoreum / Civet (in “natural flavours”)", cat: "nonveg",
      patterns: ["castoreum", "civet", "ambergris", "musk"],
      what: "Animal secretions legally allowed inside “natural flavour”.",
      swap: "Brands that disclose flavour sources; less processed food." },

    // ---- Dairy / egg: vegetarian but not vegan ---------------------
    { name: "Casein / Caseinate / Whey", cat: "dairy",
      patterns: ["casein", "caseinate", "sodiumcaseinate", "calciumcaseinate", "whey", "wheyprotein", "milksolids", "milkprotein"],
      what: "Milk proteins — vegetarian, but not vegan.",
      swap: "Named plant proteins (pea, soy, rice) for vegan readers." },
    { name: "Albumen (egg)", cat: "dairy",
      patterns: ["albumen", "eggwhite", "eggpowder", "driedegg", "ovalbumin"],
      what: "Egg white — non-veg for lacto-vegetarians.",
      swap: "Aquafaba, egg-free certified products." },

    // ---- Ambiguous source — resolve via label / green dot ----------
    { name: "Mono- & diglycerides (E471)", cat: "check",
      patterns: ["e471", "monoglycerides", "diglycerides", "monoanddiglycerides"],
      what: "Fat emulsifier — can be animal tallow or plant oil.",
      swap: "In India trust the green dot; abroad look for “vegetable source”." },
    { name: "Inosinate / Guanylate (E627 / E631)", cat: "check",
      patterns: ["e627", "e631", "e635", "inosinate", "guanylate", "disodiuminosinate", "disodiumguanylate"],
      what: "Flavour enhancers — can be from fish/meat or microbial.",
      swap: "Green-dot packs; explicitly veg flavours abroad." },
    { name: "Lecithin (E322)", cat: "check",
      patterns: ["e322", "lecithin"],
      what: "Usually soy — occasionally from egg yolk.",
      swap: "“Soy lecithin” or “sunflower lecithin” named = veg." },
    { name: "Stearic acid / stearates (E470–E478, E570)", cat: "check",
      patterns: ["e570", "e470", "e472", "e473", "e474", "e475", "e476", "e477", "e478", "stearicacid", "magnesiumstearate", "stearate"],
      what: "Fatty-acid derivatives — animal or plant source.",
      swap: "Green dot / “vegetable origin” declaration." },
    { name: "Glycerol / Glycerin (E422)", cat: "check",
      patterns: ["e422", "glycerol", "glycerin", "glycerine"],
      what: "Syrup from animal fat, vegetable oil or petroleum.",
      swap: "“Vegetable glycerine” stated; green dot in India." },
    { name: "Polysorbates — Tween (E432–E436)", cat: "check",
      patterns: ["e432", "e433", "e434", "e435", "e436", "polysorbate", "tween20", "tween60", "tween80"],
      what: "Emulsifiers — fatty acid can be plant or tallow.",
      swap: "“Vegetable-source” declaration; green dot." },
    { name: "Stearoyl lactylates — SSL / CSL (E481 / E482)", cat: "check",
      patterns: ["e481", "e482", "stearoyllactylate", "ssl", "csl"],
      what: "Dough softeners — stearic acid may be animal tallow.",
      swap: "Green dot / “vegetable origin”; artisan bread." },
    { name: "“Natural flavours”", cat: "check",
      patterns: ["naturalflavour", "naturalflavor", "naturalflavouring", "naturalflavoring"],
      what: "Legally can include animal-derived substances.",
      swap: "Brands that disclose flavour sources; less processed food." },
    { name: "Vitamin D3 (unspecified)", cat: "check",
      patterns: ["vitamind3", "cholecalciferol"],
      what: "Usually lanolin (sheep wool) or fish liver oil.",
      swap: "Lichen-source D3." },
    { name: "Vitamin A / Retinyl palmitate (unspecified)", cat: "check",
      patterns: ["retinylpalmitate", "retinylacetate", "vitamina"],
      what: "Often from fish-liver oil when the source is unstated.",
      swap: "Beta-carotene (E160a, plant); stated “vegetarian/vegan”." },
    { name: "Omega-3 (unspecified)", cat: "check",
      patterns: ["omega3", "omega-3", "epa", "dha", "fishoil", "krilloil"],
      what: "Usually fish or krill oil.",
      swap: "Algal DHA/EPA." },

    // ---- Synthetic / petroleum colours ("was this ever food?") -----
    { name: "Tartrazine (E102)", cat: "synth", patterns: ["e102", "tartrazine"],
      what: "Synthetic lemon-yellow azo dye from petroleum.",
      swap: "Turmeric/curcumin (E100), saffron, marigold." },
    { name: "Sunset Yellow (E110)", cat: "synth", patterns: ["e110", "sunsetyellow"],
      what: "Synthetic orange azo dye.",
      swap: "Annatto (E160b), turmeric, carrot." },
    { name: "Carmoisine / Azorubine (E122)", cat: "synth", patterns: ["e122", "carmoisine", "azorubine"],
      what: "Synthetic red azo dye.",
      swap: "Beetroot (E162), hibiscus, anthocyanins (E163)." },
    { name: "Ponceau 4R (E124)", cat: "synth", patterns: ["e124", "ponceau", "ponceau4r"],
      what: "Synthetic scarlet azo dye (banned in the USA).",
      swap: "Beetroot, pomegranate, red rice yeast." },
    { name: "Allura Red / Red 40 (E129)", cat: "synth", patterns: ["e129", "allurared", "red40"],
      what: "Synthetic red azo dye.",
      swap: "Beetroot, pomegranate, hibiscus." },
    { name: "Quinoline Yellow (E104)", cat: "synth", patterns: ["e104", "quinolineyellow"],
      what: "Synthetic yellow dye (banned in the USA).",
      swap: "Turmeric, saffron." },
    { name: "Erythrosine / Red 3 (E127)", cat: "synth", patterns: ["e127", "erythrosine", "red3"],
      what: "Synthetic cherry-red dye, being withdrawn in the USA.",
      swap: "Beetroot, cranberry, hibiscus." },
    { name: "Brilliant Blue / Blue 1 (E133)", cat: "synth", patterns: ["e133", "brilliantblue", "blue1"],
      what: "Synthetic petroleum blue dye.",
      swap: "Butterfly-pea flower, spirulina blue." },
    { name: "Indigo Carmine / Blue 2 (E132)", cat: "synth", patterns: ["e132", "indigocarmine", "blue2"],
      what: "Synthetic indigo dye.",
      swap: "Butterfly-pea, red-cabbage extract." },
    { name: "Green S / Fast Green (E142 / E143)", cat: "synth", patterns: ["e142", "e143", "greens", "fastgreen"],
      what: "Synthetic green dyes.",
      swap: "Spinach/chlorophyll, matcha, mint reduction." },
    { name: "Ammonia / sulphite caramel (E150c / E150d)", cat: "synth", patterns: ["e150c", "e150d", "ammoniacaramel", "sulphitecaramel"],
      what: "Sugar cooked with ammonia/sulphites; traces of 4-MEI.",
      swap: "Plain caramelised sugar (E150a), jaggery." },
    { name: "Titanium Dioxide (E171)", cat: "synth", patterns: ["e171", "titaniumdioxide"],
      what: "Mineral white pigment — banned in EU food since 2022.",
      swap: "Rice starch/calcium for whiteness; buy uncoated." },

    // ---- Illegal / non-permitted adulterants -----------------------
    { name: "Metanil Yellow", cat: "illegal", patterns: ["metanilyellow", "metanil"],
      what: "Non-permitted industrial azo dye; nerve/organ damage.",
      swap: "Buy whole turmeric and grind it at home." },
    { name: "Lead Chromate", cat: "illegal", patterns: ["leadchromate"],
      what: "Toxic heavy-metal pigment; causes brain damage.",
      swap: "Whole polished turmeric fingers from trusted sources." },
    { name: "Sudan I–IV", cat: "illegal", patterns: ["sudan1", "sudani", "sudanred", "sudandye"],
      what: "Industrial red dyes; classified carcinogenic.",
      swap: "Whole dried chillies ground at home; lab-tested spices." },
    { name: "Rhodamine B", cat: "illegal", patterns: ["rhodamine", "rhodamineb"],
      what: "Fluorescent pink textile dye; carcinogenic.",
      swap: "Refuse unnaturally glowing pink food." },
    { name: "Malachite Green", cat: "illegal", patterns: ["malachitegreen"],
      what: "Blue-green industrial dye, toxic to cells.",
      swap: "Rub a wet tissue on green veg; a green smear is a warning." }
  ];

  var CAT_META = {
    nonveg:  { label: "Animal-derived",  tone: "danger", rank: 0 },
    illegal: { label: "Illegal / unsafe", tone: "danger", rank: 1 },
    dairy:   { label: "Dairy / egg",      tone: "warn",   rank: 2 },
    check:   { label: "Check label",      tone: "warn",   rank: 3 },
    synth:   { label: "Synthetic colour", tone: "warn",   rank: 4 }
  };

  /* ----------------------------------------------------------
     Text matching
     ---------------------------------------------------------- */
  function normalise(text) {
    var t = (text || "").toLowerCase();
    // Join E-codes split by spaces/dots/hyphens:  "e 120" / "e-120" → "e120"
    t = t.replace(/\be[\s.\-]?(\d{3,4}[a-d]?)\b/g, "e$1");
    // Collapse everything that is not a letter or digit so that
    // "mono- and di-glycerides" → "monoanddiglycerides", etc.
    return t.replace(/[^a-z0-9]+/g, "");
  }

  /* Returns findings sorted most-severe first. */
  function analyse(rawText) {
    var hay = normalise(rawText);
    var found = [];
    DB.forEach(function (entry) {
      for (var i = 0; i < entry.patterns.length; i++) {
        if (hay.indexOf(entry.patterns[i]) !== -1) {
          found.push(entry);
          break;
        }
      }
    });
    found.sort(function (a, b) {
      return CAT_META[a.cat].rank - CAT_META[b.cat].rank;
    });
    return found;
  }

  /* ----------------------------------------------------------
     OCR — Tesseract.js worker (reused across scans)
     ---------------------------------------------------------- */
  var workerPromise = null;
  function getWorker(onProgress) {
    if (!workerPromise) {
      if (typeof Tesseract === "undefined") {
        return Promise.reject(new Error(
          "Tesseract.js not loaded — include js/vendor/tesseract.min.js first."));
      }
      workerPromise = Tesseract.createWorker("eng", 1, {
        logger: function (m) {
          if (onProgress && m.status === "recognizing text") {
            onProgress(m.progress);
          }
        }
      });
    }
    return workerPromise;
  }

  /* Runs OCR on an image (File, Blob, <img>, canvas, or data URL). */
  function scan(image, onProgress) {
    return getWorker(onProgress).then(function (worker) {
      return worker.recognize(image);
    }).then(function (res) {
      var text = res.data.text || "";
      return {
        text: text,
        confidence: res.data.confidence,
        findings: analyse(text)
      };
    });
  }

  window.TrulyVegScanner = {
    scan: scan,
    analyse: analyse,      // exposed so you can unit-test without OCR
    CAT_META: CAT_META,
    db: DB
  };
})();
