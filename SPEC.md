# eatit – receptblogg med Hugo

Spec och förslag · 2026-09-30

## 1. Mål

- En statisk receptsida byggd med [Hugo](https://gohugo.io). Bara recept, inga vanliga blogginlägg.
- Sidan är på svenska (ett språk, ingen flerspråkighet).
- Gratis hosting på **GitHub Pages**.
- Bygge och deploy helt via **GitHub Actions**. En del av syftet är att lära sig Actions.
- Det ska vara **enkelt att lägga in och uppdatera recept**, helst utan att behöva öppna terminalen.

### Utanför scope (för nu)

- Kommentarer, inloggning, betalning eller andra dynamiska funktioner.
- Egen domän. Kan läggas till senare utan att något behöver byggas om.

## 2. Arkitektur i korthet

```
Markdown-recept  ──push/PR──►  GitHub repo  ──►  GitHub Actions  ──►  GitHub Pages
 (lokalt, i GitHub-webben                        (hugo build,          https://andreasgoude.github.io/eatit/
  eller via Pages CMS)                            tester, deploy)
```

- **Källkod:** ett publikt repo, `eatit`. GitHub Pages är gratis för publika repon.
- **Innehåll:** ett recept är en Markdown-fil med strukturerad front matter.
- **Bygge:** Hugo Extended, versionen låses i workflow-filen.
- **Publicering:** de officiella Pages-actions (`actions/deploy-pages`), inte en `gh-pages`-branch.

## 3. Val av theme

Flera Hugo-themes är byggda för recept:

| Theme | Styrkor | Att kontrollera |
|---|---|---|
| [Quiet Foodie](https://themes.gohugo.io/themes/quietfoodie) | Ren matbloggsdesign, schema.org Recipe-markup (ger bättre visning i Google), taggar och kategorier | Hur aktivt det underhålls, kompatibilitet med ny Hugo |
| [Hugo Cookbook](https://awesome.ecosyste.ms/projects/github.com%2Fderanjer%2Fhugo-cookbook) | Sök, fält för tid, kalorier och portioner, taggar | Äldre, kan kräva justeringar |
| [Cuisine Book](https://themes.gohugo.io/themes/hugo-cuisine-book) | Bokliknande layout, bra för en receptsamling | Mindre bloggkänsla |
| [GoChowdown](https://github.com/RMHogervorst/gochowdown) | Recept plus "komponenter" (t.ex. en sås som används i flera recept) | Minimalistiskt, äldre |

**Förslag:**

1. Gör en snabb spike: testa **Quiet Foodie** och **Cuisine Book** lokalt med 2–3 riktiga recept.
2. Välj det som ser bäst ut och bygger utan varningar på aktuell Hugo.
3. Installera temat som **Hugo Module** (kräver Go i CI) eller som **git submodule**. Submodule är enklast att börja med.
4. **Plan B:** välj ett allmänt, välskött theme (t.ex. PaperMod) och lägg till en egen `layouts/recipes/single.html` som renderar receptfälten. Det kräver mer eget arbete men ger full kontroll, och det är lärorikt.

Oavsett theme behåller vi **vår egen front matter-modell** (avsnitt 4). Då är det enkelt att byta theme senare, eftersom bara mallen behöver mappas om.

## 4. Innehållsmodell

### Struktur (page bundles, så att bilderna ligger ihop med receptet)

```
content/
  recipes/
    kanelbullar/
      index.md
      cover.jpg
    pasta-carbonara/
      index.md
      cover.jpg
archetypes/
  recipes.md        # mall för nya recept
```

### Front matter för ett recept

```yaml
---
title: "Kanelbullar"
date: 2026-09-30
draft: false
description: "Klassiska svenska kanelbullar med kardemumma."
image: cover.jpg
categories: ["Bakning"]
tags: ["fika", "jäst", "vegetariskt"]
servings: 30
prepTime: 45        # minuter
cookTime: 10
totalTime: 150
difficulty: "medel"
ingredients:
  - "50 g jäst"
  - "5 dl mjölk"
  - "150 g smör"
  - "1 dl socker"
  - "2 tsk kardemumma"
  - "ca 13 dl vetemjöl"
---

## Gör så här

1. Smält smöret, tillsätt mjölken ...
2. ...

## Tips

Frys in direkt efter att de har svalnat.
```

Ingredienserna ligger i front matter så att de kan renderas snyggt, skalas med portioner (se Nice-to-have) och exporteras som schema.org JSON-LD.

### Taxonomier

- `categories`: måltyp (Middag, Bakning, Dessert, Frukost ...)
- `tags`: fria taggar (vegetariskt, snabbt, glutenfritt ...)
- Kan utökas senare, t.ex. med `cuisine` (italienskt, thai ...).

## 5. Sätt att lägga in och uppdatera recept

Tre nivåer. Alla hamnar som commits i repot, så Actions sköter resten.

| Sätt | När | Hur |
|---|---|---|
| **A. Pages CMS** *(rekommenderas för vardagen)* | Från mobil eller dator, utan kod | [pagescms.org](https://pagescms.org) är gratis och loggar in med GitHub. Den läser en `.pages.yml` i repot och ger ett formulär med fält för titel, ingredienser, bild osv. Varje sparning blir en commit. |
| **B. GitHub-webben** | Snabba rättelser | Öppna filen på github.com, tryck på pennan och committa. Tryck `.` för att öppna github.dev (VS Code i webbläsaren). |
| **C. Lokalt** | Större ändringar, theme-arbete | `hugo new recipes/kanelbullar/index.md` skapar en fil från archetypen, `hugo server -D` ger förhandsvisning, sedan push. |

Alternativ till A är **Decap CMS** (kräver en OAuth-proxy, lite krångligare på GitHub Pages) eller VS Code-tillägget **Front Matter CMS** (bara lokalt).

**Förslag på arbetsflöde:** nya recept kan committas direkt till `main` för enkelhetens skull. Större ändringar görs som PR, så att CI hinner validera innan något publiceras.

## 6. GitHub Actions: planerade workflows

Det här är projektets "lekplats". Planen byggs upp stegvis, från enkelt till mer avancerat.

### 6.1 `deploy.yml`: bygg och publicera *(steg 1, måste ha)*

- **Trigger:** `push` till `main` och `workflow_dispatch` (manuell körning).
- **Jobb `build`:** checkout (med submodules) → installera Hugo Extended (låst version) → `hugo --minify --gc --baseURL "${{ steps.pages.outputs.base_url }}/"` → `actions/upload-pages-artifact`.
- **Jobb `deploy`:** `actions/deploy-pages` med `environment: github-pages`.
- **Behörigheter:** `pages: write`, `id-token: write`, `contents: read`.
- **`concurrency`:** så att bara en deploy körs åt gången.
- I repot: Settings → Pages → Source: **GitHub Actions**.

### 6.2 `ci.yml`: kontroll av pull requests *(steg 2)*

- **Trigger:** `pull_request`.
- Bygger med `hugo --panicOnWarning` så att trasiga mallar och shortcodes fångas.
- **Länkkontroll** med `lychee` mot det byggda `public/`.
- **Validering av front matter:** görs i Hugo (`layouts/partials/validate-recipe.html`) med `errorf`. Den kontrollerar `title`, `categories`, `ingredients`, `servings` och `difficulty`, och att bilden finns om `image` är satt. Eftersom kontrollen körs i själva bygget stoppar den även deployen och `hugo server` lokalt, inte bara PR:er.
- Eventuellt `markdownlint`.

### 6.3 Övrigt att testa *(steg 3, för lärandets skull)*

- **Dependabot** för `github-actions` (och Hugo-modulen), så att action-versioner hålls uppdaterade.
- **Schemalagd körning** (`schedule: cron`) varje vecka. Hugo publicerar inte inlägg med framtida `date` förrän sidan byggs om, så med schemat kan man tidsinställa recept.
- **Bildoptimering:** använd Hugos inbyggda image processing (resize och WebP) i mallarna i stället för en separat action. Enklast och gratis.
- **Lighthouse CI** mot den deployade sidan, som mäter prestanda och tillgänglighet.
- **Återanvändbar workflow** eller **composite action** för "setup Hugo", så att deploy och CI delar samma steg (bra övning i Actions-strukturer).
- **Release-taggar / changelog** är överkurs.

## 7. Nice-to-have (senare)

- **Sök** med Pagefind. Indexet genereras i Actions efter `hugo`-bygget och fungerar helt statiskt.
- **Portionsskalning** med lite JS som räknar om ingredienserna.
- **Utskriftsvänlig CSS** för receptsidor.
- **schema.org/Recipe JSON-LD**, om det valda temat saknar det.
- **Mörkt läge**, om temat inte redan har det.
- **Egen domän** via en `CNAME`-fil och DNS.

## 8. Genomförandeplan

| Fas | Innehåll | Klart när |
|---|---|---|
| 0 ✅ | Skapa repo, `hugo new site`, `.gitignore`, README | Sidan startar lokalt |
| 1 ✅ | Theme-spike (Quiet Foodie vs Cuisine Book), välj ett | 3 recept ser bra ut lokalt |
| 2 ✅ | Archetype för recept och front matter-modell | `hugo new recipes/x/index.md` ger en komplett mall |
| 3 ✅ | `deploy.yml` och aktivera Pages | Sidan är live på `github.io` |
| 4 ✅ | Pages CMS (`.pages.yml`) | Ett recept kan läggas in från mobilen |
| 5 ✅ | `ci.yml` (bygge, länkkontroll, front matter-validering) och Dependabot | PR:er får grön eller röd status |
| 6 ✅ | Pagefind-sök, schemalagd build, portionsskalning, Lighthouse CI | Sök i hela receptet, tidsinställda recept publiceras, mängderna räknas om vid ändrat antal portioner |

## 9. Beslut

| Fråga | Beslut |
|---|---|
| Namn | `eatit`, alltså `https://andreasgoude.github.io/eatit/` |
| Språk | Bara svenska (`languageCode = "sv-SE"`) |
| Innehåll | Bara recept, inga vanliga blogginlägg |
| Import av befintliga recept | Nej, vi börjar från noll med några exempelrecept |
| Bilder från CMS | Pages CMS har en gemensam mediamapp, `assets/images/`. Mallarna letar först efter bilden i receptets mapp och sedan i `assets/`, så båda sätten fungerar och Hugo optimerar bilden i båda fallen. |
| Sök | Pagefind ersätter temats FlexSearch, som bara sökte på titlar. Bara receptsidor indexeras (`data-pagefind-body`), och kategorierna blir filter. |
| Kvar från nice-to-have | Mörkt läge kom med Congo. Egen domän är inte gjord. Utskrifts-CSS och JSON-LD gjordes redan i fas 3. |
| Byte av theme (2026-09-30) | **Congo** ersatte Cuisine Book, som saknade mörkt läge och fick 66 i prestanda (1,3 MB per sida). PaperMod och Congo testades med de riktiga recepten. Båda fick 95–99 i prestanda med cirka 300 KB per sida. Congo valdes eftersom det bygger utan varningar (PaperMod gav två om föråldrade funktioner, vilket stoppar vår strikta CI), har svenska översättningar och en varmare färgpalett. Receptdelen gjordes samtidigt oberoende av temat. |
| Tidigare theme | **Cuisine Book**, som git submodule. Quiet Foodie bygger inte på Hugo 0.167 (det använder `.Site.Author`, som har tagits bort) och har inte uppdaterats sedan 2024. Cuisine Book underhålls och har sök. Receptlayout, svenska texter och JSON-LD ligger som egna overrides i `layouts/`. |
