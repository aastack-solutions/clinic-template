# Images for Zain Dental Clinic

Drop the files in this folder using **exactly** these names. Anything missing just
shows a branded placeholder, so you can add them one at a time.

| File | Used in | Crop | Suggested size | What to shoot |
|---|---|---|---|---|
| `hero.jpg` | Hero, main image | 4:5 portrait | 1200 x 1500 | The treatment room, or a dentist mid-appointment. The single most important photo. |
| `clinic-1.jpg` | Hero, small inset | 1:1 square | 900 x 900 | Reception desk / waiting area. |
| `clinic-2.jpg` | About section | 4:3 landscape | 1200 x 900 | Wide shot of the inside of the clinic. |
| `rct.jpg` | Services, root canal card | 16:10 landscape | 1200 x 750 | Chair set up for treatment, or the X-ray on screen. |
| `scaling.jpg` | Services, scaling card | 16:10 landscape | 1200 x 750 | Scaling instruments / clean-up in progress. |
| `dr-zain.jpg` | Our team | 4:5 portrait | 800 x 1000 | Dr. Zain, head and shoulders. |
| `dr-iqra.jpg` | Our team | 4:5 portrait | 800 x 1000 | Dr. Iqra, head and shoulders. |
| `dr-laiba.jpg` | Our team | 4:5 portrait | 800 x 1000 | Dr. Laiba, head and shoulders. |
| `xray.jpg` | Technology | 16:11 landscape | 1100 x 760 | The digital X-ray unit itself. |

## Rules

- Real photos of this clinic only. A phone camera near a window beats stock.
- Never use a stock photo for a doctor portrait. Leave the placeholder instead.
- Keep each file under ~500 KB. Next.js converts to AVIF/WebP automatically.
- Shoot landscape/portrait to match the Crop column so nothing important gets cut.

## Using a hosted URL instead

Any `https://` URL works in place of a local file, so a Google Business Profile
photo link can go straight into `content/clinic.json`:

```json
"image": { "src": "https://lh3.googleusercontent.com/...", "alt": "Reception at Zain Dental Clinic" }
```
