# eatit

En receptsida byggd med [Hugo](https://gohugo.io) och temat [Cuisine Book](https://github.com/ntk148v/hugo-cuisine-book). Den publiceras på GitHub Pages:
**https://andreasgoude.github.io/eatit/**

Mer om bakgrunden och planen finns i [SPEC.md](SPEC.md).

## Lägga till ett recept

**Med Pages CMS (enklast, fungerar även i mobilen):** gå till [app.pagescms.org](https://app.pagescms.org), logga in med GitHub och välj `andreasgoude/eatit` → *Recept* → *Add an entry*. Fyll i formuläret och spara. Varje sparning blir en commit, och sidan uppdateras efter ungefär en minut. Uppladdade bilder hamnar i `assets/images/`. Formuläret definieras i [.pages.yml](.pages.yml).

**På GitHub (utan att installera något):** gå till `content/recipes/`, välj *Add file → Create new file* och skriv `mitt-recept/index.md` som filnamn. Kopiera in mallen från [archetypes/recipes.md](archetypes/recipes.md), fyll i den, sätt `draft: false` och committa. Sidan uppdateras automatiskt efter ungefär en minut.

**Lokalt:**

```bash
git clone --recurse-submodules https://github.com/andreasgoude/eatit.git
cd eatit
hugo new recipes/mitt-recept/index.md   # skapar en fil från mallen
hugo server -D                          # förhandsvisning på http://localhost:1313/eatit/
```

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

- En push till `main` kör [.github/workflows/deploy.yml](.github/workflows/deploy.yml), som bygger sidan med Hugo och publicerar den på GitHub Pages.
- Temat ligger som git submodule i `themes/hugo-cuisine-book`. Våra anpassningar (svenska texter, receptlayout, JSON-LD för Google) finns i `layouts/` och `assets/_custom.scss`.
