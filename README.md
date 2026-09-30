# eatit

En receptsida byggd med [Hugo](https://gohugo.io) och temat [Congo](https://github.com/jpanther/congo), med mörkt läge som följer systemet. Den publiceras på GitHub Pages:
**https://andreasgoude.github.io/eatit/**

Mer om bakgrunden och planen finns i [SPEC.md](SPEC.md).

## Lägga till ett recept

**Med Pages CMS (enklast, fungerar även i mobilen):** gå till [app.pagescms.org](https://app.pagescms.org), logga in med GitHub och välj `andreasgoude/eatit` → *Recept* → *Add an entry*. Fyll i formuläret och spara. Varje sparning blir en commit, och sidan uppdateras efter ungefär en minut. Uppladdade bilder hamnar i `assets/images/`. Formuläret definieras i [.pages.yml](.pages.yml).

**På GitHub (utan att installera något):** gå till `content/recipes/`, välj *Add file → Create new file* och skriv `mitt-recept/index.md` som filnamn. Kopiera in mallen från [archetypes/recipes.md](archetypes/recipes.md), fyll i den, sätt `draft: false` och committa. Sidan uppdateras automatiskt efter ungefär en minut.

**Lokalt:**

```bash
git clone --recurse-submodules https://github.com/andreasgoude/eatit.git
cd eatit
npm install                             # installerar Pagefind (sökningen)
hugo new recipes/mitt-recept/index.md   # skapar en fil från mallen
npm run dev                             # förhandsvisning med sök på http://localhost:1313/eatit/
```

`hugo server -D` fungerar också, men då saknas sökningen. Sökindexet byggs av Pagefind efter Hugo, och `npm run dev` gör båda stegen.

**Tidsinställa ett recept:** sätt `date` till en dag framåt i tiden. Sidan byggs om varje morgon, och receptet dyker upp på det datumet.

Lägg en bild i samma mapp som receptet, t.ex. `cover.jpg`, och skriv `image: cover.jpg` i front matter. Hugo beskär bilden och gör om den till WebP.

### Fält i ett recept

| Fält | Beskrivning |
|---|---|
| `title`, `description` | Namn och en kort beskrivning |
| `image` | Bildfilens namn i receptets mapp (valfritt) |
| `categories` | Måltyp, t.ex. `["Middag"]` |
| `tags` | Fria taggar, t.ex. `["vegetariskt", "snabbt"]` |
| `servings` | Antal portioner |
| `prepTime`, `cookTime`, `totalTime` | Tider i minuter |
| `difficulty` | `enkel`, `medel` eller `svår` |
| `ingredients` | En lista med en ingrediens per rad |
| `draft` | `true` döljer receptet på den publicerade sidan |

Själva instruktionerna skrivs i Markdown under front matter.

## Hur det fungerar

- En pull request kör [.github/workflows/ci.yml](.github/workflows/ci.yml): ett strikt bygge, validering av alla recept och kontroll av interna länkar.
- Ett recept som saknar obligatoriska fält stoppar bygget med ett tydligt fel, både lokalt och i Actions. Reglerna finns i `layouts/partials/validate-recipe.html`. Om deployen stoppas ligger den förra versionen av sidan kvar.
- Sökningen görs med [Pagefind](https://pagefind.app). Det söker i hela receptet (ingredienser och instruktioner), förstår svenska och kan filtrera på kategori. Indexet byggs i Actions efter Hugo.
- På receptsidorna kan man ändra antalet portioner, och då räknas mängderna om ([assets/js/servings.js](assets/js/servings.js)). Bara mängden i början av raden skalas, så t.ex. "(400 g)" längre in lämnas orört.
- Deployen körs också varje morgon kl 04:00 UTC, så att tidsinställda recept publiceras. Efter varje deploy mäter Lighthouse prestanda, tillgänglighet och SEO.
- Dependabot föreslår uppdateringar av actions, tema och Pagefind varje vecka.
- En push till `main` kör [.github/workflows/deploy.yml](.github/workflows/deploy.yml), som bygger sidan med Hugo och publicerar den på GitHub Pages.
- Temat ligger som git submodule i `themes/congo`. Receptdelen är vår egen och fungerar oberoende av temat: startsidan med rutnät, korten, receptsidan och JSON-LD för Google finns i `layouts/`, och stilarna i `assets/css/custom.css`. Färgerna tas från temats färgschema via `--r-*`-variabler, så ljust och mörkt läge fungerar automatiskt. Färgschemat byts med `colorScheme` i `hugo.toml`.
