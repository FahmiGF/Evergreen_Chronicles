# EVERGREEN CHRONICLES — ART BIBLE & ASSET STANDARDS
**Document Version:** 2.0.0  
**Status:** Canonical Art Specification  
**Focus:** Pixel Dimensions, Perspectives, Palettes, Layer Ordering, and Animation Rules

---

## 1. Pixel Art Fundamentals

1. **Native Pixel Grid**: 
   - Standard Tile: **40×40 px** (viewport grid 16×16 tiles = 640×640 px base render canvas).
   - Character Base: **32×48 px** bounding box, centered horizontally within tile.
   - Large Multi-Tile Structures: Modular multiples of 40 px (e.g., Farmhouse 160×120 px, Windmill 80×120 px).
2. **Camera Perspective**:
   - **Mode A (2D Top-Down RPG)**: ¾ Top-down oblique view (classic SNES / Stardew Valley perspective). Walls and characters show frontal plane; ground shows top plane.
   - **Mode B (3D Isometric CAD)**: 2:1 True Isometric dimetric projection ($\theta = 30^\circ$). $X_{iso} = (x - y) \times 24$, $Y_{iso} = (x + y) \times 12 - z$.
3. **Lighting & Shadow Direction**:
   - Universal light source: Top-left ($315^\circ$ angle / Northwest).
   - Highlights on upper-left edges, soft drop shadows cast to bottom-right ($135^\circ$).
   - Ground drop shadows: Semi-transparent black (`rgba(0, 0, 0, 0.35)`), horizontal ellipse.

---

## 2. Character Layer Rendering Hierarchy

To guarantee zero clipping between hairstyles, accessories, equipment, and clothing, all character rendering follows strict sorting rules from back to front:

```
Z-INDEX   LAYER                  DESCRIPTION
───────────────────────────────────────────────────────────────────
  0       Ground Shadow          Soft ellipse under feet
  1       Rear Appendages        Tail (swaying), Rear Wings
  2       Back Equipment         Backpack, Knight's Cape
  3       Lower Body / Legs      Trousers, Overalls, Skirts
  4       Footwear               Work boots, Greaves, Sandals
  5       Torso / Clothing       Tunic, Mail armor, Royal robes
  6       Arms & Gloves          Left/Right arms moving with walk cycle
  7       Head Base              Skin tone oval/chiseled face
  8       Facial Markings        Scars, Freckles, Mystic Runes
  9       Eyes & Eyebrows        Iris color with specular white glint
 10       Ears                   Elven long, Beast fluffy, Human round
 11       Hair Base              Adventurer, Braided, Spiky, Bob
 12       Hair Highlights        Secondary tone accents
 13       Horns                  Draconic spikes, Curled ram, Crystals
 14       Headwear               Straw hat, Iron helm, Laurel crown
 15       Front Accessories      Amulet, Scarf, Collar details
 16       Held Tools / Weapons   Hoe, Watering Can, Axe, Fishing Rod
 17       Status Floating Icons  Chat bubble, Emotion emotes (! / ?)
```

---

## 3. Era Visual Identity Guidelines

Evergreen Chronicles progresses across 4 distinct visual eras:

### Era I — Medieval Realm
- Materials: Rough-hewn oak timber, fieldstone masonry, thatched straw roofs, wrought iron.
- Palette: Forest green `#15803d`, oak brown `#78350f`, straw gold `#eab308`.
- Machinery: Waterwheels, stone hearths, animal-drawn plows, hand-operated anvils.

### Era II — Industrial Expansion
- Materials: Cast iron plating, red brick chimneys, brass gears, copper steam pipes, steam boilers.
- Palette: Basalt charcoal `#1c1917`, terracotta brick `#991b1b`, polished brass `#ca8a04`.
- Machinery: Mechanical steam tractors, piston pumps, cog-driven sawmills, railway tracks.

### Era III — Modern Metropolitan
- Materials: Reinforced cobblestone concrete, glass greenhouses, copper electrical wire, incandescent bulbs.
- Palette: Steel slate `#475569`, clear sky blue `#38bdf8`, warm tungsten `#fef08a`.
- Machinery: Hydroelectric dynamos, automated sprinkler networks, electric combine harvesters.

### Era IV — Arcane Future
- Materials: Floating levitation platforms, polished marble, glowing crystalline conduits, celestial glass.
- Palette: Luminescent aether cyan `#06b6d4`, arcane violet `#8b5cf6`, pure celestial white `#f8fafc`.
- Machinery: Bio-aether mana collectors, teleportation arches, automatic crystal harvesters.
