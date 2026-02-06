# ⚔️ Technical Dossier: Universal Asset Comparison Engine

## 1. Overview
The **Comparison Engine** is a high-authority diagnostic tool designed to normalize and contrast disparate wealth-generation assets (Blueprints vs. Franchises). It operates as a "Financial Battle Engine," allowing investors to stress-test their saved vault items against each other in a side-by-side high-density matrix.

## 2. Architectural Data Stitching
Because Blueprints (`income_ideas`) and Franchises have different database schemas, the engine uses a **Normalization Layer** within `useEffect`.

```javascript
const unifiedAssets = [
    ...ideasData.map(item => ({
        type: 'blueprint',
        investMin: item.initial_investment_min,
        payback: item.time_to_first_income_days + ' Days',
        // ...
    })),
    ...franchisesData.map(item => ({
        type: 'franchise',
        investMin: item.investment_min,
        payback: item.roi_months_min + ' Months',
        // ...
    }))
];
```

### Data Integrity Logic:
- **Null Handling**: Payback periods marked as `null` in the database are dynamically converted to **"TBD"** or **"Flexible"** to maintain professional UI standards.
- **Scaling**: All currency values are passed through a `formatCurrency` utility that converts millions into **Lakhs (L)** and **Crores (Cr)** for rapid cognitive processing by Indian investors.

## 3. The Unified Scroll Engine (Mobile)
To solve the "staggered row" problem on mobile devices, the engine utilizes a **Table-Locked Scroll Container**.

- **Structure**: A single `overflow-x-auto` wrapper contains the entire `<table>`.
- **Sticky Locking**: The first column (Metric Labels) is locked using `sticky left-0` with a `backdrop-blur-md` scrim.
- **Synchronization**: Because it uses a native HTML table, all rows are physically bound together, ensuring that swiping horizontally moves the investment, income, and action rows in perfect unison.

## 4. Intelligence Gauges
The engine performs real-time analysis on the active comparison set:
- **Highest Yield Detection**: Uses `Math.max()` across the `incomeMin` of all `comparedItems` to find the top performer and applies a "Highest Yield" pulsator.
- **Risk Spectrum**: Dynamically colors risk levels (Emerald for Low, Red for High) based on normalized string evaluation.

## 5. Strategic Constraints
- **Bandwidth Limit**: Capped at **5 slots**. This is an institutional decision to prevent "Information Overload" and ensure the matrix remains legible on mobile screens.
- **Feedback Protocol**: Integrated with `react-hot-toast` to provide high-glow system messaging when caps are reached.

## 6. Print & Export
The engine includes custom `@media print` CSS overrides that:
- Strip navigation and UI interactive elements.
- Expand the matrix to full A4 width.
- Standardize typography for physical "Investment Dossiers."

---
*Silent Money Engineering - Feb 2026*
